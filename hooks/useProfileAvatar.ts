import { useEffect } from 'react';
import { useAvatarStore } from '@/store/useAvatarStore';

export function useProfileAvatar(userId?: string) {
  const avatarUri = useAvatarStore((state) => state.avatarUri);
  const isLoading = useAvatarStore((state) => state.isLoading);
  const activeUserId = useAvatarStore((state) => state.activeUserId);
  const hydrate = useAvatarStore((state) => state.hydrate);
  const pickAvatar = useAvatarStore((state) => state.pickAvatar);
  const removeAvatar = useAvatarStore((state) => state.removeAvatar);

  useEffect(() => {
    if (!userId) return;
    if (activeUserId !== userId) {
      hydrate(userId);
    }
  }, [userId, activeUserId, hydrate]);

  const isCurrentUser = Boolean(userId && activeUserId === userId);

  return {
    avatarUri: isCurrentUser ? avatarUri : null,
    isLoading: isCurrentUser ? isLoading : false,
    pickAvatar: () => {
      if (userId) return pickAvatar(userId);
    },
    removeAvatar: () => {
      if (userId) return removeAvatar(userId);
    },
  };
}
