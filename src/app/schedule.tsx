import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { JobCard } from '@/components/job-card';
import { Chips, EmptyState } from '@/components/partner-ui';
import { Screen } from '@/components/ui/screen';
import { RowSkeleton } from '@/components/ui/skeleton';
import { MessageState } from '@/components/ui/states';
import { localDay } from '@/lib/format';
import { bucketOf, isOpen, jobsQuery } from '@/lib/jobs';

type Filter = 'all' | 'pending' | 'done';
const filters: { value: Filter; label: string }[] = [{ value: 'all', label: 'All' }, { value: 'pending', label: 'To do' }, { value: 'done', label: 'Done' }];

export default function ScheduleScreen() {
  const jobs = useQuery(jobsQuery);
  const [filter, setFilter] = useState<Filter>('all');
  // Today's work: jobs scheduled today plus anything overdue that still needs finishing.
  const today = (jobs.data?.results ?? []).filter((job) => { const bucket = bucketOf(job); return bucket === 'today' || bucket === 'overdue' || (bucket === 'closed' && job.service_date === localDay()); })
    .filter((job) => filter === 'all' || (filter === 'pending' ? isOpen(job) : !isOpen(job)))
    .sort((a, b) => a.time_slot.start_time.localeCompare(b.time_slot.start_time));
  return <Screen refreshing={jobs.isRefetching} onRefresh={() => void jobs.refetch()}>
    <Chips options={filters} value={filter} onChange={setFilter} />
    {jobs.isLoading ? <RowSkeleton /> : jobs.isError ? <MessageState title="Couldn’t load schedule" message={jobs.error.message} actionLabel="Try again" onAction={() => void jobs.refetch()} />
      : today.length ? today.map((job) => <JobCard key={job.id} job={job} />)
      : <EmptyState icon="calendar-clear-outline" title="No schedules found" message="Effortlessly manage your schedules and stay on top of your work." />}
  </Screen>;
}
