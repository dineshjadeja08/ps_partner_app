import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View, type DimensionValue } from 'react-native';
import { colors, radius, spacing } from '@/theme/tokens';

/** Pulsing placeholder block shown while content loads. */
export function Skeleton({ width = '100%', height, borderRadius = radius.small }: { width?: DimensionValue; height: number; borderRadius?: number }) {
  const [opacity] = useState(() => new Animated.Value(0.55));
  useEffect(() => {
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.55, duration: 650, useNativeDriver: true }),
    ]));
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);
  return <Animated.View style={{ width, height, borderRadius, backgroundColor: colors.border, opacity }} />;
}

/** Placeholder shaped like ServiceCard. */
export function ServiceCardSkeleton({ count = 2 }: { count?: number }) {
  return <>{Array.from({ length: count }, (_, index) => <View key={index} accessibilityLabel="Loading" style={styles.card}>
    <Skeleton height={170} borderRadius={0} />
    <View style={styles.body}><Skeleton width="70%" height={20} /><Skeleton width="90%" height={14} /><View style={styles.row}><Skeleton width={90} height={22} /><Skeleton width={122} height={42} borderRadius={radius.pill} /></View></View>
  </View>)}</>;
}

/** Placeholder for simple list rows such as bookings. */
export function RowSkeleton({ count = 3 }: { count?: number }) {
  return <>{Array.from({ length: count }, (_, index) => <View key={index} accessibilityLabel="Loading" style={[styles.card, styles.body]}><Skeleton width="60%" height={18} /><Skeleton width="40%" height={13} /><Skeleton width="80%" height={13} /></View>)}</>;
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', backgroundColor: colors.white, borderRadius: 22, borderWidth: 1, borderColor: colors.border },
  body: { gap: spacing.md, padding: 18 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
});
