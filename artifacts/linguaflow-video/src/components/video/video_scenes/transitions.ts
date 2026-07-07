import { motion } from 'framer-motion';

export const sceneTransitions = {
  clipCircle: {
    initial: { clipPath: 'circle(0% at 50% 50%)' },
    animate: { clipPath: 'circle(150% at 50% 50%)' },
    exit: { opacity: 0 },
    transition: { duration: 1.5, ease: [0.76, 0, 0.24, 1] }
  },
  clipPolygon: {
    initial: { clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' },
    animate: { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
    exit: { opacity: 0, scale: 1.05 },
    transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] }
  },
  morphExpand: {
    initial: { scale: 0.8, opacity: 0, filter: 'blur(20px)' },
    animate: { scale: 1, opacity: 1, filter: 'blur(0px)' },
    exit: { scale: 1.2, opacity: 0, filter: 'blur(20px)' },
    transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] }
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.8 }
  }
};

export const transitions = {
  ...sceneTransitions,
  fadeScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
  }
};

export const textReveal = {
  initial: { y: 100, opacity: 0, rotateX: -20 },
  animate: { y: 0, opacity: 1, rotateX: 0 },
  transition: { type: 'spring', stiffness: 200, damping: 20 }
};
