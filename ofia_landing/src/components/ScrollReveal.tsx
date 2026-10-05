'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'zoom-in' | 'parallax';
  delay?: number;
  className?: string;
  duration?: number;
}

export default function ScrollReveal({ 
  children, 
  animation = 'fade-up', 
  delay = 0, 
  className = '',
  duration = 0.6
}: ScrollRevealProps) {
  
  const variants = {
    hidden: {
      opacity: 0,
      y: animation === 'fade-up' ? 40 : 0,
      x: animation === 'slide-left' ? 40 : animation === 'slide-right' ? -40 : 0,
      scale: animation === 'zoom-in' ? 0.9 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: duration,
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98] as const, // Custom ease-out cubic
      }
    }
  };

  return (
    <motion.div 
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
