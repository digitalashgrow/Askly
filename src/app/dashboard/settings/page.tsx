'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, FileText, Sparkles, Smile, ShieldAlert, Check } from 'lucide-react';
import { motion } from 'framer-motion';

import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from '@/components/ui/Toast';
import { updateProfile } from '@/app/actions/profile';

const PRESET_AVATARS = [
  { name: 'Future Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=FutureBot' },
  { name: 'Neon Scout', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=NeonScout' },
  { name: 'Aesthetic Girl', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=AestheticGirl' },
  { name: 'Happy Chibi', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=HappyChibi' },
  { name: 'Cosmic Alien', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=CosmicAlien' },
];

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setProfile(data);
          setUsername(data.username);
          setBio(data.bio || '');
          setAvatarUrl(data.avatar_url || '');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile settings.');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [supabase, router]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

    if (!cleanUsername) newErrors.username = 'Username is required';
    else if (cleanUsername.length < 3) newErrors.username = 'Username must be at least 3 characters';
    else if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      newErrors.username = 'Username can only contain lowercase letters, numbers, and underscores';
    }

    if (bio && bio.length > 150) {
      newErrors.bio = 'Bio must be less than 150 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsUpdating(true);

    try {
      const res = await updateProfile(username, bio, avatarUrl);

      if (res.success) {
        toast.success(res.message || 'Profile settings updated successfully!');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to update profile settings.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto animate-pulse">
        <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="glass-panel p-8 rounded-3xl h-96 bg-neutral-200/10" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold font-display text-neutral-800 dark:text-neutral-50 pl-1">
          Profile Settings
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 pl-1 mt-1">
          Update your public bio, username, and select a premium avatar theme.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-[32px] border-white/20 dark:border-white/5 shadow-md"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          {/* Avatar selector row */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider pl-1">
              Select Your Avatar Accent
            </span>
            
            {/* Avatar grid picker */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Current Active Preview */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 via-pink-500 to-amber-400 p-0.5 shadow-md flex-shrink-0">
                <div className="w-full h-full rounded-full bg-white dark:bg-[#0c0919] p-0.5">
                  <img
                    src={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`}
                    alt="Preview"
                    className="w-full h-full rounded-full object-cover bg-neutral-100 dark:bg-neutral-800"
                  />
                </div>
              </div>

              {/* Curated list */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
                {PRESET_AVATARS.map((avatar) => {
                  const isSelected = avatarUrl === avatar.url;
                  return (
                    <button
                      key={avatar.name}
                      type="button"
                      onClick={() => setAvatarUrl(avatar.url)}
                      className={`w-11 h-11 rounded-full p-0.5 transition-all relative flex-shrink-0 cursor-pointer
                        ${isSelected ? 'bg-purple-500 ring-2 ring-purple-500/20 scale-105' : 'bg-neutral-200 dark:bg-neutral-800 hover:scale-105'}
                      `}
                    >
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        className="w-full h-full rounded-full object-cover bg-neutral-100 dark:bg-neutral-900"
                      />
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white border border-white dark:border-[#0c0919]">
                          <Check size={8} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="mt-2.5">
              <Input
                label="Custom Avatar Image URL"
                id="avatarUrl"
                type="text"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                helperText="Paste a direct image link from the web to set a custom profile photo."
              />
            </div>
          </div>

          <hr className="border-neutral-100 dark:border-neutral-800/80 my-1" />

          {/* Username Field */}
          <Input
            label="Askly Username"
            id="username"
            type="text"
            placeholder="choose_username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            error={errors.username}
            leftIcon={<User size={18} />}
            helperText="WARNING: Changing your username changes your public ask link! Old links will no longer work."
          />

          {/* Bio Field */}
          <Textarea
            label="Profile Bio Message"
            id="bio"
            placeholder="Ask me anything anonymously! 🤫"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            error={errors.bio}
            maxLength={150}
            showCharCount={true}
            className="min-h-[90px]"
          />

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="rounded-2xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="premium"
              size="sm"
              isLoading={isUpdating}
              className="rounded-2xl font-bold"
            >
              Save Settings
            </Button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
