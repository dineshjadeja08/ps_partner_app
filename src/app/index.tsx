import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useEffect, useState } from 'react';
import { MessageState } from '@/components/ui/states';
import { permissionsStorage } from '@/lib/session';
import { useProfile } from '@/lib/queries';
import { useAuth } from '@/stores/auth';
import { colors, spacing } from '@/theme/tokens';

// Sign in → KYC until an admin verifies the partner → location permissions once → dashboard.
export default function Index() {
  const user = useAuth((state) => state.user);
  if (!user) return <Redirect href="/login" />;
  return <SignedIn />;
}

function SignedIn() {
  const profile = useProfile();
  const [granted, setGranted] = useState<boolean | null>(null);
  useEffect(() => { void permissionsStorage.get().then(setGranted); }, []);
  if (profile.isError && !profile.data) return <View style={{ flex: 1, justifyContent: 'center', padding: spacing.lg }}><MessageState title="Couldn’t load your account" message={profile.error.message} actionLabel="Try again" onAction={() => void profile.refetch()} /></View>;
  if (!profile.data || granted === null) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.primary} /></View>;
  if (profile.data.background_verification_status !== 'VERIFIED') return <Redirect href="/kyc" />;
  return <Redirect href={granted ? '/(tabs)' : '/permissions'} />;
}
