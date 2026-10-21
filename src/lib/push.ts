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
 * Asks for notification permission and registers this phone's Firebase Cloud Messaging token with
 * the backend (POST /api/v1/devices/register/), which sends job alerts through FCM. Android only for
 * now: iOS would hand back an APNs token, which the backend's FCM sender can't use.
 */
export async function registerForJobAlerts() {
  if (Platform.OS !== 'android' || !Device.isDevice) return;
  await Notifications.setNotificationChannelAsync('jobs', { name: 'New jobs', importance: Notifications.AndroidImportance.HIGH, sound: 'default', vibrationPattern: [0, 250, 250, 250] });
  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted && permission.canAskAgain) permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return;
  try {
    const { data: token } = await Notifications.getDevicePushTokenAsync();
    await apiRequest('/api/v1/devices/register/', { method: 'POST', auth: true, body: JSON.stringify({ token, platform: 'ANDROID' }) });
    registeredToken = token;
  } catch (error) {
    console.warn('Could not register for job alerts', error);
  }
}

/** Stops alerts for this phone; call before signing out. */
export async function unregisterJobAlerts() {
  if (!registeredToken) return;
  const token = registeredToken; registeredToken = null;
  await apiRequest<void>('/api/v1/devices/register/', { method: 'DELETE', auth: true, body: JSON.stringify({ token }) }).catch(() => undefined);
}

/** The job a tapped notification points to, if any. */
export function jobIdFrom(response: Notifications.NotificationResponse | null) {
  const id = response?.notification.request.content.data?.booking_id;
  return typeof id === 'string' ? id : null;
}
