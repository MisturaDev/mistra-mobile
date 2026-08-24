import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'mistra-onboarding-completed';

export async function loadOnboardingCompleted(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  } catch {
    return false;
  }
}

export async function saveOnboardingCompleted(completed: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, completed ? 'true' : 'false');
}
