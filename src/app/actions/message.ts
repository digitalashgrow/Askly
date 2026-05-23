'use server';

import { createClient } from '@/utils/supabase/server';
import { cleanProfanity } from '@/utils/profanity';

interface SendMessageResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function sendMessage(
  username: string,
  content: string
): Promise<SendMessageResponse> {
  if (!username) {
    return { success: false, error: 'Receiver username is required.' };
  }

  const trimmedContent = content.trim();
  if (!trimmedContent) {
    return { success: false, error: 'Message content cannot be empty.' };
  }

  if (trimmedContent.length > 300) {
    return { success: false, error: 'Message cannot exceed 300 characters.' };
  }

  try {
    const supabase = await createClient();

    const { data: receiver, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase().trim())
      .maybeSingle();

    if (userError || !receiver) {
      return { success: false, error: 'User not found.' };
    }

    const sanitizedContent = cleanProfanity(trimmedContent);

    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        receiver_id: receiver.id,
        content: sanitizedContent,
      });

    if (insertError) {
      return { success: false, error: 'Failed to send message securely.' };
    }

    return { success: true, message: 'Message sent anonymously!' };
  } catch (err) {
    console.error('Unexpected send message error:', err);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}

/**
 * Mark a message as read or unread
 */
export async function markMessageAsRead(
  messageId: string,
  isRead: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('messages')
      .update({ is_read: isRead })
      .eq('id', messageId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: 'Database update failed.' };
  }
}

/**
 * Soft delete a message
 */
export async function deleteMessage(
  messageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: true })
      .eq('id', messageId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: 'Database delete failed.' };
  }
}
