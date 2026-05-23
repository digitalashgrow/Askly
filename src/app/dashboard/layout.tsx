'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, Settings, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { FloatingBlobs } from '@/components/FloatingBlobs';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from '@/components/ui/Toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [username, setUsername] = useState('');

  // Load current user profile details
  useEffect(() => {
    async function loadUserProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();
        if (profile) {
          setUsername(profile.username);
        }
      }
    }
    loadUserProfile();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Logged out successfully.');
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during logout.');
    }
  };

  const navItems = [
    {
      label: 'Inbox',
      href: '/dashboard',
      icon: <MessageSquare size={16} />,
      isActive: pathname === '/dashboard',
    },
    {
      label: 'Profile Settings',
      href: '/dashboard/settings',
      icon: <Settings size={16} />,
      isActive: pathname === '/dashboard/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-dot-grid relative flex flex-col">
      <FloatingBlobs />

      {/* Premium Translucent Header */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 py-4 flex items-center justify-between glass-panel border-b border-white/10 bg-white/20 dark:bg-black/10 backdrop-blur-md">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <div className="w-8 h-8 rounded-lg premium-gradient flex items-center justify-center text-white font-black text-sm">
              A
            </div>
            <span className="font-extrabold text-sm tracking-tight font-display text-neutral-800 dark:text-white">
              Ask<span className="premium-text-gradient">ly</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-2 py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer relative
                  ${item.isActive ? 'text-neutral-900 dark:text-white bg-white/60 dark:bg-neutral-800 border border-neutral-200/40 dark:border-neutral-700/30' : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100/40 dark:hover:bg-neutral-800/10'}
                `}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}

            {username && (
              <a
                href={`/${username}`}
                target="_blank"
                rel="noreferrer"
                className="hidden md:flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/15 transition-all"
              >
                My Link <ExternalLink size={12} />
              </a>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="py-2.5 px-3 rounded-xl text-xs border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800/60"
            >
              <LogOut size={16} className="sm:mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 z-10">
        {children}
      </main>
    </div>
  );
}
