import type { DashboardSummary, Restriction, Wallet } from '@/types/api';

// Sample data for partner endpoints the backend does not ship yet. Shapes follow
// docs/PARTNER_API_CONTRACT.md so screens need no change when the real endpoints land.
const daysAgo = (days: number, hour = 11) => { const date = new Date(); date.setDate(date.getDate() - days); date.setHours(hour, 15, 0, 0); return date.toISOString(); };
const delay = <T,>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(structuredClone(value)), 350));

// No sample restrictions: showing one would mark every real partner as restricted.
const restrictions: Restriction[] = [];
const wallet: Wallet = {
  running_credits: '12468',
  transactions: [
    { id: 't1', title: 'Profile maintenance', kind: 'DEBIT', amount: '99', created_at: daysAgo(4, 18) },
    { id: 't2', title: 'AC Service – lead fee', kind: 'DEBIT', amount: '80', work_order: 'PS-1459335', created_at: daysAgo(5, 15) },
    { id: 't3', title: 'Refund for request 8972958', kind: 'CREDIT', amount: '1253', work_order: 'PS-1452384', created_at: daysAgo(10, 7) },
    { id: 't4', title: 'Missed visit penalty', kind: 'DEBIT', amount: '199', work_order: 'PS-1452384', created_at: daysAgo(11, 20) },
    { id: 't5', title: 'Recharge bonus (5%)', kind: 'CREDIT', amount: '212', created_at: daysAgo(11, 13) },
    { id: 't6', title: 'Wallet recharge', kind: 'CREDIT', amount: '4237', created_at: daysAgo(11, 13) },
    { id: 't7', title: 'Washing Machine – lead fee', kind: 'DEBIT', amount: '88', work_order: 'PS-1453298', created_at: daysAgo(11, 13) },
  ],
  incentives: [],
  penalties: [{ id: 'pn1', reason: 'Partner did not show up for the visit', amount: '99', work_order: 'PS-1452384', created_at: daysAgo(11, 20) }],
};
export const mockPartnerApi = {
  restrictions: () => delay(restrictions),
  dashboard: () => delay<DashboardSummary>({ opportunities: { mine: 13, open: null } }),
  wallet: () => delay(wallet),
};
