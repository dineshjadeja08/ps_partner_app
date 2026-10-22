import { create } from 'zustand';
import { api, onSessionExpired } from '@/lib/api';
import { signOutFirebase } from '@/lib/firebase-phone-auth';
import { unregisterJobAlerts } from '@/lib/push';
import { sessionStorage, type StoredSession } from '@/lib/session';
import type { AuthResponse, User } from '@/types/api';

export class NotPartnerError extends Error { constructor() { super('This number is registered as a Purple Squad customer account. Use a different number to join as a partner.'); } }
type AuthState = { ready: boolean; user: User | null; restore: () => Promise<void>; acceptLogin: (response: AuthResponse) => Promise<void>; logout: () => Promise<void> };
export const useAuth = create<AuthState>((set) => ({
  ready: false, user: null,
  restore: async () => { const session = await sessionStorage.get(); if (!session) { set({ ready: true, user: null }); return; } try { const user = await api.auth.me(); if (user.role !== 'TECHNICIAN') throw new NotPartnerError(); await sessionStorage.set({ ...session, user }); set({ ready: true, user }); } catch { await sessionStorage.clear(); set({ ready: true, user: null }); } },
  // Only technician accounts may use the partner app; customers are signed straight back out.
  acceptLogin: async (response) => {
    const session: StoredSession = { tokens: response.tokens, user: response.user }; await sessionStorage.set(session);
    if (response.user.role !== 'TECHNICIAN') { await Promise.allSettled([api.auth.logout(response.tokens.refresh)]); await Promise.allSettled([sessionStorage.clear(), signOutFirebase()]); throw new NotPartnerError(); }
    set({ ready: true, user: response.user });
  },
  logout: async () => { await unregisterJobAlerts(); const session = await sessionStorage.get(); try { if (session?.tokens.refresh) await api.auth.logout(session.tokens.refresh); } finally { await Promise.allSettled([sessionStorage.clear(), signOutFirebase()]); set({ user: null }); } },
}));

// A session that can't be refreshed (expired or revoked) signs the partner out, which shows Sign in again.
onSessionExpired(() => { if (useAuth.getState().user) { void signOutFirebase(); useAuth.setState({ user: null }); } });
