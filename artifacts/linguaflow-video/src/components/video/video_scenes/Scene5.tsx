import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { transitions } from './transitions';
import logoImg from '@assets/linguaflow-badge_1783378580677.png';
import visionImg from '@assets/linguaflow-vision_1783378580678.png';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3500),
      setTimeout(() => setPhase(4), 6000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10"
      {...transitions.clipPolygon}
    >
      <motion.img
        src={visionImg}
        className="absolute inset-0 w-full h-full object-cover opacity-20"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: "linear" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/80 to-transparent" />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className="w-[12vw] h-[12vw] mb-12 flex items-center justify-center rounded-[2.5vw] bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_80px_rgba(212,175,55,0.15)]"
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={phase >= 1 ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.8, rotate: -10 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <img src={logoImg} alt="LinguaFlow Logo" className="w-[8vw] h-[8vw] object-contain opacity-90" />
        </motion.div>

        <div className="overflow-hidden mb-4">
          <motion.h1 
            className="text-[6vw] font-display font-semibold tracking-tight text-white leading-none"
            initial={{ y: '100%', opacity: 0 }}
            animate={phase >= 2 ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            LinguaFlow
          </motion.h1>
        </div>

        <motion.div
          className="h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"
          initial={{ width: 0, opacity: 0 }}
          animate={phase >= 3 ? { width: '40vw', opacity: 1 } : { width: 0, opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        <motion.p
          className="mt-6 text-[1.8vw] text-white/70 font-sans tracking-[0.2em] font-light uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        >
          Start reading today
        </motion.p>
      </div>
    </motion.div>
  );
}