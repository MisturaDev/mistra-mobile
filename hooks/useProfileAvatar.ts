import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const storageKey = (userId: string) => `mistra-avatar-${userId}`;

export function useProfileAvatar(userId?: string) {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setAvatarUri(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    AsyncStorage.getItem(storageKey(userId))
      .then((uri) => {
        if (!cancelled) {
          setAvatarUri(uri);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const persistAvatar = useCallback(
    async (uri: string | null) => {
      if (!userId) return;

      if (uri) {
        await AsyncStorage.setItem(storageKey(userId), uri);
      } else {
        await AsyncStorage.removeItem(storageKey(userId));
      }

      setAvatarUri(uri);
    },
    [userId]
  );

  const pickAvatar = useCallback(async () => {
    if (!userId) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Allow photo library access to set your profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      await persistAvatar(result.assets[0].uri);
    }
  }, [persistAvatar, userId]);

  const removeAvatar = useCallback(async () => {
    await persistAvatar(null);
  }, [persistAvatar]);

  return {
    avatarUri,
    isLoading,
    pickAvatar,
    removeAvatar,
  };
}
