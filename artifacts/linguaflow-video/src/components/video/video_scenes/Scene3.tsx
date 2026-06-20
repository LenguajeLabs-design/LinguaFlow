import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from './transitions';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 4500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full flex items-center justify-end px-[10vw]"
      {...sceneTransitions.clipCircle}
    >
      <div className="absolute inset-0 z-0 bg-[#020617]" />
      
      <motion.img
        src={`${import.meta.env.BASE_URL}images/korean_landscape.png`}
        className="absolute left-0 top-0 w-[60%] h-full object-cover opacity-60"
        initial={{ scale: 1.1, x: '-5%' }}
        animate={{ scale: 1, x: '0%' }}
        transition={{ duration: 6, ease: "linear" }}
      />
      
      {/* Dark gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#020617]/80 to-[#020617] z-10" />

      <div className="relative z-20 w-full max-w-[45vw] flex flex-col items-start text-left">
        <motion.div className="flex gap-4 mb-6">
          {['Read.', 'Listen.', 'Track.'].map((word, i) => (
            <motion.span
              key={word}
              className="text-[1.8vw] font-display italic text-brand-teal"
              initial={{ opacity: 0, y: 20 }}
              animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: phase >= 1 ? i * 0.2 : 0, ease: "easeOut" }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
        
        <div className="overflow-hidden">
          <motion.h2 
            className="text-[4.5vw] font-kr font-bold tracking-tight text-white leading-[1.1]"
            initial={{ y: '100%', opacity: 0 }}
            animate={phase >= 2 ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            Native Audio.
          </motion.h2>
        </div>
        
        <div className="overflow-hidden">
          <motion.h2 
            className="text-[4.5vw] font-kr font-bold tracking-tight text-white/50 leading-[1.1]"
            initial={{ y: '100%', opacity: 0 }}
            animate={phase >= 3 ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            Complete Control.
          </motion.h2>
        </div>

        <motion.p
          className="mt-8 text-[1.8vw] text-white/80 font-sans font-light leading-relaxed border-l-2 border-brand-violet pl-6"
          initial={{ opacity: 0, x: -20 }}
          animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          High-fidelity TTS with pause, resume, and rewind. Master pronunciation at your own pace.
        </motion.p>
      </div>
    </motion.div>
  );
}
