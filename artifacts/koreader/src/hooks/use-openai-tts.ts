import { useState, useRef, useCallback, useEffect } from 'react';
import { useSettings } from './use-settings';

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? '';

export function useOpenAITTS(language: string = 'zh') {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { ttsSpeed } = useSettings();

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
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

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.playbackRate = ttsSpeed;
      audioRef.current = audio;

      audio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { setIsPlaying(false); URL.revokeObjectURL(url); };

      setIsLoading(false);
      setIsPlaying(true);
      await audio.play();
    } catch (err) {
      console.error('OpenAI TTS error:', err);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [language, stop, ttsSpeed]);

  const toggle = useCallback((text?: string) => {
    if (isPlaying) {
      stop();
    } else if (text) {
      play(text);
    }
  }, [isPlaying, play, stop]);

  return { play, stop, toggle, isPlaying, isLoading };
}
