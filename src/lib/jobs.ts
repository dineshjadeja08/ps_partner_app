import { api } from '@/lib/api';
import { localDay } from '@/lib/format';
import type { BookingStatus, Job } from '@/types/api';

export const jobsQueryKey = ['jobs'] as const;
export const jobsQuery = { queryKey: jobsQueryKey, queryFn: api.jobs.list };

const labels: Partial<Record<BookingStatus, string>> = {
  CONFIRMED: 'New', TECHNICIAN_ASSIGNED: 'Assigned', TECHNICIAN_EN_ROUTE: 'On the way', IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed', CLOSED: 'Closed', CANCELLED: 'Cancelled', REFUND_PENDING: 'Cancelled', REFUNDED: 'Cancelled',
};
export const jobStatusLabel = (status: string) => labels[status as BookingStatus] ?? status.replaceAll('_', ' ').toLowerCase();
export type Tone = 'info' | 'progress' | 'success' | 'danger';
export function jobTone(status: BookingStatus): Tone {
  if (status === 'COMPLETED' || status === 'CLOSED') return 'success';
  if (status === 'CANCELLED' || status === 'REFUND_PENDING' || status === 'REFUNDED' || status === 'PAYMENT_FAILED') return 'danger';
  if (status === 'TECHNICIAN_EN_ROUTE' || status === 'IN_PROGRESS') return 'progress';
  return 'info';
}

const closed: BookingStatus[] = ['COMPLETED', 'CLOSED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED'];
export const isOpen = (job: Job) => !closed.includes(job.booking_status);
export const isOverdue = (job: Job) => isOpen(job) && job.service_date < localDay();

export type JobBucket = 'today' | 'tomorrow' | 'upcoming' | 'overdue' | 'closed';
export function bucketOf(job: Job): JobBucket {
  if (!isOpen(job)) return 'closed';
  if (job.service_date < localDay()) return 'overdue';
  if (job.service_date === localDay()) return 'today';
  if (job.service_date === localDay(1)) return 'tomorrow';
  return 'upcoming';
}
export function countBuckets(jobs: Job[]) {
  const counts: Record<JobBucket, number> = { today: 0, tomorrow: 0, upcoming: 0, overdue: 0, closed: 0 };
  jobs.forEach((job) => { counts[bucketOf(job)] += 1; });
  return counts;
}

/** The next step a partner can take on a job, following the backend's state machine. */
export function nextAction(job: Job) {
  if (job.booking_status === 'CONFIRMED' || job.booking_status === 'TECHNICIAN_ASSIGNED') return { label: 'Start travelling', hint: 'Tell the customer you are on the way.', run: api.jobs.enRoute };
  if (job.booking_status === 'TECHNICIAN_EN_ROUTE') return { label: 'Start job', hint: 'Inspect the site and agree the work with the customer first.', run: api.jobs.start };
  if (job.booking_status === 'IN_PROGRESS') return { label: 'Complete job', hint: 'Confirm the work is finished and the customer is satisfied.', run: api.jobs.complete };
  return null;
}

/** Balance still to collect on site, in rupees. */
export const balanceRemaining = (job: Job) => Math.max(0, Number(job.balance_due) - Number(job.balance_collected));

export const addressText = (job: Job) => {
  const a = job.address_snapshot ?? {};
  return [a.address_line_1, a.address_line_2, a.landmark, a.locality, a.city, a.postal_code].filter(Boolean).join(', ');
};
