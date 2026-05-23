'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const FloatingBlobs: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-dot-grid opacity-80" />

      {/* Blob 1: Purple Gradient */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-violet-500/20 dark:bg-violet-600/10 blur-[100px] animate-float-slow animate-pulse-slow"
        style={{ animationDelay: '0s' }}
      />

      {/* Blob 2: Pink Gradient */}
      <div
        className="absolute top-[35%] -right-[10%] w-[45vw] h-[45vw] max-w-[450px] max-h-[450px] rounded-full bg-pink-500/20 dark:bg-pink-600/10 blur-[90px] animate-float-medium animate-pulse-slow"
        style={{ animationDelay: '2s' }}
      />

      {/* Blob 3: Cyan Gradient */}
      <div
        className="absolute -bottom-[15%] left-[20%] w-[48vw] h-[48vw] max-w-[480px] max-h-[480px] rounded-full bg-cyan-500/15 dark:bg-cyan-600/8 blur-[110px] animate-float-slow animate-pulse-slow"
        style={{ animationDelay: '4s' }}
      />

      {/* Subtle radial center highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--background))_80%)] opacity-60" />
    </div>
  );
};

export default FloatingBlobs;
