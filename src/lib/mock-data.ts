import type { DashboardSummary, Earnings, Leave, LeaveInput, PartnerProfile, Performance, Restriction, Review, Wallet } from '@/types/api';

// Sample data for partner endpoints the backend does not ship yet. Shapes follow
// docs/PARTNER_API_CONTRACT.md so screens need no change when the real endpoints land.
const daysAgo = (days: number, hour = 11) => { const date = new Date(); date.setDate(date.getDate() - days); date.setHours(hour, 15, 0, 0); return date.toISOString(); };
const isoDay = (offset: number) => { const date = new Date(); date.setDate(date.getDate() + offset); return date.toISOString().slice(0, 10); };
const delay = <T,>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(structuredClone(value)), 350));

const profile: PartnerProfile = {
  id: 'p-1', partner_code: 'PS-P-00011059', display_name: 'Ravi Kumar', company_name: 'Ravi Home Services', company_address: 'HSR Layout, Bengaluru - 560102',
  phone: '+919800000000', email: 'ravi@example.com', role: 'OWNER', status: 'RESTRICTED', technician_type: 'PARTNER', background_verification_status: 'VERIFIED',
  skills: [{ id: 's1', name: 'AC Service & Repair' }, { id: 's2', name: 'Washing Machine Repair' }, { id: 's3', name: 'Refrigerator Repair' }],
  service_areas: [{ id: 'a1', name: 'HSR Layout', postal_code: '560102', city: 'Bengaluru' }, { id: 'a2', name: 'Koramangala', postal_code: '560034', city: 'Bengaluru' }],
  joined_at: isoDay(-210),
};
const restrictions: Restriction[] = [{
  id: 'r-1', level: 'LEVEL_1', reason: 'You did not visit the customer at the scheduled time.', work_order: 'PS-1452384', created_at: daysAgo(11),
  how_to_resolve: ['Complete all your pending and overdue jobs.', 'Update and finish jobs on time every day.'],
  consequences: ['You will receive fewer job recommendations, or none at all.'],
}];
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
const settlementItems = (name: string, price: string) => [{ name, quantity: 1, unit_price: price, total: price }];
const earnings: Earnings = {
  total: '36699',
  settlements: [
    ['499', 'AC Gas Refill', 'PS-1453298', 0], ['4000', 'Washing Machine Motor Replacement', 'PS-1452318', 2], ['3500', 'Refrigerator Compressor Repair', 'PS-1452281', 2],
    ['4600', 'AC Installation (Split)', 'PS-1452259', 2], ['3700', 'AC Uninstallation + Installation', 'PS-1452317', 2], ['17000', 'Annual Maintenance – 4 ACs', 'PS-1451090', 4],
  ].map(([amount, name, wo, ago], index) => ({
    id: `st-${index}`, settlement_number: String(335354 + index), service_name: String(name), work_order: String(wo), invoice_number: String(433578 - index),
    amount: String(amount), status: 'COMPLETED' as const, collected_by: index % 2 ? 'ONLINE' as const : 'CASH' as const, created_at: daysAgo(10 + Number(ago), 12),
    items: settlementItems(String(name), String(amount)), subtotal: String(amount), discount: '0', total: String(amount),
  })),
};
const performance: Performance = {
  period: 'Overall', completion_rate: 25, completed: 3, total: 12, cancelled: 9, open: 0, gross_revenue: '1926', average_rating: 5, review_count: 1,
  penalties: 4, penalty_amount: '796', needs_attention: true,
  trend: [{ month: 'Aug', jobs: 1, earnings: 499, rating: 5 }, { month: 'Sep', jobs: 3, earnings: 1926, rating: 5 }, { month: 'Oct', jobs: 2, earnings: 1180, rating: null }],
};
const reviews: Review[] = [
  { id: 'rv1', customer_name: 'Ananya', service_name: 'AC Service & Repair', rating: 5, comment: 'On time and very neat work.', created_at: daysAgo(47) },
  { id: 'rv2', customer_name: 'Vijay', service_name: 'Washing Machine Repair', rating: 4, comment: '', created_at: daysAgo(74) },
  { id: 'rv3', customer_name: 'Meera', service_name: 'Refrigerator Repair', rating: 2, comment: 'Arrived late.', created_at: daysAgo(136) },
];
let leaves: Leave[] = [{ id: 'lv1', start_date: isoDay(-30), end_date: isoDay(-29), reason: 'Family function', status: 'APPROVED' }];

export const mockPartnerApi = {
  profile: () => delay(profile),
  restrictions: () => delay(restrictions),
  dashboard: () => delay<DashboardSummary>({ opportunities: { mine: 13, open: null } }),
  wallet: () => delay(wallet),
  earnings: () => delay(earnings),
  settlement: (id: string) => { const found = earnings.settlements.find((item) => item.id === id); return found ? delay(found) : Promise.reject(new Error('Settlement not found.')); },
  performance: () => delay(performance),
  reviews: () => delay(reviews),
  leaves: () => delay(leaves),
  applyLeave: (input: LeaveInput) => { const leave: Leave = { id: `lv${Date.now()}`, ...input, status: 'PENDING' }; leaves = [leave, ...leaves]; return delay(leave); },
};
