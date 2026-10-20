import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { Card, EmptyState, SectionTitle, StatusPill } from '@/components/partner-ui';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Screen } from '@/components/ui/screen';
import { RowSkeleton } from '@/components/ui/skeleton';
import { MessageState } from '@/components/ui/states';
import { api } from '@/lib/api';
import { formatDate, localDay } from '@/lib/format';
import type { LeaveInput } from '@/types/api';
import { colors, typography } from '@/theme/tokens';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').refine((value) => !Number.isNaN(new Date(`${value}T12:00:00`).getTime()), 'Enter a real date');
const schema = z.object({ start_date: date, end_date: date, reason: z.string().trim().min(3, 'Add a short reason') })
  .refine((value) => value.start_date >= localDay(), { path: ['start_date'], message: 'Leave must start today or later' })
  .refine((value) => value.end_date >= value.start_date, { path: ['end_date'], message: 'End date must be on or after the start date' });
type Form = z.infer<typeof schema>;
// Whole days in the partner's time zone: from the start day's midnight to the midnight after the end day.
const toLeaveInput = (form: Form): LeaveInput => { const end = new Date(`${form.end_date}T00:00:00`); end.setDate(end.getDate() + 1); return { start_at: new Date(`${form.start_date}T00:00:00`).toISOString(), end_at: end.toISOString(), reason: form.reason.trim() }; };
const toLocalDay = (iso: string) => { const date = new Date(iso); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; };
const lastDay = (iso: string) => toLocalDay(new Date(new Date(iso).getTime() - 1).toISOString());

export default function LeavesScreen() {
  const client = useQueryClient();
  const leaves = useQuery({ queryKey: ['me', 'leaves'], queryFn: api.me.leaves });
  const [applying, setApplying] = useState(false);
  const { control, handleSubmit, reset } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { start_date: localDay(1), end_date: localDay(1), reason: '' } });
  const apply = useMutation({ mutationFn: (form: Form) => api.me.applyLeave(toLeaveInput(form)), onSuccess: () => { reset(); setApplying(false); void client.invalidateQueries({ queryKey: ['me', 'leaves'] }); } });
  return <Screen refreshing={leaves.isRefetching} onRefresh={() => void leaves.refetch()}>
    {applying ? <Card>
      <Text style={styles.title}>Apply for leave</Text><Text style={styles.meta}>You won’t receive new jobs on these days. Reassign or finish existing jobs first.</Text>
      <Controller control={control} name="start_date" render={({ field, fieldState }) => <Field label="From (YYYY-MM-DD)" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} keyboardType="numbers-and-punctuation" />} />
      <Controller control={control} name="end_date" render={({ field, fieldState }) => <Field label="To (YYYY-MM-DD)" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} keyboardType="numbers-and-punctuation" />} />
      <Controller control={control} name="reason" render={({ field, fieldState }) => <Field label="Reason" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} placeholder="e.g. Family function" />} />
      {apply.error ? <Text style={styles.error}>{apply.error.message}</Text> : null}
      <Button loading={apply.isPending} onPress={handleSubmit((values) => apply.mutate(values))}>Submit request</Button>
      <Button variant="secondary" onPress={() => setApplying(false)}>Cancel</Button>
    </Card> : <Button onPress={() => setApplying(true)}>Apply for leave</Button>}
    <SectionTitle>Leave history</SectionTitle>
    {leaves.isLoading ? <RowSkeleton /> : leaves.isError ? <MessageState title="Couldn’t load leaves" message={leaves.error.message} actionLabel="Try again" onAction={() => void leaves.refetch()} />
      : leaves.data?.length ? leaves.data.map((leave) => <Card key={leave.id}>
        <View style={styles.top}><Text style={styles.title}>{toLocalDay(leave.start_at) === lastDay(leave.end_at) ? formatDate(toLocalDay(leave.start_at)) : `${formatDate(toLocalDay(leave.start_at))} – ${formatDate(lastDay(leave.end_at))}`}</Text><StatusPill label={leave.status} tone={leave.status === 'APPROVED' ? 'success' : leave.status === 'REJECTED' ? 'danger' : 'progress'} /></View>
        <Text style={styles.meta}>{leave.reason}</Text>{leave.review_note ? <Text style={styles.meta}>Note: {leave.review_note}</Text> : null}
      </Card>) : <EmptyState icon="airplane-outline" title="No leaves yet" />}
  </Screen>;
}
const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flexShrink: 1, color: colors.heading, fontFamily: typography.bold, fontSize: 15 },
  meta: { color: colors.body, fontFamily: typography.regular, fontSize: 13, lineHeight: 19 },
  error: { color: colors.danger, fontFamily: typography.semibold, fontSize: 12.5 },
});
