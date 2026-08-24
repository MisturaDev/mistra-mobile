import { create } from 'zustand';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import {
  fetchProfileAvatarUrl,
  removeProfileAvatar,
  uploadProfileAvatar,
} from '@/lib/avatarStorage';

const cacheKey = (userId: string) => `mistra-avatar-${userId}`;

interface AvatarState {
  avatarUri: string | null;
  activeUserId: string | null;
  isLoading: boolean;
  hydrate: (userId: string) => Promise<void>;
  pickAvatar: (userId: string) => Promise<void>;
  removeAvatar: (userId: string) => Promise<void>;
}

export const useAvatarStore = create<AvatarState>((set) => ({
  avatarUri: null,
  activeUserId: null,
  isLoading: false,

  hydrate: async (userId) => {
    set({ isLoading: true, activeUserId: userId });

    try {
      const remoteUrl = await fetchProfileAvatarUrl(userId);

      if (remoteUrl) {
        await AsyncStorage.setItem(cacheKey(userId), remoteUrl);
        set({ avatarUri: remoteUrl, isLoading: false });
        return;
      }

      await AsyncStorage.removeItem(cacheKey(userId));
      set({ avatarUri: null, isLoading: false });
    } catch {
      try {
        const cachedUri = await AsyncStorage.getItem(cacheKey(userId));
        set({ avatarUri: cachedUri, isLoading: false });
      } catch {
        set({ avatarUri: null, isLoading: false });
      }
    }
  },

  pickAvatar: async (userId) => {
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

    if (result.canceled || !result.assets[0]?.uri) return;

    set({ isLoading: true, activeUserId: userId });

    try {
      const publicUrl = await uploadProfileAvatar(userId, result.assets[0].uri);
      await AsyncStorage.setItem(cacheKey(userId), publicUrl);
      set({ avatarUri: publicUrl, isLoading: false, activeUserId: userId });
    } catch (error) {
      set({ isLoading: false });
      Alert.alert(
        'Upload failed',
        error instanceof Error ? error.message : 'Could not save your profile photo.'
      );
    }
  },

  removeAvatar: async (userId) => {
    set({ isLoading: true, activeUserId: userId });

    try {
      await removeProfileAvatar(userId);
      await AsyncStorage.removeItem(cacheKey(userId));
      set({ avatarUri: null, isLoading: false, activeUserId: userId });
    } catch (error) {
      set({ isLoading: false });
      Alert.alert(
        'Remove failed',
        error instanceof Error ? error.message : 'Could not remove your profile photo.'
      );
    }
  },
}));
