import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { Redirect, router, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { jobsQueryKey } from '@/lib/jobs';
import { jobIdFrom, registerForJobAlerts } from '@/lib/push';
import { useProfile } from '@/lib/queries';
import { useAuth } from '@/stores/auth';
import { colors, typography } from '@/theme/tokens';

const icons = { index: ['grid', 'grid-outline'], jobs: ['briefcase', 'briefcase-outline'], wallet: ['wallet', 'wallet-outline'], earnings: ['cash', 'cash-outline'], more: ['person-circle', 'person-circle-outline'] } as const;
// Dashboard is the starting tab, and Android Back from any other tab returns to it.
export const unstable_settings = { initialRouteName: 'index' };

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const client = useQueryClient();
  const profile = useProfile();
  // Signed-in partners get job alerts; tapping one opens the job, and any alert refreshes the job list.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    void registerForJobAlerts();
    const open = (id: string | null) => { if (id) router.push({ pathname: '/job/[id]', params: { id } }); };
    open(jobIdFrom(Notifications.getLastNotificationResponse()));
    const tapped = Notifications.addNotificationResponseReceivedListener((response) => { void client.invalidateQueries({ queryKey: jobsQueryKey }); open(jobIdFrom(response)); });
    const received = Notifications.addNotificationReceivedListener(() => void client.invalidateQueries({ queryKey: jobsQueryKey }));
    return () => { tapped.remove(); received.remove(); };
  }, [client]);
  const user = useAuth((state) => state.user);
  if (!user) return <Redirect href="/login" />;
  // If an admin suspends or un-verifies the partner, send them back to the verification screen.
  if (profile.data && profile.data.background_verification_status !== 'VERIFIED') return <Redirect href="/kyc" />;
  return <Tabs backBehavior="initialRoute" screenListeners={{ tabPress: () => void Haptics.selectionAsync() }} screenOptions={({ route }) => ({ headerShown: false, animation: 'shift', sceneStyle: { paddingTop: insets.top, backgroundColor: colors.background }, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarHideOnKeyboard: true, tabBarLabelStyle: { fontFamily: typography.semibold, fontSize: 10, marginTop: 2 }, tabBarItemStyle: { paddingTop: 5 }, tabBarStyle: { height: 78 + insets.bottom, paddingTop: 7, paddingBottom: 9 + insets.bottom, borderTopWidth: 0, backgroundColor: colors.white, shadowColor: '#21112E', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: -5 }, elevation: 12 }, tabBarIcon: ({ color, focused, size }) => { const pair = icons[route.name as keyof typeof icons] ?? icons.index; return <Ionicons name={pair[focused ? 0 : 1]} size={size} color={color} />; } })}>
    <Tabs.Screen name="index" options={{ title: 'Dashboard' }} /><Tabs.Screen name="jobs" options={{ title: 'Jobs' }} /><Tabs.Screen name="wallet" options={{ title: 'Wallet' }} /><Tabs.Screen name="earnings" options={{ title: 'Earnings' }} /><Tabs.Screen name="more" options={{ title: 'More' }} />
  </Tabs>;
}
