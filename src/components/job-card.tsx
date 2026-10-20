import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Card, StatusPill } from '@/components/partner-ui';
import { formatDate, formatSlot } from '@/lib/format';
import { isOverdue, jobStatusLabel, jobTone } from '@/lib/jobs';
import { colors, typography } from '@/theme/tokens';
import type { Job } from '@/types/api';

export function JobCard({ job }: { job: Job }) {
  const overdue = isOverdue(job);
  return <Card onPress={() => router.push({ pathname: '/job/[id]', params: { id: job.id } })}>
    <View style={styles.top}><Text numberOfLines={1} style={styles.name}>{job.customer_name || 'Customer'}</Text><StatusPill label={overdue ? 'Overdue' : jobStatusLabel(job)} tone={overdue ? 'danger' : jobTone(job.booking_status)} /></View>
    <Text style={styles.meta}>{job.booking_number} | {formatDate(job.service_date)}, {formatSlot(job.time_slot.start_time, job.time_slot.end_time)}</Text>
    <Text style={styles.service}>{job.service.name}</Text>
  </Card>;
}
const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  name: { flexShrink: 1, color: colors.heading, fontFamily: typography.bold, fontSize: 16 },
  meta: { color: colors.muted, fontFamily: typography.medium, fontSize: 12.5 },
  service: { color: colors.body, fontFamily: typography.semibold, fontSize: 14 },
});
