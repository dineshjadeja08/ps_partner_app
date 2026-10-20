import { api } from '@/lib/api';
import { localDay } from '@/lib/format';
import type { BookingStatus, Job } from '@/types/api';

export const jobsQueryKey = ['jobs'] as const;
export const jobsQuery = { queryKey: jobsQueryKey, queryFn: api.jobs.list };

/** Status label, including the Accepted and Arrived steps the backend records as timestamps. */
export function jobStatusLabel(job: Job) {
  switch (job.booking_status) {
    case 'CONFIRMED': return 'New';
    case 'TECHNICIAN_ASSIGNED': return job.accepted_at ? 'Accepted' : 'New';
    case 'TECHNICIAN_EN_ROUTE': return job.arrived_at ? 'Arrived' : 'On the way';
    case 'IN_PROGRESS': return 'Started';
    case 'COMPLETED': case 'CLOSED': return 'Completed';
    case 'CANCELLED': case 'REFUND_PENDING': case 'REFUNDED': return 'Cancelled';
    default: return job.booking_status.replaceAll('_', ' ').toLowerCase();
  }
}
export type Tone = 'info' | 'progress' | 'success' | 'danger';
export function jobTone(status: BookingStatus): Tone {
  if (status === 'COMPLETED' || status === 'CLOSED') return 'success';
  if (status === 'CANCELLED' || status === 'REFUND_PENDING' || status === 'REFUNDED' || status === 'PAYMENT_FAILED') return 'danger';
  if (status === 'TECHNICIAN_EN_ROUTE' || status === 'IN_PROGRESS') return 'progress';
  return 'info';
}

const completed: BookingStatus[] = ['COMPLETED', 'CLOSED'];
const cancelled: BookingStatus[] = ['CANCELLED', 'REFUND_PENDING', 'REFUNDED', 'PAYMENT_FAILED'];
export const isOpen = (job: Job) => !completed.includes(job.booking_status) && !cancelled.includes(job.booking_status);
export const isOverdue = (job: Job) => isOpen(job) && job.service_date < localDay();

export type JobBucket = 'today' | 'upcoming' | 'overdue' | 'completed' | 'cancelled';
export function bucketOf(job: Job): JobBucket {
  if (completed.includes(job.booking_status)) return 'completed';
  if (cancelled.includes(job.booking_status)) return 'cancelled';
  if (job.service_date < localDay()) return 'overdue';
  if (job.service_date === localDay()) return 'today';
  return 'upcoming';
}
export function countBuckets(jobs: Job[]) {
  const counts: Record<JobBucket, number> = { today: 0, upcoming: 0, overdue: 0, completed: 0, cancelled: 0 };
  jobs.forEach((job) => { counts[bucketOf(job)] += 1; });
  return counts;
}

export type JobStep = 'accept' | 'travel' | 'arrive' | 'start' | 'collect' | 'complete';
/** The partner's next step: Accept → On the way → Arrived → Start (customer OTP) → collect balance → Complete. */
export function nextStep(job: Job): JobStep | null {
  switch (job.booking_status) {
    case 'TECHNICIAN_ASSIGNED': return job.accepted_at ? 'travel' : 'accept';
    case 'TECHNICIAN_EN_ROUTE': return job.arrived_at ? 'start' : 'arrive';
    case 'IN_PROGRESS': return balanceRemaining(job) > 0 ? 'collect' : 'complete';
    default: return null;
  }
}
export const stepCopy: Record<JobStep, { label: string; hint: string }> = {
  accept: { label: 'Accept job', hint: 'Accept to confirm you will do this job at the scheduled time.' },
  travel: { label: 'Start travelling', hint: 'Tap when you leave, so the customer knows you are on the way.' },
  arrive: { label: 'I have arrived', hint: 'Tap when you reach the customer’s address.' },
  start: { label: 'Start job', hint: 'Inspect the site, agree the work, then ask the customer for their 4-digit service OTP.' },
  collect: { label: 'Collect payment', hint: 'Collect the balance from the customer and record it here.' },
  complete: { label: 'Complete job', hint: 'Confirm the work is finished and the customer is satisfied.' },
};

/** Balance still to collect on site, in rupees. */
export const balanceRemaining = (job: Job) => Math.max(0, Number(job.balance_due) - Number(job.balance_collected));

export const addressText = (job: Job) => {
  const a = job.address_snapshot ?? {};
  return [a.address_line_1, a.address_line_2, a.landmark, a.locality, a.city, a.postal_code].filter(Boolean).join(', ');
};
