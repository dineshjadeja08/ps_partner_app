import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useProfile = () => useQuery({ queryKey: ['partner', 'profile'], queryFn: api.partner.profile, staleTime: 5 * 60_000 });
export const useRestrictions = () => useQuery({ queryKey: ['partner', 'restrictions'], queryFn: api.partner.restrictions });
