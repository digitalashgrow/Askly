'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toPng } from 'html-to-image';
import { Download, Sparkles, ChevronLeft, Share2, Palette, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

interface GradientTheme {
  id: string;
  name: string;
  class: string;
  style: React.CSSProperties;
  textDark: boolean;
}

const GRADIENT_THEMES: GradientTheme[] = [
  {
    id: 'sunset',
    name: 'Sunset Peach',
    class: 'from-[#f093fb] to-[#f5576c]',
    style: { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    textDark: false,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Violet',
    class: 'from-[#6515f6] to-[#ec4899]',
    style: { background: 'linear-gradient(135deg, #6515f6 0%, #ec4899 100%)' },
    textDark: false,
  },
  {
    id: 'emerald',
    name: 'Neon Emerald',
    class: 'from-[#0575e6] to-[#00f260]',
    style: { background: 'linear-gradient(135deg, #0575e6 0%, #00f260 100%)' },
    textDark: false,
  },
  {
    id: 'midnight',
    name: 'Midnight Obsidian',
    class: 'from-[#090514] to-[#1e1533]',
    style: { background: 'linear-gradient(135deg, #090514 0%, #1e1533 100%)' },
    textDark: false,
  },
  {
    id: 'lavender',
    name: 'Lavender Mist',
    class: 'from-[#a18cd1] to-[#fbc2eb]',
    style: { background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
    textDark: false,
  },
];

export default function ShareCardPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const messageId = String(params.id);

  const [message, setMessage] = useState<{ id: string; content: string; created_at: string } | null>(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTheme, setActiveTheme] = useState<GradientTheme>(GRADIENT_THEMES[1]); // Default Cyberpunk

  const cardRef = useRef<HTMLDivElement>(null);

  // Load message detail
  useEffect(() => {
    async function loadMessage() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Fetch user username
        const { data: profile } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          setUsername(profile.username);
        }

        // Fetch targeted message details
        const { data: msg, error } = await supabase
          .from('messages')
          .select('*')
          .eq('id', messageId)
          .eq('receiver_id', user.id)
          .maybeSingle();

        if (error || !msg) {
          toast.error('Message not found.');
          router.push('/dashboard');
          return;
        }

        setMessage(msg);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load sharing generator.');
      } finally {
        setLoading(false);
      }
    }

    loadMessage();
  }, [messageId, supabase, router]);

  // Export card using html-to-image
  const handleExport = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      // Small timeout to allow styling elements to compile
      await new Promise((resolve) => setTimeout(resolve, 150));

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2, // High resolution HD export
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: cardRef.current.offsetWidth + 'px',
          height: cardRef.current.offsetHeight + 'px',
        },
      });

      // Trigger Confetti explosion
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#ec4899', '#06b6d4'],
      });

      // Create download trigger anchor
      const link = document.createElement('a');
      link.download = `askly_story_${messageId.substring(0, 6)}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Story card downloaded successfully! 🚀');
    } catch (err) {
      console.error(err);
      toast.error('Could not generate story image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center py-20 animate-pulse">
        <div className="h-96 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
        <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg mt-4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Back link bar */}
      <div className="flex items-center justify-between pl-1">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 cursor-pointer"
        >
          <ChevronLeft size={16} /> Back to Inbox
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/10 dark:bg-pink-500/20 text-xs font-semibold text-pink-600 dark:text-pink-400">
          <Share2 size={12} />
          Instagram Story Ready
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 py-4">
        {/* Left: Interactive 9:16 Canvas Preview Card */}
        <div className="flex-shrink-0 relative scale-95 md:scale-100">
          {/* Output Container captured by html-to-image */}
          <div
            ref={cardRef}
            className={`w-[320px] h-[568px] rounded-[36px] flex flex-col justify-between p-8 relative overflow-hidden shadow-2xl transition-all duration-500`}
            style={activeTheme.style}
          >
            {/* Background decorative blob overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />

            {/* Top Row: Brand Info */}
            <div className="w-full flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/95 text-[#6515f6] flex items-center justify-center font-black text-sm shadow-sm">
                  A
                </div>
                <span className="font-extrabold text-xs tracking-tight text-white/95">
                  Askly
                </span>
              </div>
              <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
                100% Anonymous
              </span>
            </div>

            {/* Middle: Question Container Card */}
            <div className="w-full bg-white/95 dark:bg-neutral-950/95 p-6 rounded-[28px] shadow-lg flex flex-col items-center justify-center text-center gap-3.5 border border-white/10 min-h-[220px]">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#7028e4] bg-[#7028e4]/10 dark:bg-purple-500/20 dark:text-purple-400 px-3 py-1 rounded-full">
                Anonymous Secret Question
              </span>
              <p className="text-base sm:text-lg font-bold leading-relaxed text-neutral-800 dark:text-neutral-100 pr-2 pl-2">
                &ldquo;{message.content}&rdquo;
              </p>
            </div>

            {/* Bottom Row: Call To Action instructions */}
            <div className="w-full z-10 flex flex-col items-center gap-2">
              <div className="py-2.5 px-5 rounded-full bg-white/15 dark:bg-black/15 backdrop-blur-md border border-white/20 flex items-center justify-center gap-2 max-w-[240px] shadow-sm">
                <span className="text-[10px] font-extrabold text-white tracking-wide uppercase">
                  Swipe up to reply
                </span>
              </div>
              <span className="text-[9px] font-bold text-white/85">
                askly.app/{username}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Theme customization and Export Controls */}
        <div className="flex-1 flex flex-col gap-6 max-w-md w-full">
          <div>
            <h3 className="text-xl font-bold tracking-tight font-display mb-1.5 text-neutral-800 dark:text-white">
              Customize Story Card
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Select an aesthetic gradient theme that matches your personal vibe, then download and upload it directly to your Instagram story!
            </p>
          </div>

          {/* Theme Selector */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest pl-1 flex items-center gap-1.5">
              <Palette size={14} /> Select Story Theme
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GRADIENT_THEMES.map((theme) => {
                const isSelected = theme.id === activeTheme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setActiveTheme(theme)}
                    className={`p-3 rounded-2xl flex items-center gap-3 border text-left transition-all cursor-pointer hover:scale-102
                      ${isSelected ? 'border-purple-500 bg-purple-500/5 ring-1 ring-purple-500/20' : 'border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-white/2 hover:border-neutral-300 dark:hover:border-neutral-700/60'}
                    `}
                  >
                    <div
                      className="w-7 h-7 rounded-full shadow-inner flex-shrink-0"
                      style={theme.style}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                        {theme.name}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-neutral-100 dark:border-neutral-800/80 my-2" />

          {/* Export Actions */}
          <div className="flex flex-col gap-3">
            <Button
              variant="premium"
              onClick={handleExport}
              isLoading={isExporting}
              leftIcon={<Download size={18} />}
              className="w-full py-4 text-base font-bold rounded-2xl"
            >
              {isExporting ? 'Generating PNG...' : 'Download HD Share Card'}
            </Button>
            
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs font-semibold text-amber-600 dark:text-amber-500/90 leading-relaxed">
              <Sparkles size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                Tip: After downloading, post it to Instagram, and add a link sticker pointing to <span className="font-bold text-neutral-800 dark:text-neutral-100 select-all">askly.app/{username}</span> so friends can ask more secrets!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
