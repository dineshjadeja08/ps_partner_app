import { create } from 'zustand';
import { api } from '@/lib/api';
import { signOutFirebase } from '@/lib/firebase-phone-auth';
import { sessionStorage, type StoredSession } from '@/lib/session';
import type { AuthResponse, User } from '@/types/api';

export class NotPartnerError extends Error { constructor() { super('This number is not registered as a Purple Squad partner. Contact your Purple Squad manager to get onboarded.'); } }
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
  logout: async () => { const session = await sessionStorage.get(); try { if (session?.tokens.refresh) await api.auth.logout(session.tokens.refresh); } finally { await Promise.allSettled([sessionStorage.clear(), signOutFirebase()]); set({ user: null }); } },
}));
