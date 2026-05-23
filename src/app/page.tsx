'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, MessageCircle, Share2, Shield, Heart, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { FloatingBlobs } from '@/components/FloatingBlobs';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LandingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [availability, setAvailability] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle');
  const [errorText, setErrorText] = useState('');

  // Debounced username checker
  useEffect(() => {
    if (!username) {
      setAvailability('idle');
      setErrorText('');
      return;
    }

    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

    if (cleanUsername.length < 3) {
      setAvailability('invalid');
      setErrorText('Must be at least 3 characters');
      return;
    }

    setIsChecking(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        // Skip real query if Supabase credentials are not yet configured
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
          setAvailability('available');
          setErrorText('');
          setIsChecking(false);
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (error) {
          // Silently treat errors as available so UI remains functional
          setAvailability('available');
          setErrorText('');
          return;
        }

        if (data) {
          setAvailability('taken');
          setErrorText('Already claimed');
        } else {
          setAvailability('available');
          setErrorText('');
        }
      } catch {
        // Silently ignore — likely no Supabase credentials configured yet
        setAvailability('available');
      } finally {
        setIsChecking(false);
      }
    }, 450); // 450ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [username, supabase]);

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (availability === 'available') {
      router.push(`/login?username=${username.toLowerCase().trim()}`);
    }
  };

  const features = [
    {
      icon: <MessageCircle className="text-violet-500" size={24} />,
      title: 'Honest Questions',
      description: 'Receive anonymous feedback, secrets, and questions from your followers.',
    },
    {
      icon: <Share2 className="text-pink-500" size={24} />,
      title: 'Instagram Export',
      description: 'Convert any question into an ultra-aesthetic 9:16 gradient story card ready for sharing.',
    },
    {
      icon: <Shield className="text-cyan-500" size={24} />,
      title: 'Smart Moderation',
      description: 'Real-time spam protection and profanity filters ensure a clean and positive vibe.',
    },
  ];

  const floatingMessages = [
    { y: -40, x: -180, delay: 0, content: 'What is your absolute favorite color? 💜' },
    { y: 80, x: 200, delay: 1, content: 'Give me your secret productivity hack! 🚀' },
    { y: -120, x: 160, delay: 2, content: 'Are you working on anything new? 👀' },
  ];

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-hidden bg-dot-grid">
      <FloatingBlobs />

      {/* Floating Theme Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Hero Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl premium-gradient flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-500/10">
            A
          </div>
          <span className="font-extrabold text-xl tracking-tight font-display text-neutral-800 dark:text-white">
            Ask<span className="premium-text-gradient">ly</span>
          </span>
        </div>

        <Button
          variant="glass"
          size="sm"
          onClick={() => router.push('/login')}
          className="rounded-xl"
        >
          Sign In
        </Button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12 py-12 lg:py-24 z-10">
        {/* Left: Headline & Claim form */}
        <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start max-w-xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel border-purple-500/20 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-6 shadow-sm"
          >
            <Sparkles size={12} className="animate-spin-slow" />
            Join the Next-Gen Anonymous Social App
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display leading-[1.1] mb-6"
          >
            Get honest questions. <br />
            <span className="premium-text-gradient">Anonymously.</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-lg text-neutral-500 dark:text-neutral-400 font-medium mb-10 max-w-lg"
          >
            Create your unique link, share it on your Instagram story or bio, and gather anonymous questions from your fans with beautiful aesthetic visuals.
          </motion.p>

          {/* Username Claim Flow */}
          <motion.form
            onSubmit={handleClaim}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="w-full max-w-md flex flex-col gap-3"
          >
            <div className="relative flex items-center">
              <span className="absolute left-5 text-lg font-bold text-neutral-400 dark:text-neutral-500">
                askly.app/
              </span>
              <input
                type="text"
                placeholder="yourname"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full pl-[98px] pr-12 py-4 rounded-2xl glass-input font-bold text-neutral-800 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 text-lg shadow-inner shadow-black/5"
              />

              {/* Status indicator inside input */}
              <div className="absolute right-4">
                {isChecking && (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500/20 border-t-purple-500" />
                )}
                {!isChecking && availability === 'available' && (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
                {!isChecking && (availability === 'taken' || availability === 'invalid') && (
                  <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white" title={errorText}>
                    <AlertCircle size={12} strokeWidth={3} />
                  </div>
                )}
              </div>
            </div>

            {/* Availability Helper Labels */}
            <div className="h-6 pl-2">
              <AnimatePresence mode="wait">
                {availability === 'available' && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-xs font-bold text-emerald-500"
                  >
                    🎉 That awesome username is available!
                  </motion.p>
                )}
                {availability === 'taken' && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-xs font-bold text-rose-500"
                  >
                    😢 Shucks! Username already claimed by someone else.
                  </motion.p>
                )}
                {availability === 'invalid' && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-xs font-bold text-rose-400"
                  >
                    ⚠️ {errorText}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <Button
              type="submit"
              variant="premium"
              disabled={availability !== 'available' || isChecking}
              rightIcon={<ChevronRight size={18} />}
              className="py-4 font-bold text-lg rounded-2xl"
            >
              Claim My Link
            </Button>
          </motion.form>
        </div>

        {/* Right: Mock Phone UI Demo */}
        <div className="flex-1 flex justify-center items-center relative py-12 w-full max-w-sm">
          {/* Floating animated mock messages surrounding the phone */}
          {floatingMessages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: msg.y + 20, scale: 0.9 }}
              animate={{ opacity: 0.9, y: msg.y, scale: 1 }}
              transition={{ delay: 0.4 + msg.delay * 0.2, duration: 0.5, type: 'spring' }}
              className="absolute hidden md:block max-w-[200px] p-3 rounded-2xl glass-panel border-white/20 dark:border-white/5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 shadow-md backdrop-blur-lg pointer-events-none"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', marginTop: msg.y, marginLeft: msg.x }}
            >
              {msg.content}
            </motion.div>
          ))}

          {/* Premium Glass Phone Frame Mock */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.3 }}
            className="w-[280px] h-[520px] rounded-[42px] border-[6px] border-neutral-800 dark:border-neutral-700 bg-neutral-950 p-3 shadow-2xl relative overflow-hidden"
          >
            {/* Camera notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-neutral-800 rounded-b-xl z-20" />

            {/* Inner Phone Screen Content */}
            <div className="w-full h-full rounded-[32px] bg-[#0c0919] p-4 flex flex-col justify-between relative overflow-hidden bg-dot-grid">
              {/* Profile details */}
              <div className="flex flex-col items-center mt-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 via-pink-500 to-amber-400 p-0.5 mb-2.5">
                  <div className="w-full h-full rounded-full bg-[#0c0919] flex items-center justify-center">
                    <span className="font-extrabold text-sm text-pink-400">@username</span>
                  </div>
                </div>
                <h4 className="text-white text-xs font-bold font-display">Sophia Martinez</h4>
                <p className="text-[10px] text-neutral-400 mt-0.5">Send a message! 👇</p>
              </div>

              {/* Message Box Card */}
              <div className="glass-panel border-white/10 p-3 rounded-2xl flex flex-col gap-2 shadow-lg mb-6 bg-white/5">
                <p className="text-[10px] font-extrabold text-purple-400/80 uppercase tracking-widest text-center">
                  send me anonymous messages
                </p>
                <div className="bg-neutral-900/60 rounded-xl p-2 min-h-[75px] text-[10px] text-neutral-400 font-medium">
                  Write your secret message here...
                </div>
                <div className="flex justify-between items-center text-[8px] text-neutral-500 font-bold px-1">
                  <span>😀 Quick Emojis</span>
                  <span>0/300</span>
                </div>
                <button
                  type="button"
                  className="w-full py-2 rounded-xl text-[10px] font-extrabold bg-pink-600 text-white flex items-center justify-center gap-1 cursor-default shadow-sm"
                >
                  Send Anonymously <Heart size={10} fill="currentColor" />
                </button>
              </div>

              {/* Floating card demo bottom */}
              <div className="w-full py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center gap-1.5">
                <span className="text-[8px] text-neutral-400 font-semibold">100% Anonymous & Secure</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Feature Section */}
      <section className="w-full max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-6 z-10">
        {features.map((feat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + idx * 0.1, duration: 0.4 }}
            className="glass-panel p-6 rounded-3xl border-white/20 dark:border-white/5 flex flex-col gap-3.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-700/30 flex items-center justify-center">
              {feat.icon}
            </div>
            <h3 className="font-bold text-lg font-display text-neutral-800 dark:text-white">
              {feat.title}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
              {feat.description}
            </p>
          </motion.div>
        ))}
      </section>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-t border-neutral-200/50 dark:border-neutral-800/40 text-xs font-semibold text-neutral-400 dark:text-neutral-500 z-10 mt-12">
        <span>© {new Date().getFullYear()} Askly. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <span className="hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer">Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}
