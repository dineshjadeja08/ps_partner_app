import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold, useFonts } from '@expo-google-fonts/manrope';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { OfflineBanner } from '@/components/offline-banner';
import { AppProvider } from '@/providers/app-provider';
import { useAuth } from '@/stores/auth';
import { colors, typography } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const restore = useAuth((state) => state.restore); const ready = useAuth((state) => state.ready);
  const [fontsLoaded] = useFonts({ Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold });
  useEffect(() => { void restore(); }, [restore]);
  useEffect(() => { if (fontsLoaded && ready) void SplashScreen.hideAsync(); }, [fontsLoaded, ready]);
  if (!fontsLoaded || !ready) return null;
  return <AppProvider><StatusBar style="dark" /><Stack screenOptions={{ headerTintColor: colors.heading, headerTitleStyle: { fontFamily: typography.bold }, headerShadowVisible: false, headerBackButtonDisplayMode: 'minimal', animation: 'slide_from_right', gestureEnabled: true, contentStyle: { backgroundColor: colors.background }, headerStyle: { backgroundColor: colors.background } }}>
    <Stack.Screen name="index" options={{ headerShown: false }} /><Stack.Screen name="login" options={{ headerShown: false }} /><Stack.Screen name="verify-otp" options={{ headerShown: false }} /><Stack.Screen name="permissions" options={{ headerShown: false, gestureEnabled: false }} /><Stack.Screen name="kyc" options={{ title: 'Partner verification', headerBackVisible: false, gestureEnabled: false }} />
    <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} /><Stack.Screen name="job/[id]" options={{ title: 'Job details' }} />
    <Stack.Screen name="performance" options={{ title: 'Performance report' }} /><Stack.Screen name="reviews" options={{ title: 'My reviews' }} /><Stack.Screen name="id-card" options={{ title: 'ID card' }} /><Stack.Screen name="restrictions" options={{ title: 'My restrictions' }} />
    <Stack.Screen name="service-guide" options={{ title: '', presentation: 'modal' }} /><Stack.Screen name="schedule" options={{ title: 'Today' }} /><Stack.Screen name="leaves" options={{ title: 'My leaves' }} /><Stack.Screen name="services" options={{ title: 'My services' }} />
    <Stack.Screen name="profile" options={{ title: 'Personal details' }} /><Stack.Screen name="recharge" options={{ title: 'Recharge wallet' }} /><Stack.Screen name="help" options={{ title: 'Help & support' }} />
  </Stack><OfflineBanner /></AppProvider>;
}
