import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = {
  open: 5000,
  feature1: 6000,
  feature2: 6000,
  feature3: 6000,
  close: 8000
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans selection:bg-brand-teal/30">
      
      {/* Persistent gradient wash overlay */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen"
        animate={{
          background: [
            'radial-gradient(circle at 0% 0%, #14b8a6 0%, transparent 50%)',
            'radial-gradient(circle at 100% 100%, #818cf8 0%, transparent 50%)',
            'radial-gradient(circle at 50% 50%, #38bdf8 0%, transparent 50%)',
            'radial-gradient(circle at 0% 100%, #14b8a6 0%, transparent 50%)',
            'radial-gradient(circle at 100% 0%, #818cf8 0%, transparent 50%)',
          ][currentScene]
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      
      {/* Persistent floating particles/shapes for depth */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute w-[40vw] h-[40vw] rounded-full blur-[100px] opacity-20 bg-brand-violet"
          animate={{
            x: ['10vw', '50vw', '80vw', '30vw', '50vw'][currentScene],
            y: ['20vh', '60vh', '10vh', '80vh', '50vh'][currentScene],
            scale: [1, 1.5, 0.8, 1.2, 1][currentScene],
          }}
          transition={{ duration: 3, ease: [0.25, 1, 0.5, 1] }}
        />
        <motion.div
          className="absolute w-[30vw] h-[30vw] rounded-full blur-[80px] opacity-20 bg-brand-teal"
          animate={{
            x: ['70vw', '20vw', '10vw', '80vw', '50vw'][currentScene],
            y: ['60vh', '10vh', '80vh', '20vh', '50vh'][currentScene],
            scale: [1.2, 0.9, 1.5, 1, 1][currentScene],
          }}
          transition={{ duration: 2.5, ease: [0.25, 1, 0.5, 1] }}
        />
      </div>

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
