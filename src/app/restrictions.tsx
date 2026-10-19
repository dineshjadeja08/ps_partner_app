import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, SampleDataNote } from '@/components/partner-ui';
import { Screen } from '@/components/ui/screen';
import { LoadingState, MessageState } from '@/components/ui/states';
import { formatDateTime } from '@/lib/format';
import { useRestrictions } from '@/lib/queries';
import { colors, radius, spacing, typography } from '@/theme/tokens';

export default function RestrictionsScreen() {
  const restrictions = useRestrictions();
  if (restrictions.isLoading) return <LoadingState />;
  if (restrictions.isError) return <Screen><MessageState title="Couldn’t load restrictions" message={restrictions.error.message} actionLabel="Try again" onAction={() => void restrictions.refetch()} /></Screen>;
  const list = restrictions.data ?? [];
  return <Screen refreshing={restrictions.isRefetching} onRefresh={() => void restrictions.refetch()}>
    <SampleDataNote />
    {list.length ? list.map((item) => <Card key={item.id} style={styles.card}>
      <Text style={styles.heading}>Why your profile has been restricted</Text>
      <Bullet>{item.level} – {item.reason}{item.work_order ? ` WO #${item.work_order}` : ''}</Bullet><Text style={styles.meta}>Since {formatDateTime(item.created_at)}</Text>
      <Text style={styles.heading}>How to remove the restriction</Text>{item.how_to_resolve.map((line) => <Bullet key={line}>{line}</Bullet>)}
      <Text style={styles.heading}>What happens while restricted?</Text>{item.consequences.map((line) => <Bullet key={line}>{line}</Bullet>)}
    </Card>) : <EmptyState icon="shield-checkmark-outline" title="No restrictions" message="Your profile is in good standing. Keep finishing jobs on time." />}
    {list.length ? <View style={styles.note}><Text style={styles.noteText}>Act now to remove the restriction and get more jobs. Contact your Purple Squad partner manager for help.</Text></View> : null}
  </Screen>;
}
function Bullet({ children }: { children: ReactNode }) { return <View style={styles.bullet}><Text style={styles.dot}>•</Text><Text style={styles.body}>{children}</Text></View>; }
const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  heading: { color: colors.heading, fontFamily: typography.bold, fontSize: 16, marginTop: spacing.sm },
  bullet: { flexDirection: 'row', gap: spacing.sm },
  dot: { color: colors.heading, fontSize: 14, lineHeight: 21 },
  body: { flex: 1, color: colors.body, fontFamily: typography.regular, fontSize: 14, lineHeight: 21 },
  meta: { color: colors.muted, fontFamily: typography.regular, fontSize: 12, marginLeft: spacing.lg },
  note: { padding: spacing.lg, borderRadius: radius.card, backgroundColor: colors.primarySoft },
  noteText: { color: colors.body, fontFamily: typography.medium, fontSize: 13.5, lineHeight: 20 },
});
