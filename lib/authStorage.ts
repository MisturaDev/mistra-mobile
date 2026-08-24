import { supabase } from '@/lib/supabase';

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
    current_password: currentPassword,
  } as { password: string; current_password: string });

  if (error) throw error;
}
