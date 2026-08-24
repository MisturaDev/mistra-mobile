import { supabase } from '@/lib/supabase';

export async function updateProfileName(userId: string, name: string): Promise<void> {
  const trimmed = name.trim();

  const { error: authError } = await supabase.auth.updateUser({
    data: { name: trimmed },
  });

  if (authError) throw authError;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ name: trimmed })
    .eq('id', userId);

  if (profileError) throw profileError;
}
