import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from './transitions';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-center"
      {...sceneTransitions.morphExpand}
    >
      <video
        src={`${import.meta.env.BASE_URL}videos/particles.mp4`}
        className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-lighten"
        autoPlay
        muted
        playsInline
      />
      
      <div className="relative z-10">
        <motion.div
          className="inline-block px-6 py-2 rounded-full border border-brand-sky/30 bg-brand-sky/10 backdrop-blur-sm mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={phase >= 1 ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="text-[1.5vw] font-sans tracking-widest uppercase text-brand-sky">Your Vocabulary</span>
        </motion.div>

        <div className="overflow-hidden">
          <motion.h2 
            className="text-[6.5vw] font-kr font-bold tracking-tighter text-white leading-none"
            initial={{ y: '100%', rotateX: -20, opacity: 0 }}
            animate={phase >= 2 ? { y: 0, rotateX: 0, opacity: 1 } : { y: '100%', rotateX: -20, opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'top' }}
          >
            Learn anywhere.
          </motion.h2>
        </div>

        <motion.p
          className="mt-8 text-[2.2vw] text-white/70 font-sans max-w-[50vw] mx-auto font-light leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Save words, build custom lists, and study offline. Your progress syncs beautifully.
        </motion.p>
      </div>
    </motion.div>
  );
}
