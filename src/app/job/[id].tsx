import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Linking, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { JobPhotos } from '@/components/job-photos';
import { Card, KeyValue, StatusPill } from '@/components/partner-ui';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { LoadingState, MessageState } from '@/components/ui/states';
import { api, money } from '@/lib/api';
import { formatDate, formatSlot } from '@/lib/format';
import { addressText, balanceRemaining, isOverdue, jobsQuery, jobsQueryKey, jobStatusLabel, jobTone, nextStep, stepCopy, type JobStep } from '@/lib/jobs';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import type { Job, Paginated } from '@/types/api';

const stepOrder: JobStep[] = ['accept', 'travel', 'arrive', 'start', 'complete'];
const stepNames = ['Accepted', 'On the way', 'Arrived', 'Started', 'Completed'];

// react-native-web's Alert ignores buttons, so the web preview falls back to the browser dialog.
function confirmThen(title: string, message: string, ok: string, run: () => void) {
  if (Platform.OS === 'web') { if (globalThis.confirm(`${title}\n\n${message}`)) run(); return; }
  Alert.alert(title, message, [{ text: 'Cancel', style: 'cancel' }, { text: ok, onPress: run }]);
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const client = useQueryClient();
  // Show the copy from the jobs list instantly, then refresh this job from the backend.
  const jobs = useQuery(jobsQuery);
  const detail = useQuery({ queryKey: [...jobsQueryKey, id], queryFn: () => api.jobs.get(id), initialData: () => jobs.data?.results.find((item) => item.id === id), initialDataUpdatedAt: () => client.getQueryState(jobsQueryKey)?.dataUpdatedAt });
  const job = detail.data;
  const step = job ? nextStep(job) : null;
  const [otp, setOtp] = useState('');
  const otpInput = useRef<TextInput>(null);
  const saveJob = (updated: Job) => { client.setQueryData([...jobsQueryKey, id], updated); client.setQueryData<Paginated<Job>>(jobsQueryKey, (page) => page && { ...page, results: page.results.map((item) => (item.id === updated.id ? updated : item)) }); void client.invalidateQueries({ queryKey: jobsQueryKey }); };
  const advance = useMutation({
    mutationFn: (current: JobStep) => {
      if (current === 'accept') return api.jobs.accept(id);
      if (current === 'travel') return api.jobs.enRoute(id);
      if (current === 'arrive') return api.jobs.arrived(id);
      if (current === 'start') return api.jobs.start(id, otp);
      return api.jobs.complete(id);
    },
    onSuccess: (updated) => { setOtp(''); saveJob(updated); },
    // A wrong OTP is shown under the code boxes instead of in a popup.
    onError: (error: Error, current) => { if (current !== 'start') Alert.alert('Couldn’t update job', error.message); },
  });
  const collect = useMutation({
    mutationFn: (method: 'CASH' | 'UPI') => api.jobs.collectBalance(id, balanceRemaining(job!).toFixed(2), method),
    onSuccess: saveJob,
    onError: (error: Error) => Alert.alert('Couldn’t record payment', error.message),
  });
  if (detail.isLoading) return <LoadingState />;
  if (!job && detail.isError) return <Screen><MessageState title="Couldn’t load job" message={detail.error.message} actionLabel="Try again" onAction={() => void detail.refetch()} /></Screen>;
  if (!job) return <Screen><MessageState title="Job not found" message="This job is no longer assigned to you." actionLabel="Back to jobs" onAction={() => router.back()} /></Screen>;
  const phone = job.customer_phone || job.contact_phone;
  const address = addressText(job);
  const overdue = isOverdue(job);
  const remaining = balanceRemaining(job);
  const doneUpTo = job.booking_status === 'COMPLETED' || job.booking_status === 'CLOSED' ? stepOrder.length : step ? stepOrder.indexOf(step === 'collect' ? 'complete' : step) : -1;
  const openMaps = () => { const query = encodeURIComponent(address); void Linking.openURL(Platform.OS === 'ios' ? `maps:0,0?q=${query}` : `geo:0,0?q=${query}`); };
  const runStep = (current: JobStep) => (current === 'start' ? advance.mutate(current) : confirmThen(`${stepCopy[current].label}?`, stepCopy[current].hint, stepCopy[current].label, () => advance.mutate(current)));
  const confirmCollect = (method: 'CASH' | 'UPI') => confirmThen('Payment received?', `Confirm you received ${money(remaining)} by ${method === 'CASH' ? 'cash' : 'UPI'}.`, 'Yes, received', () => collect.mutate(method));

  const bottom = step === 'collect'
    ? <View style={styles.stack}><Button loading={collect.isPending && collect.variables === 'CASH'} disabled={collect.isPending} onPress={() => confirmCollect('CASH')}>{`Collected ${money(remaining)} in cash`}</Button><Button variant="secondary" loading={collect.isPending && collect.variables === 'UPI'} disabled={collect.isPending} onPress={() => confirmCollect('UPI')}>Collected by UPI</Button></View>
    : step ? <Button loading={advance.isPending} disabled={step === 'start' && otp.length !== 4} onPress={() => runStep(step)}>{stepCopy[step].label}</Button> : undefined;

  return <Screen refreshing={detail.isRefetching} onRefresh={() => void detail.refetch()} bottom={bottom}>
    <Card>
      <View style={styles.top}><Text style={styles.wo}>{job.booking_number}</Text><StatusPill label={overdue ? 'Overdue' : jobStatusLabel(job)} tone={overdue ? 'danger' : jobTone(job.booking_status)} /></View>
      <Text style={styles.service}>{job.service.name}{job.quantity && job.quantity > 1 ? ` × ${job.quantity}` : ''}</Text>
      <View style={styles.line}><Ionicons name="calendar-outline" size={16} color={colors.primary} /><Text style={styles.lineText}>{formatDate(job.service_date)} · {formatSlot(job.time_slot.start_time, job.time_slot.end_time)}</Text></View>
      {doneUpTo >= 0 ? <View style={styles.steps} accessibilityLabel={`Progress: ${stepNames[Math.max(0, doneUpTo - 1)]}`}>{stepNames.map((name, index) => <View key={name} style={styles.stepItem}><View style={[styles.dot, index < doneUpTo && styles.dotDone]}>{index < doneUpTo ? <Ionicons name="checkmark" size={11} color={colors.white} /> : null}</View><Text style={[styles.stepText, index < doneUpTo && styles.stepTextDone]}>{name}</Text></View>)}</View> : null}
    </Card>

    {step === 'start' ? <Card>
      <Text style={styles.label}>Service OTP</Text>
      <Text style={styles.body}>Ask the customer for the 4-digit code shown in their Purple Squad app.</Text>
      <Pressable onPress={() => otpInput.current?.focus()} style={styles.otpRow} accessibilityLabel="Enter service OTP">
        {[0, 1, 2, 3].map((index) => <View key={index} style={[styles.otpCell, otp.length === index && styles.otpCellActive]}><Text style={styles.otpDigit}>{otp[index] ?? ''}</Text></View>)}
      </Pressable>
      <TextInput ref={otpInput} value={otp} onChangeText={(value) => { advance.reset(); setOtp(value.replace(/\D/g, '').slice(0, 4)); }} keyboardType="number-pad" maxLength={4} style={styles.hidden} />
      {advance.error && advance.variables === 'start' ? <Text style={styles.otpError}>{advance.error.message}</Text> : null}
    </Card> : null}

    <Card>
      <Text style={styles.label}>Customer</Text><Text style={styles.customer}>{job.customer_name || 'Customer'}</Text>
      {address ? <Pressable accessibilityRole="link" onPress={openMaps} style={styles.line}><Ionicons name="location-outline" size={16} color={colors.primary} /><Text style={[styles.lineText, styles.flex]}>{address}</Text><Ionicons name="navigate-outline" size={16} color={colors.primary} /></Pressable> : null}
      {phone ? <View style={styles.actions}><Pressable accessibilityRole="button" onPress={() => void Linking.openURL(`tel:${phone}`)} style={styles.action}><Ionicons name="call" size={16} color={colors.white} /><Text style={styles.actionText}>Call customer</Text></Pressable>{address ? <Pressable accessibilityRole="button" onPress={openMaps} style={[styles.action, styles.actionGhost]}><Ionicons name="map" size={16} color={colors.primary} /><Text style={[styles.actionText, { color: colors.primary }]}>Directions</Text></Pressable> : null}</View> : null}
    </Card>
    {job.problem_description || job.customer_notes ? <Card><Text style={styles.label}>Customer notes</Text><Text style={styles.body}>{[job.problem_description, job.customer_notes].filter(Boolean).join('\n\n')}</Text></Card> : null}
    <Card>
      <Text style={styles.label}>Payment</Text>
      <KeyValue label="Order total" value={money(job.total_amount)} /><KeyValue label="Paid online (advance)" value={money(job.advance_paid)} /><KeyValue label="Already collected" value={money(job.balance_collected)} />
      <View style={styles.divider} /><KeyValue strong label="Collect from customer" value={money(remaining)} />
    </Card>
    {job.booking_status === 'IN_PROGRESS' || job.booking_status === 'COMPLETED' || job.booking_status === 'CLOSED' ? <JobPhotos jobId={job.id} editable={job.booking_status === 'IN_PROGRESS'} /> : null}
    {step ? <View style={styles.hint}><Ionicons name="information-circle-outline" size={16} color={colors.primary} /><Text style={styles.hintText}>{stepCopy[step].hint}</Text></View> : null}
  </Screen>;
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wo: { color: colors.muted, fontFamily: typography.bold, fontSize: 13, letterSpacing: 0.4 },
  service: { color: colors.heading, fontFamily: typography.extrabold, fontSize: 20 },
  line: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  lineText: { color: colors.body, fontFamily: typography.medium, fontSize: 14, lineHeight: 20 },
  steps: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  stepItem: { alignItems: 'center', gap: 4, flex: 1 },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  dotDone: { borderColor: colors.primary, backgroundColor: colors.primary },
  stepText: { color: colors.muted, fontFamily: typography.medium, fontSize: 10.5, textAlign: 'center' },
  stepTextDone: { color: colors.primary, fontFamily: typography.bold },
  label: { color: colors.muted, fontFamily: typography.bold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  customer: { color: colors.heading, fontFamily: typography.bold, fontSize: 17 },
  body: { color: colors.body, fontFamily: typography.regular, fontSize: 14, lineHeight: 21 },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md, marginVertical: spacing.sm },
  otpCell: { width: 54, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: radius.button, backgroundColor: '#ECECEF' },
  otpCellActive: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primarySoft },
  otpDigit: { color: colors.heading, fontFamily: typography.extrabold, fontSize: 24 },
  hidden: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  otpError: { color: colors.danger, fontFamily: typography.semibold, fontSize: 13, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  action: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44, borderRadius: radius.pill, backgroundColor: colors.primary },
  actionGhost: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.primary },
  actionText: { color: colors.white, fontFamily: typography.bold, fontSize: 14 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  stack: { gap: spacing.sm },
  hint: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.button, backgroundColor: colors.primarySoft },
  hintText: { flex: 1, color: colors.primary, fontFamily: typography.medium, fontSize: 13, lineHeight: 19 },
});
