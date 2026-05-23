'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/Button';
import { FloatingBlobs } from '@/components/FloatingBlobs';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-dot-grid relative">
      <FloatingBlobs />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-10 rounded-[32px] max-w-sm w-full text-center flex flex-col items-center gap-5 border-white/20 dark:border-white/5"
      >
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
          <AlertCircle size={28} />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold font-display text-neutral-800 dark:text-white mb-2">404</h1>
          <h2 className="text-lg font-bold font-display text-neutral-700 dark:text-neutral-200">Page Not Found</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Button
          variant="premium"
          onClick={() => router.push('/')}
          leftIcon={<ArrowLeft size={16} />}
          className="w-full"
        >
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
}
