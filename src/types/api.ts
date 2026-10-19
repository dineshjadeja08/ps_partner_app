export type UUID = string;
export type ApiErrorBody = { error?: { code?: string; message?: string; details?: Record<string, unknown> }; detail?: string; [key: string]: unknown };
export type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };
export type Tokens = { access: string; refresh: string; token_type?: string };
export type User = { id: UUID; phone_number: string; email?: string | null; first_name: string; last_name: string; role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN' | 'SUPER_ADMIN'; is_verified: boolean };
export type AuthResponse = { user: User; tokens: Tokens; created: boolean };

// ── Live backend contracts (/api/v1/technician/jobs/…) ──
export type BookingStatus = 'PENDING_PAYMENT' | 'PAYMENT_FAILED' | 'CONFIRMED' | 'TECHNICIAN_ASSIGNED' | 'TECHNICIAN_EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | 'CANCELLED' | 'REFUND_PENDING' | 'REFUNDED';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'FAILED' | 'REFUNDED';
export type Job = {
  id: UUID; booking_number: string; customer_name?: string; customer_phone?: string;
  service: { id: UUID; name: string; slug: string }; address_snapshot: Record<string, string>;
  service_date: string; time_slot: { id: UUID; start_time: string; end_time: string }; problem_description: string;
  contact_phone?: string; quantity?: number; subtotal: string; discount_amount: string; tax_amount: string;
  total_amount: string; advance_paid: string; balance_due: string; balance_collected: string;
  payment_status: PaymentStatus; booking_status: BookingStatus; customer_notes?: string;
  completed_at: string | null; cancelled_at: string | null; created_at: string;
};

// ── Proposed partner contracts (docs/PARTNER_API_CONTRACT.md); mocked until the backend ships them ──
export type PartnerStatus = 'ACTIVE' | 'RESTRICTED' | 'SUSPENDED' | 'PENDING_VERIFICATION';
export type PartnerProfile = {
  id: UUID; partner_code: string; display_name: string; company_name: string; company_address: string;
  phone: string; email?: string; role: 'OWNER' | 'EMPLOYEE'; status: PartnerStatus; profile_photo_url?: string;
  technician_type: 'EMPLOYEE' | 'CONTRACT' | 'PARTNER'; background_verification_status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  skills: { id: UUID; name: string }[]; service_areas: { id: UUID; name: string; postal_code: string; city: string }[];
  joined_at: string | null;
};
export type Restriction = { id: UUID; level: string; reason: string; work_order?: string; created_at: string; how_to_resolve: string[]; consequences: string[] };
export type DashboardSummary = { opportunities: { mine: number; open: number | null } };
export type WalletTxnKind = 'CREDIT' | 'DEBIT';
export type WalletTxn = { id: UUID; title: string; kind: WalletTxnKind; amount: string; work_order?: string; created_at: string };
export type Penalty = { id: UUID; reason: string; amount: string; work_order?: string; created_at: string };
export type Wallet = { running_credits: string; transactions: WalletTxn[]; incentives: WalletTxn[]; penalties: Penalty[] };
export type Settlement = {
  id: UUID; settlement_number: string; service_name: string; work_order: string; invoice_number: string; amount: string;
  status: 'PENDING' | 'COMPLETED' | 'REVERSED'; collected_by: 'CASH' | 'ONLINE'; created_at: string;
  items: { name: string; quantity: number; unit_price: string; total: string }[]; subtotal: string; discount: string; total: string;
};
export type Earnings = { total: string; settlements: Settlement[] };
export type MonthPoint = { month: string; jobs: number; earnings: number; rating: number | null };
export type Performance = {
  period: string; completion_rate: number; completed: number; total: number; cancelled: number; open: number;
  gross_revenue: string; average_rating: number | null; review_count: number; penalties: number; penalty_amount: string;
  needs_attention: boolean; trend: MonthPoint[];
};
export type Review = { id: UUID; customer_name: string; service_name: string; rating: number; comment: string; created_at: string };
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type Leave = { id: UUID; start_date: string; end_date: string; reason: string; status: LeaveStatus };
export type LeaveInput = { start_date: string; end_date: string; reason: string };
