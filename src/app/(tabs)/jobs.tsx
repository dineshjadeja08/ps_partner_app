import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { JobCard } from '@/components/job-card';
import { Chips, EmptyState, TabHeader } from '@/components/partner-ui';
import { Screen } from '@/components/ui/screen';
import { RowSkeleton } from '@/components/ui/skeleton';
import { MessageState } from '@/components/ui/states';
import { bucketOf, isOpen, jobsQuery, type JobBucket } from '@/lib/jobs';
import { colors, radius, spacing, typography } from '@/theme/tokens';

type Filter = 'all' | JobBucket;
const filters: { value: Filter; label: string }[] = [{ value: 'all', label: 'All' }, { value: 'today', label: 'Today' }, { value: 'upcoming', label: 'Upcoming' }, { value: 'overdue', label: 'Overdue' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }];

export default function JobsScreen() {
  const params = useLocalSearchParams<{ filter?: Filter }>();
  const [filter, setFilter] = useState<Filter>(params.filter ?? 'all');
  const [search, setSearch] = useState('');
  // The dashboard tiles open this tab with a filter; follow it when it changes.
  const [lastParam, setLastParam] = useState(params.filter);
  if (params.filter !== lastParam) { setLastParam(params.filter); if (params.filter) setFilter(params.filter); }
  const jobs = useQuery(jobsQuery);
  const term = search.trim().toLowerCase();
  const visible = (jobs.data?.results ?? [])
    .filter((job) => filter === 'all' || bucketOf(job) === filter)
    .filter((job) => !term || `${job.booking_number} ${job.customer_name ?? ''} ${job.service.name}`.toLowerCase().includes(term))
    // Open work first, soonest first; then closed jobs, most recent first.
    .sort((a, b) => (isOpen(a) !== isOpen(b) ? (isOpen(a) ? -1 : 1) : isOpen(a) ? a.service_date.localeCompare(b.service_date) : b.service_date.localeCompare(a.service_date)));
  return <>
    <TabHeader title="My jobs" />
    <Screen refreshing={jobs.isRefetching} onRefresh={() => void jobs.refetch()}>
      <View style={styles.search}><Ionicons name="search" size={18} color={colors.muted} /><TextInput value={search} onChangeText={setSearch} placeholder="Search by work order, customer or service" placeholderTextColor={colors.muted} style={styles.input} autoCapitalize="none" returnKeyType="search" /></View>
      <Chips options={filters} value={filter} onChange={setFilter} />
      {jobs.isLoading ? <RowSkeleton count={4} /> : jobs.isError ? <MessageState title="Couldn’t load jobs" message={jobs.error.message} actionLabel="Try again" onAction={() => void jobs.refetch()} />
        : visible.length ? visible.map((job) => <JobCard key={job.id} job={job} />)
        : <EmptyState icon="briefcase-outline" title={term ? 'No matching jobs' : 'No jobs here'} message={term ? 'Try a different work order or name.' : 'Jobs assigned to you by Purple Squad appear here.'} />}
    </Screen>
  </>;
}
const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 48, paddingHorizontal: 14, borderRadius: radius.button, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  input: { flex: 1, color: colors.heading, fontFamily: typography.regular, fontSize: 14.5, paddingVertical: 10 },
});
