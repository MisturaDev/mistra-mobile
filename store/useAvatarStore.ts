import { create } from 'zustand';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const storageKey = (userId: string) => `mistra-avatar-${userId}`;

interface AvatarState {
  avatarUri: string | null;
  activeUserId: string | null;
  isLoading: boolean;
  hydrate: (userId: string) => Promise<void>;
  pickAvatar: (userId: string) => Promise<void>;
  removeAvatar: (userId: string) => Promise<void>;
}

export const useAvatarStore = create<AvatarState>((set, get) => ({
  avatarUri: null,
  activeUserId: null,
  isLoading: false,

  hydrate: async (userId) => {
    set({ isLoading: true, activeUserId: userId });

    try {
      const uri = await AsyncStorage.getItem(storageKey(userId));
      set({ avatarUri: uri, isLoading: false });
    } catch {
      set({ avatarUri: null, isLoading: false });
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

    const uri = result.assets[0].uri;
    await AsyncStorage.setItem(storageKey(userId), uri);
    set({ avatarUri: uri, activeUserId: userId });
  },

  removeAvatar: async (userId) => {
    await AsyncStorage.removeItem(storageKey(userId));
    set({ avatarUri: null, activeUserId: userId });
  },
}));
