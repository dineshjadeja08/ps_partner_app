import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '@/theme/tokens';

const icons = { index: ['grid', 'grid-outline'], jobs: ['briefcase', 'briefcase-outline'], wallet: ['wallet', 'wallet-outline'], earnings: ['cash', 'cash-outline'], more: ['person-circle', 'person-circle-outline'] } as const;
// Dashboard is the starting tab, and Android Back from any other tab returns to it.
export const unstable_settings = { initialRouteName: 'index' };

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return <Tabs backBehavior="initialRoute" screenListeners={{ tabPress: () => void Haptics.selectionAsync() }} screenOptions={({ route }) => ({ headerShown: false, animation: 'shift', sceneStyle: { paddingTop: insets.top, backgroundColor: colors.background }, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarHideOnKeyboard: true, tabBarLabelStyle: { fontFamily: typography.semibold, fontSize: 10, marginTop: 2 }, tabBarItemStyle: { paddingTop: 5 }, tabBarStyle: { height: 78 + insets.bottom, paddingTop: 7, paddingBottom: 9 + insets.bottom, borderTopWidth: 0, backgroundColor: colors.white, shadowColor: '#21112E', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: -5 }, elevation: 12 }, tabBarIcon: ({ color, focused, size }) => { const pair = icons[route.name as keyof typeof icons] ?? icons.index; return <Ionicons name={pair[focused ? 0 : 1]} size={size} color={color} />; } })}>
    <Tabs.Screen name="index" options={{ title: 'Dashboard' }} /><Tabs.Screen name="jobs" options={{ title: 'Jobs' }} /><Tabs.Screen name="wallet" options={{ title: 'Wallet' }} /><Tabs.Screen name="earnings" options={{ title: 'Earnings' }} /><Tabs.Screen name="more" options={{ title: 'More' }} />
  </Tabs>;
}
