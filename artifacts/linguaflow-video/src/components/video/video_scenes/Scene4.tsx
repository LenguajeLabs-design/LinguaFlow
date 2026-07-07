import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { transitions } from './transitions';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3500),
      setTimeout(() => setPhase(4), 9000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-end px-[10vw] z-10"
      {...transitions.fadeScale}
    >
      <div className="absolute inset-0 z-0 bg-[#030712]" />
      
      {/* Abstract Background pattern */}
      <motion.div
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
        initial={{ y: 0 }}
        animate={{ y: -40 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      <div className="absolute left-[10vw] w-[40vw] h-[70vh] flex justify-center items-center z-10">
        <div className="relative w-full h-full flex items-center justify-center perspective-[1000px]">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[20vw] h-[30vh] bg-black border border-[#d4af37]/30 rounded-xl flex items-center justify-center shadow-2xl backdrop-blur-md"
              initial={{ opacity: 0, z: -500, y: 100 }}
              animate={phase >= 2 ? { 
                opacity: 1 - (i * 0.15), 
                z: -i * 100, 
                y: -i * 30,
                x: -i * 10,
                rotateZ: -i * 2
              } : { opacity: 0, z: -500, y: 100 }}
              transition={{ duration: 1.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              {i === 0 && (
                <div className="text-center">
                  <div className="text-[2.5vw] font-display text-white mb-2">vocabulario</div>
                  <div className="text-[1vw] text-white/50 uppercase tracking-widest">vocabulary</div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="w-[45vw] relative z-20 text-right">
        <div className="overflow-hidden mb-4">
          <motion.h2 
            className="text-[5.5vw] font-display font-semibold leading-none tracking-tight text-white"
            initial={{ y: '100%', opacity: 0 }}
            animate={phase >= 1 ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Build vocabulary
          </motion.h2>
        </div>
        <div className="overflow-hidden">
          <motion.h2 
            className="text-[5.5vw] font-display italic text-[#d4af37] leading-none tracking-tight"
            initial={{ y: '100%', opacity: 0 }}
            animate={phase >= 1 ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            that sticks.
          </motion.h2>
        </div>

        <motion.p
          className="mt-8 text-[1.8vw] text-white/50 font-light leading-relaxed ml-auto max-w-[30vw]"
          initial={{ opacity: 0, x: 20 }}
          animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Every word you tap is saved. Review them in context with spaced repetition.
        </motion.p>
      </div>
    </motion.div>
  );
}