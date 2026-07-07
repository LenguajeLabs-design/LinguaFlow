import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { transitions } from './transitions';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),   // Text
      setTimeout(() => setPhase(2), 1500),  // Image
      setTimeout(() => setPhase(3), 2500),  // Highlights
      setTimeout(() => setPhase(4), 7000),  // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center px-[10vw] z-10"
      {...transitions.clipPolygon}
    >
      <div className="flex w-full items-center justify-between gap-12">
        <div className="w-1/2 relative z-10">
          <div className="overflow-hidden mb-6">
            <motion.h2 
              className="text-[5vw] font-display font-semibold leading-none tracking-tight"
              initial={{ y: '100%', rotateX: 20, opacity: 0 }}
              animate={phase >= 1 ? { y: 0, rotateX: 0, opacity: 1 } : { y: '100%', rotateX: 20, opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Real passages.
            </motion.h2>
          </div>
          <div className="overflow-hidden">
            <motion.h2 
              className="text-[5vw] font-display italic text-white/60 leading-none tracking-tight"
              initial={{ y: '100%', rotateX: 20, opacity: 0 }}
              animate={phase >= 1 ? { y: 0, rotateX: 0, opacity: 1 } : { y: '100%', rotateX: 20, opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Real language.
            </motion.h2>
          </div>

          <motion.div
            className="w-12 h-[2px] bg-[#d4af37] mt-10"
            initial={{ scaleX: 0, transformOrigin: "left" }}
            animate={phase >= 2 ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          <motion.p
            className="mt-10 text-[1.8vw] text-white/50 max-w-[30vw] font-light leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            No more textbook sentences. Read authentic articles, stories, and conversations curated to your exact level.
          </motion.p>
        </div>

        <div className="w-1/2 relative h-[60vh] flex justify-center items-center">
          <motion.div
            className="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm p-8"
            initial={{ opacity: 0, x: 50, rotateY: -10 }}
            animate={phase >= 2 ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: 50, rotateY: -10 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: 1000 }}
          >
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <motion.div 
                    className="h-6 bg-white/10 rounded"
                    style={{ width: `${Math.max(40, Math.random() * 100)}%` }}
                    initial={{ scaleX: 0, transformOrigin: "left" }}
                    animate={phase >= 2 ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ duration: 0.8, delay: 1.5 + (i * 0.1), ease: "easeOut" }}
                  />
                  {i % 2 === 0 && (
                    <motion.div 
                      className="h-6 bg-[#d4af37]/30 rounded"
                      style={{ width: `${Math.max(20, Math.random() * 40)}%` }}
                      initial={{ scaleX: 0, transformOrigin: "left" }}
                      animate={phase >= 3 ? { scaleX: 1 } : { scaleX: 0 }}
                      transition={{ duration: 0.8, delay: 2.5 + (i * 0.2), ease: "easeOut" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}