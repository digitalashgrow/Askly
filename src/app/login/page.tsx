'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, Sparkles, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { FloatingBlobs } from '@/components/FloatingBlobs';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from '@/components/ui/Toast';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill username if passed in URL
  useEffect(() => {
    const userParam = searchParams.get('username');
    if (userParam) {
      setUsername(userParam.toLowerCase().replace(/[^a-z0-9_]/g, ''));
      setActiveTab('signup');
    }
  }, [searchParams]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (activeTab === 'signup') {
      if (!username) newErrors.username = 'Username is required';
      else if (username.length < 3) newErrors.username = 'Username must be at least 3 characters';
      else if (!/^[a-z0-9_]+$/.test(username)) {
        newErrors.username = 'Username can only contain lowercase letters, numbers, and underscores';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Logged in successfully!');
          router.push('/dashboard');
          router.refresh();
        }
      } else {
        // Sign Up
        // First check if username is already taken
        const { data: existingUser } = await supabase
          .from('users')
          .select('username')
          .eq('username', username.trim().toLowerCase())
          .maybeSingle();

        if (existingUser) {
          setErrors({ username: 'This username is already claimed' });
          setIsLoading(false);
          return;
        }

        // Proceed with Supabase Auth SignUp and pass username in user_metadata
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim().toLowerCase(),
            },
          },
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Registration successful! Welcome to Askly!');
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Network error — check your Supabase credentials in .env.local');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) toast.error(error.message);
    } catch (err) {
      toast.error('Could not connect to Google OAuth.');
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-4 bg-dot-grid relative">
      <FloatingBlobs />

      {/* Floating Theme Switcher */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md flex flex-col items-center">
        {/* Brand */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-12 h-12 rounded-2xl premium-gradient flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20 mb-3 animate-float-medium">
            A
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display">
            Ask<span className="premium-text-gradient">ly</span>
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
            Anonymous messaging for modern creators
          </p>
        </motion.div>

        {/* Auth Glass Container */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="w-full glass-panel p-8 rounded-3xl border-white/20 dark:border-white/5"
        >
          <Tabs
            tabs={[
              { id: 'login', label: 'Log In' },
              { id: 'signup', label: 'Sign Up' },
            ]}
            activeTab={activeTab}
            onChange={(tabId) => {
              setActiveTab(tabId as 'login' | 'signup');
              setErrors({});
            }}
            className="mb-8"
          />

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {activeTab === 'signup' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="overflow-hidden"
              >
                <Input
                  label="Username"
                  id="username"
                  type="text"
                  placeholder="choose_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  error={errors.username}
                  leftIcon={<User size={18} />}
                  autoComplete="username"
                />
              </motion.div>
            )}

            <Input
              label="Email"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail size={18} />}
              autoComplete="email"
            />

            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              leftIcon={<Lock size={18} />}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant={activeTab === 'login' ? 'primary' : 'premium'}
              isLoading={isLoading}
              className="w-full mt-2"
            >
              {activeTab === 'login' ? 'Continue' : 'Create My Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-800/80" />
            </div>
            <span className="relative bg-white dark:bg-[#0d091a] px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              or continue with
            </span>
          </div>

          {/* Social Auth */}
          <Button
            type="button"
            variant="outline"
            leftIcon={<Globe size={16} />}
            onClick={handleGoogleLogin}
            className="w-full py-2.5 rounded-2xl text-sm"
          >
            Google OAuth
          </Button>
        </motion.div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
