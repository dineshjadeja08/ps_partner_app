import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState, Grid, StatTile, TabHeader } from '@/components/partner-ui';
import { Screen } from '@/components/ui/screen';
import { RowSkeleton } from '@/components/ui/skeleton';
import { MessageState } from '@/components/ui/states';
import { api, money } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/format';
import { usePartnerStatus } from '@/lib/queries';
import { colors, radius, spacing, typography } from '@/theme/tokens';

const methods: Record<string, string> = { CASH: 'Cash', UPI: 'UPI', CARD_OFFLINE: 'Card', OTHER: 'Other' };

export default function EarningsScreen() {
  const status = usePartnerStatus(); const earnings = useQuery({ queryKey: ['me', 'earnings'], queryFn: api.me.earnings });
  const data = earnings.data;
  return <>
    <TabHeader title="Earnings" status={status} />
    <Screen refreshing={earnings.isRefetching} onRefresh={() => void earnings.refetch()}>
      <View style={styles.total}><Text style={styles.totalLabel}>Completed job value</Text><Text style={styles.totalValue}>{data ? money(data.job_value_total) : '–'}</Text><Text style={styles.caption}>{data ? `${data.job_count} completed job${data.job_count === 1 ? '' : 's'}` : ' '}</Text></View>
      {data ? <Grid><StatTile icon="cash-outline" tone={colors.success} value={money(data.collected_by_you_total)} label="Collected by you" /><StatTile icon="card-outline" value={money(data.paid_online_total)} label="Paid online to Purple Squad" /></Grid> : null}
      <Text style={styles.note}>These are job values. Your payout after commission will appear here once settlements are set up.</Text>
      {earnings.isLoading ? <RowSkeleton /> : earnings.isError ? <MessageState title="Couldn’t load earnings" message={earnings.error.message} actionLabel="Try again" onAction={() => void earnings.refetch()} />
        : data?.jobs.length ? <View style={styles.list}>{data.jobs.map((job) => <Pressable key={job.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/job/[id]', params: { id: job.id } })} style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}>
          <View style={styles.flex}><Text style={styles.meta}>{job.completed_at ? formatDateTime(job.completed_at) : formatDate(job.service_date)}</Text><Text style={styles.title}>{job.service_name}</Text><Text style={styles.meta}>{job.booking_number}{Number(job.collected_by_you) > 0 ? ` · You collected ${money(job.collected_by_you)}${job.collection_method ? ` (${methods[job.collection_method] ?? job.collection_method})` : ''}` : ''}</Text></View>
          <Text style={styles.amount}>{money(job.total_amount)}</Text><Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>)}</View>
        : <EmptyState icon="cash-outline" title="No completed jobs yet" message="Jobs you complete appear here with what was collected." />}
    </Screen>
  </>;
}
const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  total: { alignItems: 'center', gap: 4, paddingVertical: spacing.md },
  totalLabel: { color: colors.heading, fontFamily: typography.bold, fontSize: 16 },
  totalValue: { color: colors.success, fontFamily: typography.extrabold, fontSize: 34 },
  caption: { color: colors.muted, fontFamily: typography.medium, fontSize: 12.5 },
  note: { color: colors.body, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18 },
  list: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.lg, borderBottomWidth: 1, borderColor: colors.border },
  title: { color: colors.heading, fontFamily: typography.semibold, fontSize: 14.5 },
  meta: { color: colors.muted, fontFamily: typography.regular, fontSize: 11.5 },
  amount: { color: colors.success, fontFamily: typography.extrabold, fontSize: 15 },
});
