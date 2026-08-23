export function getFirstName(name?: string | null, fallback = 'User'): string {
  const trimmed = name?.trim();
  if (!trimmed) return fallback;

  const [firstName] = trimmed.split(/\s+/);
  if (!firstName) return fallback;

  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}

export function getUserNameFromSession(
  metadataName?: string | null,
  email?: string | null,
  fallback = 'User'
): string {
  if (metadataName?.trim()) return metadataName.trim();
  if (email?.includes('@')) return email.split('@')[0];
  return fallback;
}
