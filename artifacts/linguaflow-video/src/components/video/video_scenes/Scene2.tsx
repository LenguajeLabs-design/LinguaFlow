import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from './transitions';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 4000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full flex items-center justify-start px-[10vw]"
      {...sceneTransitions.clipPolygon}
    >
      <video
        src={`${import.meta.env.BASE_URL}videos/dreamy_waves.mp4`}
        className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen"
        autoPlay
        muted
        playsInline
      />
      
      <div className="relative z-10 w-full max-w-[60vw]">
        <motion.div
          className="w-16 h-[2px] bg-brand-teal mb-8"
          initial={{ scaleX: 0, originX: 0 }}
          animate={phase >= 1 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        <div className="overflow-hidden">
          <motion.h2 
            className="text-[5vw] font-kr font-bold tracking-tight text-white leading-[1.1]"
            initial={{ y: '100%', rotateX: 45, opacity: 0 }}
            animate={phase >= 1 ? { y: 0, rotateX: 0, opacity: 1 } : { y: '100%', rotateX: 45, opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'bottom' }}
          >
            Master Korean<br/>
            <span className="text-brand-violet italic font-display font-normal">& Chinese</span>
          </motion.h2>
        </div>

        <motion.p
          className="mt-8 text-[2vw] text-white/70 font-sans max-w-[40vw] font-light leading-relaxed"
          initial={{ opacity: 0, x: -30 }}
          animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Immerse yourself in personalized stories, instantly graded to your reading level by AI.
        </motion.p>
      </div>
      
      <motion.div 
        className="absolute right-[10vw] top-1/2 -translate-y-1/2 text-[20vw] font-kr font-black text-white/[0.03] select-none"
        initial={{ x: 100, opacity: 0 }}
        animate={phase >= 1 ? { x: 0, opacity: 1 } : { x: 100, opacity: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        이야기
      </motion.div>
    </motion.div>
  );
}
