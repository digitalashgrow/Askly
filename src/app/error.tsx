'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/Button';
import { FloatingBlobs } from '@/components/FloatingBlobs';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-dot-grid relative">
      <FloatingBlobs />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-10 rounded-[32px] max-w-sm w-full text-center flex flex-col items-center gap-5 border-white/20 dark:border-white/5"
      >
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
          <AlertTriangle size={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-neutral-800 dark:text-white">Something went wrong</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
            An unexpected error occurred. Please try again.
          </p>
        </div>
        <Button
          variant="premium"
          onClick={reset}
          leftIcon={<RefreshCw size={16} />}
          className="w-full"
        >
          Try Again
        </Button>
      </motion.div>
    </div>
  );
}
