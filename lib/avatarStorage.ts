import { supabase } from '@/lib/supabase';

const AVATAR_BUCKET = 'avatars';

function avatarObjectPath(userId: string) {
  return `${userId}/avatar.jpg`;
}

export function getAvatarPublicUrl(userId: string) {
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(avatarObjectPath(userId));
  return data.publicUrl;
}

export async function fetchProfileAvatarUrl(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.avatar_url ?? null;
}

export async function uploadProfileAvatar(userId: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  if (!response.ok) {
    throw new Error('Could not read the selected photo.');
  }

  const arrayBuffer = await response.arrayBuffer();
  const objectPath = avatarObjectPath(userId);

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(objectPath, arrayBuffer, {
      upsert: true,
      contentType: 'image/jpeg',
      cacheControl: '3600',
    });

  if (uploadError) throw uploadError;

  const publicUrl = `${getAvatarPublicUrl(userId)}?t=${Date.now()}`;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId);

  if (profileError) throw profileError;

  return publicUrl;
}

export async function removeProfileAvatar(userId: string): Promise<void> {
  const { error: storageError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove([avatarObjectPath(userId)]);

  if (storageError) throw storageError;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', userId);

  if (profileError) throw profileError;
}
