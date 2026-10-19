import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, KeyValue, StatusPill } from '@/components/partner-ui';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { LoadingState, MessageState } from '@/components/ui/states';
import { money } from '@/lib/api';
import { formatDate, formatSlot } from '@/lib/format';
import { addressText, isOverdue, jobsQuery, jobsQueryKey, jobStatusLabel, jobTone, nextAction } from '@/lib/jobs';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import type { Job, Paginated } from '@/types/api';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const client = useQueryClient();
  // The backend has no single-job endpoint for technicians yet; read from the jobs list.
  const jobs = useQuery(jobsQuery);
  const job = jobs.data?.results.find((item) => item.id === id);
  const action = job ? nextAction(job) : null;
  const update = useMutation({
    mutationFn: () => action!.run(job!.id),
    onSuccess: (updated) => { client.setQueryData<Paginated<Job>>(jobsQueryKey, (page) => page && { ...page, results: page.results.map((item) => (item.id === updated.id ? updated : item)) }); void client.invalidateQueries({ queryKey: jobsQueryKey }); },
    onError: (error: Error) => Alert.alert('Couldn’t update job', error.message),
  });
  if (jobs.isLoading) return <LoadingState />;
  if (jobs.isError) return <Screen><MessageState title="Couldn’t load job" message={jobs.error.message} actionLabel="Try again" onAction={() => void jobs.refetch()} /></Screen>;
  if (!job) return <Screen><MessageState title="Job not found" message="This job is no longer assigned to you." actionLabel="Back to jobs" onAction={() => router.back()} /></Screen>;
  const phone = job.customer_phone || job.contact_phone;
  const address = addressText(job);
  const overdue = isOverdue(job);
  const confirm = () => Alert.alert(action!.label, action!.hint, [{ text: 'Cancel', style: 'cancel' }, { text: action!.label, onPress: () => update.mutate() }]);
  const openMaps = () => { const query = encodeURIComponent(address); void Linking.openURL(Platform.OS === 'ios' ? `maps:0,0?q=${query}` : `geo:0,0?q=${query}`); };
  return <Screen refreshing={jobs.isRefetching} onRefresh={() => void jobs.refetch()} bottom={action ? <Button loading={update.isPending} onPress={confirm}>{action.label}</Button> : undefined}>
    <Card>
      <View style={styles.top}><Text style={styles.wo}>{job.booking_number}</Text><StatusPill label={overdue ? 'Overdue' : jobStatusLabel(job.booking_status)} tone={overdue ? 'danger' : jobTone(job.booking_status)} /></View>
      <Text style={styles.service}>{job.service.name}{job.quantity && job.quantity > 1 ? ` × ${job.quantity}` : ''}</Text>
      <View style={styles.line}><Ionicons name="calendar-outline" size={16} color={colors.primary} /><Text style={styles.lineText}>{formatDate(job.service_date)} · {formatSlot(job.time_slot.start_time, job.time_slot.end_time)}</Text></View>
    </Card>
    <Card>
      <Text style={styles.label}>Customer</Text><Text style={styles.customer}>{job.customer_name || 'Customer'}</Text>
      {address ? <Pressable accessibilityRole="link" onPress={openMaps} style={styles.line}><Ionicons name="location-outline" size={16} color={colors.primary} /><Text style={[styles.lineText, styles.flex]}>{address}</Text><Ionicons name="navigate-outline" size={16} color={colors.primary} /></Pressable> : null}
      {phone ? <View style={styles.actions}><Pressable accessibilityRole="button" onPress={() => void Linking.openURL(`tel:${phone}`)} style={styles.action}><Ionicons name="call" size={16} color={colors.white} /><Text style={styles.actionText}>Call customer</Text></Pressable>{address ? <Pressable accessibilityRole="button" onPress={openMaps} style={[styles.action, styles.actionGhost]}><Ionicons name="map" size={16} color={colors.primary} /><Text style={[styles.actionText, { color: colors.primary }]}>Directions</Text></Pressable> : null}</View> : null}
    </Card>
    {job.problem_description || job.customer_notes ? <Card><Text style={styles.label}>Customer notes</Text><Text style={styles.body}>{[job.problem_description, job.customer_notes].filter(Boolean).join('\n\n')}</Text></Card> : null}
    <Card>
      <Text style={styles.label}>Payment</Text>
      <KeyValue label="Order total" value={money(job.total_amount)} /><KeyValue label="Paid online (advance)" value={money(job.advance_paid)} /><KeyValue label="Already collected" value={money(job.balance_collected)} />
      <View style={styles.divider} /><KeyValue strong label="Collect from customer" value={money(job.balance_due)} />
    </Card>
    {action ? <View style={styles.hint}><Ionicons name="information-circle-outline" size={16} color={colors.primary} /><Text style={styles.hintText}>{action.hint}</Text></View> : null}
  </Screen>;
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wo: { color: colors.muted, fontFamily: typography.bold, fontSize: 13, letterSpacing: 0.4 },
  service: { color: colors.heading, fontFamily: typography.extrabold, fontSize: 20 },
  line: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  lineText: { color: colors.body, fontFamily: typography.medium, fontSize: 14, lineHeight: 20 },
  label: { color: colors.muted, fontFamily: typography.bold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  customer: { color: colors.heading, fontFamily: typography.bold, fontSize: 17 },
  body: { color: colors.body, fontFamily: typography.regular, fontSize: 14, lineHeight: 21 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  action: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44, borderRadius: radius.pill, backgroundColor: colors.primary },
  actionGhost: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.primary },
  actionText: { color: colors.white, fontFamily: typography.bold, fontSize: 14 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  hint: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.button, backgroundColor: colors.primarySoft },
  hintText: { flex: 1, color: colors.primary, fontFamily: typography.medium, fontSize: 13, lineHeight: 19 },
});
