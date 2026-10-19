import NetInfo from '@react-native-community/netinfo';
import { QueryClient, QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import { PropsWithChildren, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

onlineManager.setEventListener((setOnline) => NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected))));
export function AppProvider({ children }: PropsWithChildren) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 }, mutations: { retry: 0 } } }));
  useEffect(() => { if (Platform.OS === 'web') return; const subscription = AppState.addEventListener('change', (state) => focusManager.setFocused(state === 'active')); return () => subscription.remove(); }, []);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
