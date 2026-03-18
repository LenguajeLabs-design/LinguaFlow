import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettings } from './use-settings';

export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused]  = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { ttsSpeed } = useSettings();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const play = useCallback((text: string) => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang  = 'ko-KR';
    utterance.rate  = ttsSpeed;
    utterance.pitch = 1;
    const voices  = window.speechSynthesis.getVoices();
    const koVoice = voices.find(v => v.lang === 'ko-KR' || v.lang === 'ko_KR');
    if (koVoice) utterance.voice = koVoice;
    utterance.onstart  = () => { setIsPlaying(true);  setIsPaused(false); };
    utterance.onend    = () => { setIsPlaying(false); setIsPaused(false); };
    utterance.onerror  = () => { setIsPlaying(false); setIsPaused(false); };
    utterance.onpause  = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, ttsSpeed]);

  const pause  = useCallback(() => { if (isSupported) window.speechSynthesis.pause(); }, [isSupported]);
  const resume = useCallback(() => { if (isSupported) window.speechSynthesis.resume(); }, [isSupported]);
  const stop   = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, [isSupported]);

  const toggle = useCallback((text?: string) => {
    if (isPlaying) {
      isPaused ? resume() : pause();
    } else if (text) {
      play(text);
    }
  }, [isPlaying, isPaused, play, pause, resume]);

  return { play, pause, resume, stop, toggle, isPlaying, isPaused, isSupported };
}
