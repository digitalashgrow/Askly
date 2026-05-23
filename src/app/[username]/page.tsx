'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, Shield, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import confetti from 'canvas-confetti';

import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { FloatingBlobs } from '@/components/FloatingBlobs';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from '@/components/ui/Toast';
import { sendMessage } from '@/app/actions/message';

const QUICK_EMOJIS = ['🤫', '👀', '🔥', '💖', '💀', '💯', '👾', '🌈', '🍕', '🎉'];

export default function PublicMessagingPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const username = String(params.username).toLowerCase();

  const [receiver, setReceiver] = useState<{ username: string; avatar_url: string | null; bio: string | null } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Load receiver profile details
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('username, avatar_url, bio')
          .eq('username', username)
          .maybeSingle();

        if (error) {
          console.error(error);
          toast.error('Failed to load profile.');
        } else if (!data) {
          setReceiver(null);
        } else {
          setReceiver(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, [username, supabase]);

  // Handle client-side spam check timer
  useEffect(() => {
    const lastSent = localStorage.getItem(`askly_last_sent_${username}`);
    if (lastSent) {
      const elapsed = Date.now() - parseInt(lastSent, 10);
      const remaining = Math.max(0, Math.ceil((12000 - elapsed) / 1000)); // 12 second cooldown
      if (remaining > 0) {
        setCooldown(remaining);
        const interval = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(interval);
      }
    }
  }, [username]);

  const handleEmojiClick = (emoji: string) => {
    const textarea = document.getElementById('message-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      setMessage(newText);
      // Restore cursor position after the state update
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setMessage((prev) => prev + emoji);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Check client-side rate limiting
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown}s before sending another message.`);
      return;
    }

    setIsSending(true);
    try {
      const res = await sendMessage(username, message);

      if (res.success) {
        // Confetti!
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#8b5cf6', '#ec4899', '#06b6d4'],
        });

        toast.success('Secret message sent anonymously! 🤫');
        setMessage('');

        // Store rate limit timestamp
        localStorage.setItem(`askly_last_sent_${username}`, Date.now().toString());
        setCooldown(12);

        // Start cooldown timer
        const interval = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(res.error || 'Failed to send message.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-dot-grid relative">
        <FloatingBlobs />
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-500/20 border-t-purple-500" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider animate-pulse">
            Loading Askly profile...
          </p>
        </div>
      </div>
    );
  }

  if (!receiver) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-dot-grid relative">
        <FloatingBlobs />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 rounded-3xl max-w-sm w-full text-center flex flex-col items-center gap-5 border-white/20 dark:border-white/5"
        >
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
            <AlertCircle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold font-display">Profile Not Found</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              The user <span className="font-bold text-neutral-800 dark:text-neutral-200">@{username}</span> does not exist or has closed their inbox.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => router.push('/')} className="w-full">
            Back to Askly
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 bg-dot-grid relative">
      <FloatingBlobs />

      {/* Top Bar */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 rounded-lg premium-gradient flex items-center justify-center text-white font-black text-sm">
            A
          </div>
          <span className="font-extrabold text-sm tracking-tight font-display">
            Ask<span className="premium-text-gradient">ly</span>
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center z-10 py-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="w-full max-w-md glass-panel p-6 rounded-[32px] border-white/20 dark:border-white/5 flex flex-col shadow-xl"
        >
          {/* Receiver Profile */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 via-pink-500 to-amber-400 p-0.5 mb-3 shadow-md animate-float-medium">
              <div className="w-full h-full rounded-full bg-white dark:bg-[#0c0919] p-0.5">
                <Image
                  src={receiver.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`}
                  alt={username}
                  width={80}
                  height={80}
                  unoptimized
                  className="w-full h-full rounded-full object-cover bg-neutral-100 dark:bg-neutral-800"
                />
              </div>
            </div>
            <h2 className="text-lg font-bold font-display text-neutral-800 dark:text-neutral-100">
              @{receiver.username}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 pl-6 pr-6 text-center italic">
              &ldquo;{receiver.bio || 'Ask me anything anonymously! 🤫'}&rdquo;
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="flex flex-col gap-4">
            <Textarea
              id="message-textarea"
              placeholder={`Send @${receiver.username} a secret message...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              showCharCount={true}
              maxLength={300}
              disabled={isSending}
              className="text-base min-h-[140px] focus:ring-purple-500/20"
            />

            {/* Emoji Selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest pl-1">
                😀 Quick Emoji Add
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleEmojiClick(emoji)}
                    disabled={isSending}
                    className="flex-shrink-0 text-xl p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 active:scale-90 transition-transform cursor-pointer border border-transparent dark:border-neutral-800/10"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="premium"
              isLoading={isSending}
              disabled={!message.trim() || isSending}
              rightIcon={<Send size={14} />}
              className="w-full mt-2 font-bold py-3.5"
            >
              {cooldown > 0 ? `Sent! Wait (${cooldown}s)` : 'Send Anonymously'}
            </Button>
          </form>
        </motion.div>
      </main>

      {/* Safety info at bottom */}
      <footer className="w-full max-w-md mx-auto text-center flex items-center justify-center gap-1.5 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 py-3 z-10">
        <Shield size={12} className="text-emerald-500" />
        <span>100% Anonymous & Protected. We block slurs/harassment.</span>
      </footer>
    </div>
  );
}
