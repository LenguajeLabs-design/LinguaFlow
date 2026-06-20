import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from './transitions';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black"
      {...sceneTransitions.clipPolygon}
    >
      <video
        src={`${import.meta.env.BASE_URL}videos/dreamy_waves.mp4`}
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        autoPlay
        muted
        playsInline
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80" />

      <div className="relative z-10 flex flex-col items-center">
        <motion.img
          src={`${import.meta.env.BASE_URL}images/lingua_icon.png`}
          className="w-[12vw] h-[12vw] rounded-[3vw] shadow-[0_0_80px_rgba(56,189,248,0.3)] mb-10"
          initial={{ scale: 0, rotate: -15, opacity: 0 }}
          animate={phase >= 1 ? { scale: 1, rotate: 0, opacity: 1 } : { scale: 0, rotate: -15, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />
        
        <div className="overflow-hidden">
          <motion.h1 
            className="text-[6vw] font-kr font-bold tracking-tight text-white leading-none"
            initial={{ y: '100%', opacity: 0 }}
            animate={phase >= 2 ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            LinguaFlow
          </motion.h1>
        </div>

        <motion.div
          className="mt-6 text-[1.8vw] text-white/60 font-sans tracking-wide font-light"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          Master Korean & Chinese
        </motion.div>
      </div>
    </motion.div>
  );
}
