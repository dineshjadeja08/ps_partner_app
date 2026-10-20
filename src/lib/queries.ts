import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PartnerStatus } from '@/types/api';

export const useProfile = () => useQuery({ queryKey: ['me', 'profile'], queryFn: api.me.profile, staleTime: 5 * 60_000 });
export const useRestrictions = () => useQuery({ queryKey: ['partner', 'restrictions'], queryFn: api.partner.restrictions });

/** Status pill shown in tab headers: restricted beats inactive beats active. */
export function usePartnerStatus(): PartnerStatus | undefined {
  const profile = useProfile(); const restrictions = useRestrictions();
  if (restrictions.data?.length) return 'RESTRICTED';
  if (!profile.data) return undefined;
  return profile.data.is_active && profile.data.employment_status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
}
