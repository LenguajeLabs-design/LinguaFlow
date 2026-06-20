import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from './transitions';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full flex items-center justify-center"
      {...sceneTransitions.morphExpand}
    >
      <video
        src={`${import.meta.env.BASE_URL}videos/ink_flow.mp4`}
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        autoPlay
        muted
        playsInline
      />
      
      <div className="relative z-10 text-center flex flex-col items-center">
        <div className="overflow-hidden">
          <motion.h1 
            className="text-[6vw] font-display italic tracking-tight leading-tight text-white/90"
            initial={{ y: '100%' }}
            animate={phase >= 1 ? { y: 0 } : { y: '100%' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            Language learning
          </motion.h1>
        </div>
        
        <div className="overflow-hidden mt-4">
          <motion.h2
            className="text-[8vw] font-kr font-bold tracking-tighter text-gradient leading-none"
            initial={{ y: '100%', opacity: 0 }}
            animate={phase >= 2 ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Reimagined.
          </motion.h2>
        </div>
      </div>
      
      <motion.div 
        className="absolute bottom-[10vh] left-1/2 -translate-x-1/2 w-[1px] bg-brand-sky"
        initial={{ height: 0, opacity: 0 }}
        animate={phase >= 1 ? { height: '10vh', opacity: 0.5 } : { height: 0, opacity: 0 }}
        transition={{ duration: 1.5, delay: 1 }}
      />
    </motion.div>
  );
}
