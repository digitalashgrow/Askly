'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, QrCode, Mail, Calendar, Eye, EyeOff, Trash2, ShieldAlert, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { toast } from '@/components/ui/Toast';
import { QRModal } from '@/components/QRModal';
import { markMessageAsRead, deleteMessage } from '@/app/actions/message';
import { reportMessage } from '@/app/actions/report';

interface UserProfile { id: string; username: string; avatar_url: string | null; bio: string | null; }
interface Message { id: string; receiver_id: string; content: string; created_at: string; is_read: boolean; is_deleted: boolean; }

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [copied, setCopied] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Fetch profile and messages
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    async function loadDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // 1. Fetch User profile
        const { data: userProfile, error: profileErr } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileErr) throw profileErr;
        if (!cancelled) setProfile(userProfile);

        // 2. Fetch Messages
        const { data: userMessages, error: msgErr } = await supabase
          .from('messages')
          .select('*')
          .eq('receiver_id', user.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (msgErr) throw msgErr;
        if (!cancelled) setMessages(userMessages || []);

        // 3. Set up Real-time messages listener with unique channel name
        channel = supabase
          .channel(`realtime-db-${user.id}-${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `receiver_id=eq.${user.id}`,
            },
            (payload) => {
              setMessages((prev) => [payload.new as Message, ...prev]);
              toast.info('New secret message received! 🤫');
            }
          )
          .subscribe();
      } catch (err) {
        console.error(err);
        if (!cancelled) toast.error('Failed to load dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      cancelled = true;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase, router]);

  const handleCopyLink = () => {
    if (!profile) return;
    const link = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copied! Share it on your bio 🚀');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenDetail = async (msg: Message) => {
    setSelectedMessage(msg);
    setIsDetailOpen(true);

    // Auto mark as read in UI & DB if unread
    if (!msg.is_read) {
      // Optimistic update in UI
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
      );
      // Async update in DB
      await markMessageAsRead(msg.id, true);
    }
  };

  const handleToggleRead = async (e: React.MouseEvent, msg: Message) => {
    e.stopPropagation();
    const newReadState = !msg.is_read;
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, is_read: newReadState } : m))
    );
    const res = await markMessageAsRead(msg.id, newReadState);
    if (!res.success) {
      toast.error('Failed to update read state.');
      // Revert state
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: msg.is_read } : m))
      );
    } else {
      toast.success(newReadState ? 'Marked as read' : 'Marked as unread');
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;
    setIsDeleting(true);
    const msgId = selectedMessage.id;
    
    // Optimistic update
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    setIsDetailOpen(false);

    try {
      const res = await deleteMessage(msgId);
      if (res.success) {
        toast.success('Message deleted successfully.');
      } else {
        toast.error('Failed to delete message.');
        // Refetch or handle error
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong.');
    } finally {
      setIsDeleting(false);
      setSelectedMessage(null);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !reportReason.trim()) return;
    setIsReporting(true);

    try {
      const res = await reportMessage(selectedMessage.id, reportReason);
      if (res.success) {
        toast.success('Message reported securely.');
        setIsReportOpen(false);
        setReportReason('');
        // Auto soft delete reported message
        setMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
        setIsDetailOpen(false);
      } else {
        toast.error(res.error || 'Failed to submit report.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred.');
    } finally {
      setIsReporting(false);
    }
  };

  const stats = {
    total: messages.length,
    unread: messages.filter((m) => !m.is_read).length,
    read: messages.filter((m) => m.is_read).length,
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {/* Profile Card Skeleton */}
        <div className="w-full glass-panel p-6 rounded-3xl animate-pulse flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
            <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          </div>
        </div>

        {/* Stats Skeletal */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="glass-panel p-4 rounded-2xl h-24 animate-pulse bg-neutral-200/20" />
          ))}
        </div>

        {/* Inbox Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-panel p-5 rounded-2xl h-36 animate-pulse bg-neutral-200/10 border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  const profileUrl = profile ? `${window.location.origin}/${profile.username}` : '';

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* 1. Header Profile & Link share box */}
      {profile && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full glass-panel p-6 sm:p-8 rounded-[32px] border-white/20 dark:border-white/5 shadow-md flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Left: Info */}
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 via-pink-500 to-amber-400 p-0.5 shadow-md">
              <div className="w-full h-full rounded-full bg-white dark:bg-[#0c0919] p-0.5">
                <Image
                  src={profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
                  alt={profile.username}
                  width={80}
                  height={80}
                  unoptimized
                  className="w-full h-full rounded-full object-cover bg-neutral-100 dark:bg-neutral-800"
                />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-neutral-800 dark:text-neutral-50 flex items-center gap-1.5 justify-center sm:justify-start">
                @{profile.username}
                <Sparkles size={16} className="text-purple-500 animate-pulse" />
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-md italic">
                &ldquo;{profile.bio || 'Hey, ask me anything anonymously!'}&rdquo;
              </p>
            </div>
          </div>

          {/* Right: Profile Link Box */}
          <div className="w-full md:w-auto max-w-sm flex flex-col gap-2.5">
            <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest pl-1">
              Your Public Askly Link
            </span>
            <div className="flex items-center gap-2 p-1 rounded-2xl glass-panel border-white/10 shadow-inner bg-black/5 dark:bg-white/5">
              <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 pl-3 select-all overflow-hidden whitespace-nowrap truncate max-w-[140px] sm:max-w-[200px]">
                {profile.username}.askly.app
              </span>
              <Button
                variant="primary"
                onClick={handleCopyLink}
                size="sm"
                className="py-2 px-3 rounded-xl text-xs gap-1.5 ml-auto cursor-pointer"
              >
                {copied ? 'Copied' : <><Copy size={12} /> Copy</>}
              </Button>
            </div>

            <Button
              variant="glass"
              size="sm"
              onClick={() => setIsQrOpen(true)}
              leftIcon={<QrCode size={14} />}
              className="w-full py-2.5 rounded-2xl text-xs"
            >
              Generate Profile QR Code
            </Button>
          </div>
        </motion.section>
      )}

      {/* 2. Stats Dashboard Cards */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: 'Total Received', val: stats.total, color: 'text-violet-600 dark:text-violet-400' },
          { label: 'Unread Questions', val: stats.unread, color: 'text-pink-600 dark:text-pink-400' },
          { label: 'Read Messages', val: stats.read, color: 'text-cyan-600 dark:text-cyan-400' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="glass-panel p-4 sm:p-5 rounded-2xl border-white/20 dark:border-white/5 flex flex-col justify-between shadow-sm h-24 sm:h-28"
          >
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              {item.label}
            </span>
            <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${item.color} font-display mt-2`}>
              {item.val}
            </span>
          </div>
        ))}
      </motion.section>

      {/* 3. Messages Inbox Section */}
      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-bold tracking-tight font-display text-neutral-800 dark:text-white pl-1">
          Inbox Questions
        </h3>

        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-10 rounded-[32px] border-white/10 dark:border-white/5 text-center flex flex-col items-center justify-center gap-4 bg-white/5 py-16"
            >
              <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 animate-float-medium mb-2">
                <Mail size={28} />
              </div>
              <h4 className="font-extrabold text-lg text-neutral-800 dark:text-neutral-100">
                Your Inbox is Empty
              </h4>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed mb-2">
                Share your unique public link on your Instagram Story or bio, and questions will appear here live!
              </p>
              <Button
                variant="premium"
                size="sm"
                onClick={handleCopyLink}
                leftIcon={<Copy size={14} />}
                className="py-2.5 px-5 rounded-xl"
              >
                Copy Askly Link
              </Button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  layoutId={`card-${msg.id}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpenDetail(msg)}
                  className={`glass-panel p-5 rounded-2xl border-white/20 dark:border-white/5 shadow-sm cursor-pointer flex flex-col justify-between min-h-[140px] hover:shadow-purple-500/5 hover:border-purple-500/20 relative group overflow-hidden
                    ${!msg.is_read ? 'bg-white/90 dark:bg-[#150f29]/75 border-purple-500/30' : 'bg-white/40 dark:bg-white/2'}
                  `}
                >
                  {/* Unread Glow Indicator */}
                  {!msg.is_read && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-sm" />
                  )}

                  {/* Body Text */}
                  <p className="text-sm font-semibold leading-relaxed text-neutral-800 dark:text-neutral-100 pr-4 line-clamp-3">
                    {msg.content}
                  </p>

                  {/* Card Bottom Row */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/40 text-[10px] font-bold text-neutral-400 dark:text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(msg.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Mark Read/Unread shortcut */}
                      <button
                        onClick={(e) => handleToggleRead(e, msg)}
                        className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                        title={msg.is_read ? 'Mark Unread' : 'Mark Read'}
                      >
                        {msg.is_read ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 4. Message details display Modal */}
      {selectedMessage && (
        <Dialog
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title="Anonymous Question"
          footer={
            <div className="flex items-center justify-between w-full">
              {/* Left Actions: Report & Delete */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReportOpen(true)}
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl px-2.5 py-2 text-xs"
                >
                  <ShieldAlert size={14} className="mr-1.5" /> Report
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-neutral-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl px-2.5 py-2 text-xs"
                >
                  <Trash2 size={14} className="mr-1.5" /> Delete
                </Button>
              </div>

              {/* Right: Share / Reply */}
              <Button
                variant="premium"
                size="sm"
                onClick={() => {
                  setIsDetailOpen(false);
                  router.push(`/dashboard/share/${selectedMessage.id}`);
                }}
                className="rounded-xl px-4 py-2 text-xs"
              >
                Create Share Card
              </Button>
            </div>
          }
        >
          <div className="py-4">
            {/* Card Graphic box representing question */}
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-inner flex flex-col gap-4 text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-500">
                Anonymous Secret Question
              </span>
              <p className="text-base sm:text-lg font-bold leading-relaxed text-neutral-800 dark:text-neutral-100 pr-2 pl-2">
                &ldquo;{selectedMessage.content}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mt-2">
                <Calendar size={10} />
                <span>
                  Received on{' '}
                  {new Date(selectedMessage.created_at).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* 5. Abuse reporting Dialog overlay */}
      {selectedMessage && (
        <Dialog
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          title="Report Abusive Message"
        >
          <form onSubmit={handleReport} className="flex flex-col gap-4 mt-3">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Report slurs, spam, or direct harassment. Reporting will immediately hide this message and flag it to our moderation team.
            </p>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider pl-1">
                Reason for report
              </label>
              <input
                type="text"
                placeholder="e.g. Harassment, Hate Speech, Spam..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl glass-input text-neutral-900 dark:text-white placeholder-neutral-400 text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button
                type="button"
                variant="glass"
                size="sm"
                onClick={() => setIsReportOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                isLoading={isReporting}
                className="rounded-xl"
              >
                Submit Report
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* QR drawer overlay */}
      {profile && (
        <QRModal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          profileUrl={profileUrl}
          username={profile.username}
        />
      )}
    </div>
  );
}
