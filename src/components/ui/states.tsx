import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { colors, radius, spacing, typography } from '@/theme/tokens';

export function LoadingState({ label = 'Loading…' }: { label?: string }) { return <View style={styles.state}><ActivityIndicator color={colors.primary} /><Text style={styles.body}>{label}</Text></View>; }
export function MessageState({ title, message, actionLabel, onAction }: { title: string; message: string; actionLabel?: string; onAction?: () => void }) { return <View style={styles.card}><Text style={styles.title}>{title}</Text><Text style={styles.body}>{message}</Text>{actionLabel && onAction ? <Button variant="secondary" onPress={onAction}>{actionLabel}</Button> : null}</View>; }
const styles = StyleSheet.create({ state: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: spacing.md }, card: { padding: spacing.xl, gap: spacing.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card }, title: { color: colors.heading, fontFamily: typography.bold, fontSize: 18 }, body: { color: colors.body, fontFamily: typography.regular, fontSize: 14, lineHeight: 21 } });
