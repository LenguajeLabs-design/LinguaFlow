import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = {
  open: 7000,
  feature1: 9000,
  feature2: 10000,
  feature3: 11000,
  close: 8000
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#030712] text-white font-sans">
      
      {/* Persistent Background Layer */}
      <div className="absolute inset-0 z-0">
        <video 
          src={`${import.meta.env.BASE_URL}videos/dark-particles.mp4`}
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Persistent gradient wash overlay */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen"
        animate={{
          background: [
            'radial-gradient(circle at 0% 0%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 100% 100%, rgba(212, 175, 55, 0.1) 0%, transparent 60%)',
            'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 0% 100%, rgba(212, 175, 55, 0.1) 0%, transparent 60%)',
            'radial-gradient(circle at 100% 0%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)',
          ][currentScene]
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="open" />}
        {currentScene === 1 && <Scene2 key="feature1" />}
        {currentScene === 2 && <Scene3 key="feature2" />}
        {currentScene === 3 && <Scene4 key="feature3" />}
        {currentScene === 4 && <Scene5 key="close" />}
      </AnimatePresence>
    </div>
  );
}