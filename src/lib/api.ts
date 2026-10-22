import { Platform } from 'react-native';
import { mockPartnerApi } from '@/lib/mock-data';
import { sessionStorage } from '@/lib/session';
import type { ApiErrorBody, AuthResponse, DashboardSummary, DocumentType, Earnings, Job, JobPhoto, JobPhotoKind, KycDocument, Leave, LeaveInput, Paginated, Performance, ProfileUpdate, Restriction, Review, Skill, TechnicianProfile, User, Wallet } from '@/types/api';

// Release builds fall back to production, so an APK built without EXPO_PUBLIC_API_URL still works.
const API_URL = (process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? 'http://10.0.2.2:8000' : 'https://ps-core-5pswvofjdq-as.a.run.app')).replace(/\/$/, '');
/** True while partner endpoints that the backend does not ship yet are served from sample data. */
export const USING_MOCKS = process.env.EXPO_PUBLIC_PARTNER_MOCKS !== 'false';
export class ApiError extends Error { constructor(public status: number, message: string, public code?: string, public details?: unknown) { super(message); } }
let refreshPromise: Promise<string | null> | null = null;
let sessionExpired: () => void = () => {};
/** Called when the saved session can no longer be refreshed, so the app can return to Sign in. */
export function onSessionExpired(handler: () => void) { sessionExpired = handler; }
/** The most specific message in an error body: DRF puts the real reason in details (a list, or field → messages). */
function errorMessage(body: ApiErrorBody, fallback: string) {
  const details = body.error?.details as unknown;
  const first = (value: unknown): string | undefined => (typeof value === 'string' ? value : Array.isArray(value) ? first(value[0]) : value && typeof value === 'object' ? first(Object.values(value)[0]) : undefined);
  const missing = (details as { missing?: unknown } | undefined)?.missing;
  if (Array.isArray(missing) && missing.length) return `Still needed: ${missing.join(', ')}.`;
  return first(details) ?? body.error?.message ?? body.detail ?? fallback;
}
function buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>) { const value = new URL(`${API_URL}${path}`); Object.entries(query ?? {}).forEach(([key, item]) => item !== undefined && value.searchParams.set(key, String(item))); return value.toString(); }
async function refreshAccess() {
  if (!refreshPromise) refreshPromise = (async () => {
    const session = await sessionStorage.get(); if (!session?.tokens.refresh) return null;
    const response = await fetch(buildUrl('/api/v1/auth/refresh/'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh: session.tokens.refresh }) });
    if (!response.ok) { await sessionStorage.clear(); sessionExpired(); return null; }
    const body = await response.json() as { access: string; refresh?: string };
    await sessionStorage.set({ ...session, tokens: { ...session.tokens, access: body.access, refresh: body.refresh ?? session.tokens.refresh } }); return body.access;
  })().finally(() => { refreshPromise = null; });
  return refreshPromise;
}
type RequestOptions = RequestInit & { auth?: boolean; query?: Record<string, string | number | boolean | undefined>; retryAuth?: boolean };
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth, query, retryAuth = true, ...init } = options; const session = auth ? await sessionStorage.get() : null; const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json'); if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json'); if (session?.tokens.access) headers.set('Authorization', `Bearer ${session.tokens.access}`);
  let response: Response;
  try { response = await fetch(buildUrl(path, query), { ...init, headers }); }
  catch { throw new ApiError(0, `Can’t reach Purple Squad (${API_URL}). Check your internet connection and try again.`, 'network_error'); }
  if (response.status === 401 && auth && retryAuth && await refreshAccess()) return apiRequest<T>(path, { ...options, retryAuth: false });
  if (response.status === 401 && auth && !session?.tokens.access) { sessionExpired(); throw new ApiError(401, 'Your session has expired. Please sign in again.', 'session_expired'); }
  if (!response.ok) { let body: ApiErrorBody = {}; try { body = await response.json() as ApiErrorBody; } catch {} const fallback = response.status >= 500 ? 'Purple Squad is temporarily unavailable. Please try again.' : 'Please check the details and try again.'; throw new ApiError(response.status, errorMessage(body, fallback), body.error?.code, body.error?.details ?? body); }
  if (response.status === 204) return undefined as T; return response.json() as Promise<T>;
}
export type PickedFile = { uri: string; name: string; mimeType: string };
/** Native FormData takes { uri, name, type }; the web needs the actual Blob. */
async function appendFile(body: FormData, field: string, file: PickedFile) {
  if (Platform.OS === 'web') { body.append(field, await (await fetch(file.uri)).blob(), file.name); return; }
  body.append(field, { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
}
/** Proposed endpoint: sample data while USING_MOCKS, the real path once the backend ships it. */
const pending = <T,>(mock: () => Promise<T>, real: () => Promise<T>) => (USING_MOCKS ? mock() : real());

export const api = {
  auth: {
    // app: 'partner' signs new numbers up as pending partners instead of customers.
    firebase: (id_token: string) => apiRequest<AuthResponse>('/api/v1/auth/firebase/', { method: 'POST', body: JSON.stringify({ id_token, app: 'partner' }) }),
    me: () => apiRequest<User>('/api/v1/auth/me/', { auth: true }),
    logout: (refresh: string) => apiRequest<void>('/api/v1/auth/logout/', { method: 'POST', auth: true, body: JSON.stringify({ refresh }) }),
  },
  // Live.
  jobs: {
    list: () => apiRequest<Paginated<Job>>('/api/v1/technician/jobs/', { auth: true, query: { page_size: 100 } }),
    get: (id: string) => apiRequest<Job>(`/api/v1/technician/jobs/${id}/`, { auth: true }),
    accept: (id: string) => apiRequest<Job>(`/api/v1/technician/jobs/${id}/accept/`, { method: 'POST', auth: true, body: '{}' }),
    enRoute: (id: string) => apiRequest<Job>(`/api/v1/technician/jobs/${id}/en-route/`, { method: 'POST', auth: true, body: '{}' }),
    arrived: (id: string) => apiRequest<Job>(`/api/v1/technician/jobs/${id}/arrived/`, { method: 'POST', auth: true, body: '{}' }),
    start: (id: string, otp: string) => apiRequest<Job>(`/api/v1/technician/jobs/${id}/start/`, { method: 'POST', auth: true, body: JSON.stringify({ otp }) }),
    complete: (id: string) => apiRequest<Job>(`/api/v1/technician/jobs/${id}/complete/`, { method: 'POST', auth: true, body: '{}' }),
    photos: (id: string) => apiRequest<JobPhoto[]>(`/api/v1/technician/jobs/${id}/photos/`, { auth: true }),
    uploadPhoto: async (id: string, kind: JobPhotoKind, file: PickedFile) => { const body = new FormData(); body.append('kind', kind); await appendFile(body, 'file', file); return apiRequest<JobPhoto>(`/api/v1/technician/jobs/${id}/photos/`, { method: 'POST', auth: true, body }); },
    deletePhoto: (id: string, photoId: string) => apiRequest<void>(`/api/v1/technician/jobs/${id}/photos/${photoId}/`, { method: 'DELETE', auth: true }),
    collectBalance: (id: string, amount: string, method: 'CASH' | 'UPI') => apiRequest<Job>(`/api/v1/technician/jobs/${id}/collect-balance/`, { method: 'POST', auth: true, body: JSON.stringify({ amount, method }) }),
  },
  me: {
    profile: () => apiRequest<TechnicianProfile>('/api/v1/technician/profile/', { auth: true }),
    updateProfile: (body: ProfileUpdate) => apiRequest<TechnicianProfile>('/api/v1/technician/profile/', { method: 'PATCH', auth: true, body: JSON.stringify(body) }),
    skills: () => apiRequest<Skill[]>('/api/v1/technician/skills/', { auth: true }),
    documents: () => apiRequest<KycDocument[]>('/api/v1/technician/documents/', { auth: true }),
    uploadDocument: async (docType: DocumentType, file: PickedFile) => { const body = new FormData(); body.append('doc_type', docType); await appendFile(body, 'file', file); return apiRequest<KycDocument>('/api/v1/technician/documents/', { method: 'POST', auth: true, body }); },
    deleteDocument: (id: string) => apiRequest<void>(`/api/v1/technician/documents/${id}/`, { method: 'DELETE', auth: true }),
    submitKyc: () => apiRequest<TechnicianProfile>('/api/v1/technician/kyc/submit/', { method: 'POST', auth: true }),
    performance: () => apiRequest<Performance>('/api/v1/technician/performance/', { auth: true }),
    earnings: () => apiRequest<Earnings>('/api/v1/technician/earnings/', { auth: true }),
    reviews: async () => (await apiRequest<Paginated<Review>>('/api/v1/technician/reviews/', { auth: true, query: { page_size: 100 } })).results,
    leaves: async () => (await apiRequest<Paginated<Leave>>('/api/v1/technician/leaves/', { auth: true, query: { page_size: 100 } })).results,
    applyLeave: (input: LeaveInput) => apiRequest<Leave>('/api/v1/technician/leaves/', { method: 'POST', auth: true, body: JSON.stringify(input) }),
  },
  // Proposed in docs/PARTNER_API_CONTRACT.md.
  partner: {
    restrictions: () => pending(mockPartnerApi.restrictions, () => apiRequest<Restriction[]>('/api/v1/technician/restrictions/', { auth: true })),
    dashboard: () => pending(mockPartnerApi.dashboard, () => apiRequest<DashboardSummary>('/api/v1/technician/dashboard/', { auth: true })),
    wallet: () => pending(mockPartnerApi.wallet, () => apiRequest<Wallet>('/api/v1/technician/wallet/', { auth: true })),
  },
};
export const money = (value: string | number) => `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
