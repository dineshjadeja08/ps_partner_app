import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useEffect, useState } from 'react';
import { permissionsStorage } from '@/lib/session';
import { useAuth } from '@/stores/auth';
import { colors } from '@/theme/tokens';

// Partners must sign in, then grant location permissions once, before reaching the dashboard.
export default function Index() {
  const user = useAuth((state) => state.user);
  const [granted, setGranted] = useState<boolean | null>(null);
  useEffect(() => { void permissionsStorage.get().then(setGranted); }, []);
  if (!user) return <Redirect href="/login" />;
  if (granted === null) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.primary} /></View>;
  return <Redirect href={granted ? '/(tabs)' : '/permissions'} />;
}
