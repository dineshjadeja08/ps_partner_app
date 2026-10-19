import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/theme/tokens';

type Status = 'online' | 'offline' | 'restored';

/**
 * Slim banner at the top of every screen: red while offline, green for a moment when the
 * connection returns. Data refreshes on reconnect through React Query's online manager.
 */
export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<Status>('online');
  const [offset] = useState(() => new Animated.Value(-120));
  const wasOffline = useRef(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      clearTimeout(hideTimer);
      if (offline) { wasOffline.current = true; setStatus('offline'); return; }
      if (wasOffline.current) {
        wasOffline.current = false; setStatus('restored');
        hideTimer = setTimeout(() => setStatus('online'), 2000);
      }
    });
    return () => { clearTimeout(hideTimer); unsubscribe(); };
  }, []);

  useEffect(() => {
    Animated.timing(offset, { toValue: status === 'online' ? -120 : 0, duration: 250, useNativeDriver: true }).start();
  }, [offset, status]);

  const offline = status === 'offline';
  return <Animated.View pointerEvents="none" accessibilityLiveRegion="polite" style={[styles.banner, { paddingTop: insets.top + 6, backgroundColor: offline ? colors.danger : colors.success, transform: [{ translateY: offset }] }]}>
    <Ionicons name={offline ? 'cloud-offline-outline' : 'checkmark-circle-outline'} size={16} color={colors.white} />
    <Text style={styles.text}>{offline ? 'No internet connection. We’ll retry when you’re back online.' : 'Back online'}</Text>
  </Animated.View>;
}

const styles = StyleSheet.create({
  banner: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, elevation: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: 8 },
  text: { flexShrink: 1, color: colors.white, fontFamily: typography.semibold, fontSize: 12.5 },
});
