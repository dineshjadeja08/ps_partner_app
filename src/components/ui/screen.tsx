import { PropsWithChildren, ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardHeight } from '@/lib/keyboard';
import { colors, spacing, typography } from '@/theme/tokens';

export function Screen({ children, title, subtitle, bottom, refreshing, onRefresh }: PropsWithChildren<{ title?: string; subtitle?: string; bottom?: ReactNode; refreshing?: boolean; onRefresh?: () => void }>) {
  const insets = useSafeAreaInsets();
  // Keep fields and the bottom action bar above the keyboard (Android's window doesn't shrink for it).
  const keyboard = useKeyboardHeight();
  return <SafeAreaView edges={bottom ? [] : ['bottom']} style={styles.safe}><View style={styles.flex}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingBottom: (bottom ? 112 + insets.bottom : spacing.xl) + keyboard }]} refreshControl={onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined}>
    {title ? <View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View> : null}{children}
  </ScrollView>{bottom ? <View style={[styles.bottom, { bottom: keyboard, paddingBottom: keyboard ? spacing.md : spacing.lg + insets.bottom }]}>{bottom}</View> : null}</View></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, flex: { flex: 1 }, content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl, gap: 18 }, heading: { gap: 5, paddingTop: spacing.xs }, title: { color: colors.heading, fontFamily: typography.extrabold, fontSize: 27, lineHeight: 33, letterSpacing: -0.5 }, subtitle: { color: colors.body, fontFamily: typography.regular, fontSize: 14, lineHeight: 21 }, bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg, backgroundColor: colors.white, borderTopWidth: 1, borderColor: colors.border, shadowColor: '#1D1230', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: -5 }, elevation: 12 } });
