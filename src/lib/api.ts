import { mockPartnerApi } from '@/lib/mock-data';
import { sessionStorage } from '@/lib/session';
import type { ApiErrorBody, AuthResponse, DashboardSummary, Earnings, Job, Leave, LeaveInput, Paginated, PartnerProfile, Performance, Restriction, Review, Settlement, User, Wallet } from '@/types/api';

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000').replace(/\/$/, '');
/** True while partner endpoints that the backend does not ship yet are served from sample data. */
export const USING_MOCKS = process.env.EXPO_PUBLIC_PARTNER_MOCKS !== 'false';
export class ApiError extends Error { constructor(public status: number, message: string, public code?: string, public details?: unknown) { super(message); } }
let refreshPromise: Promise<string | null> | null = null;
function buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>) { const value = new URL(`${API_URL}${path}`); Object.entries(query ?? {}).forEach(([key, item]) => item !== undefined && value.searchParams.set(key, String(item))); return value.toString(); }
async function refreshAccess() {
  if (!refreshPromise) refreshPromise = (async () => {
    const session = await sessionStorage.get(); if (!session?.tokens.refresh) return null;
    const response = await fetch(buildUrl('/api/v1/auth/refresh/'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh: session.tokens.refresh }) });
    if (!response.ok) { await sessionStorage.clear(); return null; }
    const body = await response.json() as { access: string; refresh?: string };
    await sessionStorage.set({ ...session, tokens: { ...session.tokens, access: body.access, refresh: body.refresh ?? session.tokens.refresh } }); return body.access;
  })().finally(() => { refreshPromise = null; });
  return refreshPromise;
}
type RequestOptions = RequestInit & { auth?: boolean; query?: Record<string, string | number | boolean | undefined>; retryAuth?: boolean };
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth, query, retryAuth = true, ...init } = options; const session = auth ? await sessionStorage.get() : null; const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json'); if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json'); if (session?.tokens.access) headers.set('Authorization', `Bearer ${session.tokens.access}`);
  const response = await fetch(buildUrl(path, query), { ...init, headers });
  if (response.status === 401 && auth && retryAuth && await refreshAccess()) return apiRequest<T>(path, { ...options, retryAuth: false });
  if (!response.ok) { let body: ApiErrorBody = {}; try { body = await response.json() as ApiErrorBody; } catch {} const fallback = response.status >= 500 ? 'Purple Squad is temporarily unavailable. Please try again.' : 'Please check the details and try again.'; throw new ApiError(response.status, body.error?.message ?? body.detail ?? fallback, body.error?.code, body.error?.details ?? body); }
  if (response.status === 204) return undefined as T; return response.json() as Promise<T>;
}
/** Proposed endpoint: sample data while USING_MOCKS, the real path once the backend ships it. */
const pending = <T,>(mock: () => Promise<T>, real: () => Promise<T>) => (USING_MOCKS ? mock() : real());

export const api = {
  auth: {
    firebase: (id_token: string) => apiRequest<AuthResponse>('/api/v1/auth/firebase/', { method: 'POST', body: JSON.stringify({ id_token }) }),
    me: () => apiRequest<User>('/api/v1/auth/me/', { auth: true }),
    logout: (refresh: string) => apiRequest<void>('/api/v1/auth/logout/', { method: 'POST', auth: true, body: JSON.stringify({ refresh }) }),
  },
  // Live today.
  jobs: {
    list: () => apiRequest<Paginated<Job>>('/api/v1/technician/jobs/', { auth: true, query: { page_size: 100 } }),
    enRoute: (id: string) => apiRequest<Job>(`/api/v1/technician/jobs/${id}/en-route/`, { method: 'POST', auth: true, body: '{}' }),
    start: (id: string) => apiRequest<Job>(`/api/v1/technician/jobs/${id}/start/`, { method: 'POST', auth: true, body: '{}' }),
    complete: (id: string) => apiRequest<Job>(`/api/v1/technician/jobs/${id}/complete/`, { method: 'POST', auth: true, body: '{}' }),
  },
  // Proposed in docs/PARTNER_API_CONTRACT.md.
  partner: {
    profile: () => pending(mockPartnerApi.profile, () => apiRequest<PartnerProfile>('/api/v1/technician/profile/', { auth: true })),
    restrictions: () => pending(mockPartnerApi.restrictions, () => apiRequest<Restriction[]>('/api/v1/technician/restrictions/', { auth: true })),
    dashboard: () => pending(mockPartnerApi.dashboard, () => apiRequest<DashboardSummary>('/api/v1/technician/dashboard/', { auth: true })),
    wallet: () => pending(mockPartnerApi.wallet, () => apiRequest<Wallet>('/api/v1/technician/wallet/', { auth: true })),
    earnings: () => pending(mockPartnerApi.earnings, () => apiRequest<Earnings>('/api/v1/technician/earnings/', { auth: true })),
    settlement: (id: string) => pending(() => mockPartnerApi.settlement(id), () => apiRequest<Settlement>(`/api/v1/technician/settlements/${id}/`, { auth: true })),
    performance: () => pending(mockPartnerApi.performance, () => apiRequest<Performance>('/api/v1/technician/performance/', { auth: true })),
    reviews: () => pending(mockPartnerApi.reviews, () => apiRequest<Review[]>('/api/v1/technician/reviews/', { auth: true })),
    leaves: () => pending(mockPartnerApi.leaves, () => apiRequest<Leave[]>('/api/v1/technician/leaves/', { auth: true })),
    applyLeave: (input: LeaveInput) => pending(() => mockPartnerApi.applyLeave(input), () => apiRequest<Leave>('/api/v1/technician/leaves/', { method: 'POST', auth: true, body: JSON.stringify(input) })),
  },
};
export const money = (value: string | number) => `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
