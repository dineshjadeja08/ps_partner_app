import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { MenuRow, TabHeader } from '@/components/partner-ui';
import { Screen } from '@/components/ui/screen';
import { usePartnerStatus, useProfile } from '@/lib/queries';
import { useAuth } from '@/stores/auth';
import { colors, radius, spacing, typography } from '@/theme/tokens';

export default function MoreScreen() {
  const profile = useProfile(); const status = usePartnerStatus(); const user = useAuth((state) => state.user); const logout = useAuth((state) => state.logout);
  const name = profile.data?.display_name ?? ([user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Partner');
  const confirmLogout = () => Alert.alert('Log out?', 'You will stop receiving jobs on this device until you sign in again.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log out', style: 'destructive', onPress: () => void logout().finally(() => router.replace('/login')) }]);
  return <>
    <TabHeader title="Profile" status={status} />
    <Screen>
      <Pressable accessibilityRole="button" onPress={() => router.push('/profile')} style={styles.profile}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{name.slice(0, 1).toUpperCase()}</Text></View>
        <View style={styles.flex}><Text style={styles.name}>{name}</Text><Text style={styles.role}>{profile.data ? `${profile.data.technician_type === 'PARTNER' ? 'Partner' : 'Technician'} · ${profile.data.employee_code}` : 'Technician'}</Text><Text style={styles.link}>View personal details</Text></View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>
      <View style={styles.group}>
        <MenuRow icon="construct-outline" label="My services" onPress={() => router.push('/services')} />
        <MenuRow icon="calendar-outline" label="Today’s schedule" onPress={() => router.push('/schedule')} />
        <MenuRow icon="airplane-outline" label="My leaves" onPress={() => router.push('/leaves')} />
        <MenuRow icon="star-outline" label="My reviews" onPress={() => router.push('/reviews')} />
        <MenuRow icon="bar-chart-outline" label="Performance report" onPress={() => router.push('/performance')} />
        <MenuRow icon="alert-circle-outline" label="My restrictions" onPress={() => router.push('/restrictions')} />
        <MenuRow icon="list-outline" label="My all orders" onPress={() => router.push('/(tabs)/jobs')} />
        <MenuRow icon="id-card-outline" label="Purple Squad partner ID" detail={profile.data?.employee_code} onPress={() => router.push('/id-card')} />
      </View>
      <View style={styles.group}>
        <MenuRow icon="book-outline" label="Service flow guide" onPress={() => router.push('/service-guide')} />
        <MenuRow icon="location-outline" label="App permissions" onPress={() => router.push('/permissions')} />
        <MenuRow icon="help-circle-outline" label="Help & support" onPress={() => router.push('/help')} />
      </View>
      <Text accessibilityRole="button" onPress={confirmLogout} style={styles.logout}>LOG OUT</Text>
      <Text style={styles.version}>App version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
    </Screen>
  </>;
}
const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  avatar: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  avatarText: { color: colors.primary, fontFamily: typography.extrabold, fontSize: 22 },
  name: { color: colors.heading, fontFamily: typography.bold, fontSize: 17 },
  role: { color: colors.body, fontFamily: typography.regular, fontSize: 12.5 },
  link: { color: colors.primary, fontFamily: typography.semibold, fontSize: 12.5 },
  group: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  logout: { alignSelf: 'center', paddingVertical: spacing.sm, color: colors.danger, fontFamily: typography.extrabold, fontSize: 15, letterSpacing: 0.5 },
  version: { color: colors.muted, fontFamily: typography.regular, fontSize: 12, textAlign: 'center' },
});
