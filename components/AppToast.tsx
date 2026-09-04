import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { Colors, Radius, Typography } from '@/constants/theme';

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: Colors.primary,
        borderRadius: Radius.md,
        backgroundColor: Colors.primaryLight,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        ...Typography.bodyBold,
        color: Colors.text,
        fontSize: 14,
      }}
      text2Style={{
        ...Typography.body,
        color: Colors.textSecondary,
        fontSize: 13,
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: Colors.error,
        borderRadius: Radius.md,
        backgroundColor: Colors.white,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        ...Typography.bodyBold,
        color: Colors.text,
        fontSize: 14,
      }}
      text2Style={{
        ...Typography.body,
        color: Colors.textSecondary,
        fontSize: 13,
      }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: Colors.primary,
        borderRadius: Radius.md,
        backgroundColor: Colors.primaryLight,
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={{
        ...Typography.bodyBold,
        color: Colors.text,
        fontSize: 14,
      }}
      text2Style={{
        ...Typography.body,
        color: Colors.textSecondary,
        fontSize: 13,
      }}
    />
  ),
};

export function AppToast() {
  return <Toast config={toastConfig} topOffset={56} visibilityTime={3000} />;
}

type ToastOptions = {
  title?: string;
  message: string;
};

export const toast = {
  success({ title = 'Success', message }: ToastOptions) {
    Toast.show({ type: 'success', text1: title, text2: message });
  },
  info({ title = 'Mistra', message }: ToastOptions) {
    Toast.show({ type: 'info', text1: title, text2: message });
  },
  error({ title = 'Error', message }: ToastOptions) {
    Toast.show({ type: 'error', text1: title, text2: message });
  },
};
