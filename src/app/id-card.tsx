import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { SampleDataNote, StatusPill } from '@/components/partner-ui';
import { Screen } from '@/components/ui/screen';
import { LoadingState, MessageState } from '@/components/ui/states';
import { useProfile } from '@/lib/queries';
import { colors, radius, spacing, typography } from '@/theme/tokens';

// Shown to customers at the door, so it carries only what they need to verify the partner.
export default function IdCardScreen() {
  const profile = useProfile();
  if (profile.isLoading) return <LoadingState />;
  if (!profile.data) return <Screen><MessageState title="Couldn’t load ID card" message={profile.error?.message ?? 'Please try again.'} actionLabel="Try again" onAction={() => void profile.refetch()} /></Screen>;
  const data = profile.data; const verified = data.background_verification_status === 'VERIFIED';
  return <Screen>
    <SampleDataNote />
    <View style={styles.card}>
      <View style={styles.band}><Image source={require('../../assets/images/icon.png')} contentFit="cover" style={styles.logo} /><Text style={styles.bandText}>PURPLE SQUAD PARTNER</Text></View>
      <View style={styles.photo}>{data.profile_photo_url ? <Image source={{ uri: data.profile_photo_url }} style={styles.photoImg} /> : <Text style={styles.initial}>{data.display_name.slice(0, 1)}</Text>}</View>
      <Text style={styles.name}>{data.display_name}</Text>
      <StatusPill label={verified ? 'Verified partner' : 'Verification pending'} tone={verified ? 'success' : 'progress'} />
      <View style={styles.rows}>
        <Row label="Company" value={data.company_name} /><Row label="Address" value={data.company_address} /><Row label="Partner ID" value={data.partner_code} /><Row label="Status" value={data.status.replaceAll('_', ' ')} />
      </View>
      {verified ? <View style={styles.seal}><Ionicons name="shield-checkmark" size={18} color={colors.success} /><Text style={styles.sealText}>Background verified by Purple Squad</Text></View> : null}
    </View>
  </Screen>;
}
function Row({ label, value }: { label: string; value: string }) { return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>; }
const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: spacing.md, paddingBottom: spacing.xl, borderRadius: radius.card, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  band: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.lg, backgroundColor: colors.primary },
  logo: { width: 32, height: 32, borderRadius: 8 },
  bandText: { color: colors.white, fontFamily: typography.extrabold, fontSize: 14, letterSpacing: 1.5 },
  photo: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft, borderWidth: 4, borderColor: colors.white, marginTop: -8 },
  photoImg: { width: 88, height: 88, borderRadius: 44 },
  initial: { color: colors.primary, fontFamily: typography.extrabold, fontSize: 36 },
  name: { color: colors.heading, fontFamily: typography.extrabold, fontSize: 21 },
  rows: { alignSelf: 'stretch', marginHorizontal: spacing.lg, padding: spacing.md, borderRadius: radius.button, backgroundColor: colors.primarySoft },
  row: { flexDirection: 'row', gap: spacing.md, paddingVertical: 8, borderBottomWidth: 1, borderColor: '#E6DAF6' },
  label: { width: 90, color: colors.body, fontFamily: typography.regular, fontSize: 13.5 },
  value: { flex: 1, color: colors.heading, fontFamily: typography.semibold, fontSize: 14 },
  seal: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sealText: { color: colors.success, fontFamily: typography.semibold, fontSize: 13 },
});
