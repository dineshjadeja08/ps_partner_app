import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState, SampleDataNote, TabHeader } from '@/components/partner-ui';
import { Screen } from '@/components/ui/screen';
import { RowSkeleton } from '@/components/ui/skeleton';
import { MessageState } from '@/components/ui/states';
import { api, money } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { useProfile } from '@/lib/queries';
import { colors, radius, spacing, typography } from '@/theme/tokens';

export default function EarningsScreen() {
  const profile = useProfile(); const earnings = useQuery({ queryKey: ['partner', 'earnings'], queryFn: api.partner.earnings });
  return <>
    <TabHeader title="Earnings" status={profile.data?.status} />
    <Screen refreshing={earnings.isRefetching} onRefresh={() => void earnings.refetch()}>
      <SampleDataNote />
      <View style={styles.total}><Text style={styles.totalLabel}>My earnings</Text><Text style={styles.totalValue}>{earnings.data ? money(earnings.data.total) : '–'}</Text></View>
      {earnings.isLoading ? <RowSkeleton /> : earnings.isError ? <MessageState title="Couldn’t load earnings" message={earnings.error.message} actionLabel="Try again" onAction={() => void earnings.refetch()} />
        : earnings.data?.settlements.length ? <View style={styles.list}>{earnings.data.settlements.map((item) => <Pressable key={item.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/settlement/[id]', params: { id: item.id } })} style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}>
          <View style={styles.flex}><Text style={styles.meta}>{formatDateTime(item.created_at)}</Text><Text style={styles.title}>{item.service_name}</Text><Text style={styles.meta}>WO {item.work_order} | Invoice {item.invoice_number}</Text></View>
          <Text style={[styles.amount, Number(item.amount) < 0 && { color: colors.danger }]}>{money(item.amount)}</Text><Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>)}</View>
        : <EmptyState icon="cash-outline" title="No earnings yet" message="Completed jobs and their settlements appear here." />}
    </Screen>
  </>;
}
const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  total: { alignItems: 'center', gap: 4, paddingVertical: spacing.lg },
  totalLabel: { color: colors.heading, fontFamily: typography.bold, fontSize: 17 },
  totalValue: { color: colors.success, fontFamily: typography.extrabold, fontSize: 34 },
  list: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.lg, borderBottomWidth: 1, borderColor: colors.border },
  title: { color: colors.heading, fontFamily: typography.semibold, fontSize: 14.5 },
  meta: { color: colors.muted, fontFamily: typography.regular, fontSize: 11.5 },
  amount: { color: colors.success, fontFamily: typography.extrabold, fontSize: 15 },
});
