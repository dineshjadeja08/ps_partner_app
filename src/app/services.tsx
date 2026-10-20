import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, SectionTitle } from '@/components/partner-ui';
import { Screen } from '@/components/ui/screen';
import { LoadingState, MessageState } from '@/components/ui/states';
import { useProfile } from '@/lib/queries';
import { colors, spacing, typography } from '@/theme/tokens';

export default function ServicesScreen() {
  const profile = useProfile();
  if (profile.isLoading) return <LoadingState />;
  if (!profile.data) return <Screen><MessageState title="Couldn’t load services" message={profile.error?.message ?? 'Please try again.'} actionLabel="Try again" onAction={() => void profile.refetch()} /></Screen>;
  return <Screen>
    <SectionTitle>Services you offer</SectionTitle>
    {profile.data.skills.length ? <Card>{profile.data.skills.map((skill) => <View key={skill.id} style={styles.row}><Ionicons name="checkmark-circle" size={18} color={colors.success} /><Text style={styles.text}>{skill.name}</Text></View>)}</Card> : <EmptyState icon="construct-outline" title="No services yet" />}
    <SectionTitle>Service areas</SectionTitle>
    {profile.data.service_areas.length ? <Card>{profile.data.service_areas.map((area) => <View key={area.id} style={styles.row}><Ionicons name="location" size={18} color={colors.primary} /><Text style={styles.text}>{area.name}, {area.city} – {area.postal_code}</Text></View>)}</Card> : <EmptyState icon="location-outline" title="No service areas yet" />}
    <Text style={styles.note}>To add services or areas, contact your Purple Squad partner manager. New skills may need a short assessment.</Text>
  </Screen>;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6 },
  text: { flex: 1, color: colors.heading, fontFamily: typography.semibold, fontSize: 14.5 },
  note: { color: colors.body, fontFamily: typography.regular, fontSize: 13, lineHeight: 19 },
});
