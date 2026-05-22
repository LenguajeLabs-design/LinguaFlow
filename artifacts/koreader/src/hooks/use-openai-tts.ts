import { useState, useRef, useCallback, useEffect } from 'react';
import { useSettings } from './use-settings';

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? '';

export function useOpenAITTS(language: string = 'zh') {
  const [isPlaying, setIsPlaying]   = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]     = useState(0);
  const [hasAudio, setHasAudio]     = useState(false);

  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const tickRef     = useRef<number | null>(null);
  const blobUrlRef  = useRef<string | null>(null);
  const { ttsSpeed } = useSettings();

  const stopTick = () => {
    if (tickRef.current !== null) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const startTick = (audio: HTMLAudioElement) => {
    stopTick();
    tickRef.current = window.setInterval(() => {
      setCurrentTime(audio.currentTime);
      setDuration(isFinite(audio.duration) ? audio.duration : 0);
    }, 200);
  };

  useEffect(() => {
    return () => {
      stopTick();
      audioRef.current?.pause();
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const stop = useCallback(() => {
    stopTick();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentTime(0);
    setDuration(0);
    setHasAudio(false);
  }, []);

  const pause = useCallback(() => {
    if (!audioRef.current || !isPlaying) return;
    audioRef.current.pause();
    stopTick();
    setIsPlaying(false);
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (!audioRef.current || isPlaying) return;
    audioRef.current.play().catch(() => {});
    startTick(audioRef.current);
    setIsPlaying(true);
  }, [isPlaying]);

  const rewind = useCallback((seconds = 10) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - seconds);
    setCurrentTime(audioRef.current.currentTime);
  }, []);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(time, audioRef.current.duration || 0));
    setCurrentTime(audioRef.current.currentTime);
  }, []);

  const play = useCallback(async (text: string) => {
    stop();
    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
        credentials: 'include',
      });

      if (!res.ok) throw new Error(`TTS request failed: ${res.status}`);

      const blob    = await res.blob();
      const url     = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const audio   = new Audio(url);
      audio.playbackRate = ttsSpeed;
      audioRef.current   = audio;

      audio.onloadedmetadata = () => {
        setDuration(isFinite(audio.duration) ? audio.duration : 0);
      };
      audio.onended = () => {
        stopTick();
        setIsPlaying(false);
        setCurrentTime(0);
      };
      audio.onerror = () => {
        stop();
      };

      setIsLoading(false);
      setHasAudio(true);
      setIsPlaying(true);
      startTick(audio);
      await audio.play();
    } catch (err) {
      console.error('OpenAI TTS error:', err);
      stop();
    }
  }, [language, stop, ttsSpeed]);

  const toggle = useCallback((text?: string) => {
    if (isPlaying) {
      pause();
    } else if (hasAudio && audioRef.current) {
      resume();
    } else if (text) {
      play(text);
    }
  }, [isPlaying, hasAudio, pause, resume, play]);

  return { play, pause, resume, stop, rewind, seek, toggle, isPlaying, isLoading, hasAudio, currentTime, duration };
}
