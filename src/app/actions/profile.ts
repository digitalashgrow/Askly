'use server';

import { createClient, getUser } from '@/utils/supabase/server';

interface ProfileUpdateResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export async function updateProfile(
  username: string,
  bio: string,
  avatarUrl: string
): Promise<ProfileUpdateResponse> {
  const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

  if (cleanUsername.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters long.' };
  }

  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'You must be logged in to update your profile.' };
    }

    const supabase = await createClient();

    // Check if username is taken by ANOTHER user
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', cleanUsername)
      .neq('id', user.id)
      .maybeSingle();

    if (checkError) {
      return { success: false, error: 'Failed to validate username uniqueness.' };
    }

    if (existingUser) {
      return { success: false, error: 'This username is already taken by someone else.' };
    }

    // Update the profile in Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({
        username: cleanUsername,
        bio: bio.trim(),
        avatar_url: avatarUrl,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error(updateError);
      return { success: false, error: 'Failed to update profile database record.' };
    }

    return { success: true, message: 'Profile updated successfully!' };
  } catch (err) {
    console.error('Unexpected update profile error:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
