import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiRequest } from '@/lib/api';

// Show job alerts as banners even while the app is open.
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });
}

let registeredToken: string | null = null;

/**
 * Asks for notification permission and registers this phone's Expo push token with the backend,
 * so assigned jobs arrive as alerts. Quietly does nothing on web, emulators without Play services,
 * or builds without an EAS project id.
 */
export async function registerForJobAlerts() {
  if (Platform.OS === 'web' || !Device.isDevice) return;
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('jobs', { name: 'New jobs', importance: Notifications.AndroidImportance.HIGH, sound: 'default', vibrationPattern: [0, 250, 250, 250] });
  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted && permission.canAskAgain) permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) { console.warn('Push alerts are off: run `npx eas-cli@latest init` to add an EAS project id.'); return; }
  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await apiRequest<void>('/api/v1/notifications/devices/', { method: 'POST', auth: true, body: JSON.stringify({ token, platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID', app: 'partner' }) });
    registeredToken = token;
  } catch (error) {
    console.warn('Could not register for job alerts', error);
  }
}

/** Stops alerts for this phone; call before signing out. */
export async function unregisterJobAlerts() {
  if (!registeredToken) return;
  const token = registeredToken; registeredToken = null;
  await apiRequest<void>('/api/v1/notifications/devices/', { method: 'DELETE', auth: true, body: JSON.stringify({ token }) }).catch(() => undefined);
}

/** The job a tapped notification points to, if any. */
export function jobIdFrom(response: Notifications.NotificationResponse | null) {
  const id = response?.notification.request.content.data?.booking_id;
  return typeof id === 'string' ? id : null;
}
