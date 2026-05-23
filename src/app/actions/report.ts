'use server';

import { createClient } from '@/utils/supabase/server';

interface ReportResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function reportMessage(
  messageId: string,
  reason: string
): Promise<ReportResponse> {
  if (!messageId) {
    return { success: false, error: 'Message ID is required.' };
  }

  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    return { success: false, error: 'Report reason is required.' };
  }

  try {
    const supabase = await createClient();

    // Verify if message exists
    const { data: message, error: findError } = await supabase
      .from('messages')
      .select('id')
      .eq('id', messageId)
      .maybeSingle();

    if (findError || !message) {
      return { success: false, error: 'Message not found to report.' };
    }

    // Insert the report record
    const { error: insertError } = await supabase
      .from('reports')
      .insert({
        message_id: messageId,
        reason: trimmedReason,
      });

    if (insertError) {
      console.error('Insert report error:', insertError);
      return { success: false, error: 'Failed to submit report. Please try again.' };
    }

    return { success: true, message: 'Message reported successfully. Thank you!' };
  } catch (err) {
    console.error('Unexpected report message error:', err);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}
