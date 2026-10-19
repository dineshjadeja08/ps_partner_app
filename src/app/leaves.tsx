import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { Card, EmptyState, SampleDataNote, SectionTitle, StatusPill } from '@/components/partner-ui';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Screen } from '@/components/ui/screen';
import { RowSkeleton } from '@/components/ui/skeleton';
import { MessageState } from '@/components/ui/states';
import { api } from '@/lib/api';
import { formatDate, localDay } from '@/lib/format';
import { colors, typography } from '@/theme/tokens';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').refine((value) => !Number.isNaN(new Date(`${value}T12:00:00`).getTime()), 'Enter a real date');
const schema = z.object({ start_date: date, end_date: date, reason: z.string().trim().min(3, 'Add a short reason') })
  .refine((value) => value.start_date >= localDay(), { path: ['start_date'], message: 'Leave must start today or later' })
  .refine((value) => value.end_date >= value.start_date, { path: ['end_date'], message: 'End date must be on or after the start date' });
type Form = z.infer<typeof schema>;

export default function LeavesScreen() {
  const client = useQueryClient();
  const leaves = useQuery({ queryKey: ['partner', 'leaves'], queryFn: api.partner.leaves });
  const [applying, setApplying] = useState(false);
  const { control, handleSubmit, reset } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { start_date: localDay(1), end_date: localDay(1), reason: '' } });
  const apply = useMutation({ mutationFn: api.partner.applyLeave, onSuccess: () => { reset(); setApplying(false); void client.invalidateQueries({ queryKey: ['partner', 'leaves'] }); } });
  return <Screen refreshing={leaves.isRefetching} onRefresh={() => void leaves.refetch()}>
    <SampleDataNote />
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
        <View style={styles.top}><Text style={styles.title}>{leave.start_date === leave.end_date ? formatDate(leave.start_date) : `${formatDate(leave.start_date)} – ${formatDate(leave.end_date)}`}</Text><StatusPill label={leave.status} tone={leave.status === 'APPROVED' ? 'success' : leave.status === 'REJECTED' ? 'danger' : 'progress'} /></View>
        <Text style={styles.meta}>{leave.reason}</Text>
      </Card>) : <EmptyState icon="airplane-outline" title="No leaves yet" />}
  </Screen>;
}
const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flexShrink: 1, color: colors.heading, fontFamily: typography.bold, fontSize: 15 },
  meta: { color: colors.body, fontFamily: typography.regular, fontSize: 13, lineHeight: 19 },
  error: { color: colors.danger, fontFamily: typography.semibold, fontSize: 12.5 },
});
