import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { transitions } from './transitions';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => setPhase(4), 4500),
      setTimeout(() => setPhase(5), 8000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      {...transitions.clipCircle}
    >
      <div className="absolute inset-0 bg-[#030712] z-0" />
      <video
        src={`${import.meta.env.BASE_URL}videos/dark-ink.mp4`}
        className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen z-0"
        autoPlay
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60 z-0" />

      <div className="relative z-10 w-[80vw] flex flex-col items-center">
        <div className="relative mb-16 h-[20vh] flex items-center justify-center w-full">
          <motion.div 
            className="text-[6vw] font-display tracking-wide"
            initial={{ filter: 'blur(10px)', opacity: 0, scale: 0.9 }}
            animate={phase >= 1 ? { filter: 'blur(0px)', opacity: 1, scale: 1 } : { filter: 'blur(10px)', opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            Espléndido
          </motion.div>

          <motion.div
            className="absolute -bottom-8 bg-[#d4af37] text-black px-6 py-2 rounded shadow-[0_4px_30px_rgba(212,175,55,0.4)]"
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={phase >= 3 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <span className="font-semibold tracking-wide uppercase text-[1.2vw]">Splendid / Magnificent</span>
          </motion.div>

          {/* Cursor tapping */}
          <motion.div
            className="absolute w-8 h-8 rounded-full bg-white/50 border-2 border-white pointer-events-none"
            initial={{ opacity: 0, x: 100, y: 100, scale: 2 }}
            animate={
              phase >= 2 
                ? { opacity: [0, 1, 0], x: [100, 0, 0], y: [100, 20, 20], scale: [2, 1, 1.5] } 
                : { opacity: 0, x: 100, y: 100, scale: 2 }
            }
            transition={{ duration: 1.5, times: [0, 0.7, 1] }}
          />
        </div>

        <div className="text-center overflow-hidden">
          <motion.h2 
            className="text-[4.5vw] font-sans font-semibold tracking-tight text-white leading-none"
            initial={{ y: '100%', opacity: 0 }}
            animate={phase >= 4 ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            Tap any word.
          </motion.h2>
        </div>
        <div className="text-center overflow-hidden mt-4">
          <motion.h2 
            className="text-[4vw] font-display italic text-[#d4af37] leading-none"
            initial={{ y: '100%', opacity: 0 }}
            animate={phase >= 4 ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Instant meaning.
          </motion.h2>
        </div>
      </div>
    </motion.div>
  );
}