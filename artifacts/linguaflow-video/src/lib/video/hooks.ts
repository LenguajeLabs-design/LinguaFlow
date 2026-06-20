import { useEffect, useState } from 'react';

declare global {
  interface Window {
    startRecording?: () => void;
    stopRecording?: () => void;
  }
}

export function useVideoPlayer({ durations }: { durations: Record<string, number> }) {
  const [currentScene, setCurrentScene] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  
  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      if (window.startRecording) {
        window.startRecording();
      }
    }
  }, [hasStarted]);

  useEffect(() => {
    const sceneKeys = Object.keys(durations);
    const duration = durations[sceneKeys[currentScene]];

    const timer = setTimeout(() => {
      const nextScene = currentScene + 1;
      if (nextScene >= sceneKeys.length) {
        if (window.stopRecording) {
          window.stopRecording();
        }
        setCurrentScene(0);
      } else {
        setCurrentScene(nextScene);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [currentScene, durations]);

  return { currentScene };
}
