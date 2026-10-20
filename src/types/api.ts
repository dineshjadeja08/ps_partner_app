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
  accepted_at: string | null; arrived_at: string | null; start_otp_verified: boolean;
};

export type JobPhotoKind = 'BEFORE' | 'AFTER' | 'RECEIPT';
export type JobPhoto = { id: UUID; kind: JobPhotoKind; url: string; created_at: string };

// ── Technician self-service (/api/v1/technician/profile|reviews|leaves|performance) ──
export type TechnicianProfile = {
  id: UUID; employee_code: string; display_name: string; profile_photo_url: string; phone: string; alternate_phone: string; email: string;
  technician_type: 'EMPLOYEE' | 'CONTRACT' | 'PARTNER'; employment_status: 'ACTIVE' | 'INACTIVE' | 'LEFT'; city: string; pincode: string;
  skills: { id: UUID; name: string; description: string }[]; service_areas: { id: UUID; name: string; postal_code: string; city: string }[];
  supported_services: { id: UUID; name: string; slug: string; category: string }[]; experience_years: string; languages: string[];
  background_verification_status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  availability_status: 'AVAILABLE' | 'BUSY' | 'ON_LEAVE' | 'OFFLINE' | 'SUSPENDED'; average_rating: string; completed_job_count: number;
  is_available: boolean; is_active: boolean; joined_at: string | null; kyc_submitted_at: string | null; verification_note: string;
};
export type VerificationStatus = TechnicianProfile['background_verification_status'];
export type Skill = { id: UUID; name: string; description: string };
export type DocumentType = 'AADHAAR_FRONT' | 'AADHAAR_BACK' | 'PAN' | 'PHOTO' | 'CERTIFICATE';
export type KycDocument = { id: UUID; doc_type: DocumentType; url: string; created_at: string };
export type ProfileUpdate = Partial<{ display_name: string; email: string; city: string; pincode: string; experience_years: string; languages: string[]; skill_ids: UUID[] }>;
export type PartnerStatus = 'ACTIVE' | 'RESTRICTED' | 'INACTIVE';
export type MonthPoint = { month: string; jobs: number; earnings: number; rating: number | null };
export type Performance = {
  period: string; completion_rate: number; completed: number; total: number; cancelled: number; open: number;
  gross_revenue: string; average_rating: number | null; review_count: number; penalties: number | null; penalty_amount: string | null;
  needs_attention: boolean; trend: MonthPoint[];
};
export type Review = { id: UUID; booking_number: string; customer_name: string; service_name: string; rating: number; comment: string; created_at: string };
export type EarningJob = { id: UUID; booking_number: string; service_name: string; service_date: string; completed_at: string | null; total_amount: string; paid_online: string; collected_by_you: string; collection_method: string };
export type Earnings = { period: string; job_count: number; job_value_total: string; collected_by_you_total: string; paid_online_total: string; jobs: EarningJob[] };
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type Leave = { id: UUID; start_at: string; end_at: string; reason: string; status: LeaveStatus; review_note: string };
export type LeaveInput = { start_at: string; end_at: string; reason: string };

// ── Proposed partner contracts (docs/PARTNER_API_CONTRACT.md); mocked until the backend ships them ──
export type Restriction = { id: UUID; level: string; reason: string; work_order?: string; created_at: string; how_to_resolve: string[]; consequences: string[] };
export type DashboardSummary = { opportunities: { mine: number; open: number | null } };
export type WalletTxnKind = 'CREDIT' | 'DEBIT';
export type WalletTxn = { id: UUID; title: string; kind: WalletTxnKind; amount: string; work_order?: string; created_at: string };
export type Penalty = { id: UUID; reason: string; amount: string; work_order?: string; created_at: string };
export type Wallet = { running_credits: string; transactions: WalletTxn[]; incentives: WalletTxn[]; penalties: Penalty[] };
