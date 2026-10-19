import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { USING_MOCKS } from '@/lib/api';
import type { Tone } from '@/lib/jobs';
import { colors, radius, spacing, typography } from '@/theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function Card({ children, style, onPress }: PropsWithChildren<{ style?: StyleProp<ViewStyle>; onPress?: () => void }>) {
  if (!onPress) return <View style={[styles.card, style]}>{children}</View>;
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>{children}</Pressable>;
}

const tones: Record<Tone, { bg: string; fg: string }> = {
  info: { bg: colors.primarySoft, fg: colors.primary }, progress: { bg: colors.accentSoft, fg: '#B45309' },
  success: { bg: colors.successSoft, fg: colors.success }, danger: { bg: colors.dangerSoft, fg: colors.danger },
};
export function StatusPill({ label, tone = 'info' }: { label: string; tone?: Tone }) {
  return <View style={[styles.pill, { backgroundColor: tones[tone].bg }]}><Text style={[styles.pillText, { color: tones[tone].fg }]}>{label}</Text></View>;
}

/** Tab screen title bar with the partner's account status on the right, as in the reference app. */
export function TabHeader({ title, status, right }: { title: string; status?: string; right?: ReactNode }) {
  const restricted = status && status !== 'ACTIVE';
  return <View style={styles.header}><Text accessibilityRole="header" numberOfLines={1} style={styles.headerTitle}>{title}</Text><View style={styles.row}>{status ? <StatusPill label={status.replaceAll('_', ' ')} tone={restricted ? 'danger' : 'success'} /> : null}{right}</View></View>;
}

export function StatTile({ value, label, icon, tone, footer, onPress }: { value: string | number; label: string; icon?: IconName; tone?: string; footer?: ReactNode; onPress?: () => void }) {
  return <Card onPress={onPress} style={styles.tile}>{icon ? <Ionicons name={icon} size={20} color={tone ?? colors.primary} /> : null}<Text style={[styles.tileValue, !icon && styles.center]}>{value}</Text><Text style={[styles.tileLabel, !icon && styles.center]}>{label}</Text>{footer}</Card>;
}
export function Grid({ children }: PropsWithChildren) { return <View style={styles.grid}>{children}</View>; }

export function SectionTitle({ children, action, onAction }: PropsWithChildren<{ action?: string; onAction?: () => void }>) {
  return <View style={styles.sectionRow}><Text accessibilityRole="header" style={styles.section}>{children}</Text>{action && onAction ? <Text onPress={onAction} style={styles.sectionAction}>{action}</Text> : null}</View>;
}

export function MenuRow({ icon, label, detail, onPress, danger }: { icon: IconName; label: string; detail?: string; onPress: () => void; danger?: boolean }) {
  return <Pressable accessibilityRole="button" onPress={() => { void Haptics.selectionAsync(); onPress(); }} style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}>
    <View style={[styles.menuIcon, danger && { backgroundColor: colors.dangerSoft }]}><Ionicons name={icon} size={18} color={danger ? colors.danger : colors.primary} /></View>
    <View style={styles.flex}><Text style={[styles.menuLabel, danger && { color: colors.danger }]}>{label}</Text>{detail ? <Text style={styles.menuDetail}>{detail}</Text> : null}</View>
    <Ionicons name="chevron-forward" size={18} color={colors.muted} />
  </Pressable>;
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (value: T) => void }) {
  return <View style={styles.segment}>{options.map((option) => { const active = option.value === value; return <Pressable key={option.value} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => { void Haptics.selectionAsync(); onChange(option.value); }} style={[styles.segmentItem, active && styles.segmentActive]}><Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text></Pressable>; })}</View>;
}

export function Chips<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (value: T) => void }) {
  return <View style={styles.chips}>{options.map((option) => { const active = option.value === value; return <Pressable key={option.value} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => onChange(option.value)} style={[styles.chip, active && styles.chipActive]}><Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text></Pressable>; })}</View>;
}

/** Shown on screens backed by sample data, so nobody mistakes it for real account data. */
export function SampleDataNote({ label = 'Sample data – this API is not live yet.' }: { label?: string }) {
  if (!USING_MOCKS) return null;
  return <View style={styles.sample}><Ionicons name="flask-outline" size={14} color={colors.warning} /><Text style={styles.sampleText}>{label}</Text></View>;
}

export function EmptyState({ icon = 'file-tray-outline', title, message }: { icon?: IconName; title: string; message?: string }) {
  return <View style={styles.empty}><Ionicons name={icon} size={36} color={colors.muted} /><Text style={styles.emptyTitle}>{title}</Text>{message ? <Text style={styles.emptyText}>{message}</Text> : null}</View>;
}

export function KeyValue({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <View style={styles.kv}><Text style={[styles.kvLabel, strong && styles.kvStrong]}>{label}</Text><Text style={[styles.kvValue, strong && styles.kvStrong]}>{value}</Text></View>;
}

export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return <View style={styles.row} accessibilityLabel={`${rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((star) => <Ionicons key={star} name={star <= rating ? 'star' : 'star-outline'} size={size} color="#F5B301" />)}</View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, center: { textAlign: 'center' },
  card: { padding: spacing.lg, gap: spacing.sm, backgroundColor: colors.white, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.8 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  pillText: { fontFamily: typography.bold, fontSize: 11, letterSpacing: 0.3, textTransform: 'uppercase' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.background },
  headerTitle: { flexShrink: 1, color: colors.heading, fontFamily: typography.extrabold, fontSize: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: { flexBasis: '47%', flexGrow: 1, minHeight: 104, justifyContent: 'center' },
  tileValue: { color: colors.heading, fontFamily: typography.extrabold, fontSize: 26 },
  tileLabel: { color: colors.body, fontFamily: typography.medium, fontSize: 13 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  section: { color: colors.heading, fontFamily: typography.bold, fontSize: 18 },
  sectionAction: { color: colors.primary, fontFamily: typography.bold, fontSize: 13 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 14, backgroundColor: colors.white, borderBottomWidth: 1, borderColor: colors.border },
  menuIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  menuLabel: { color: colors.heading, fontFamily: typography.semibold, fontSize: 15 },
  menuDetail: { color: colors.muted, fontFamily: typography.regular, fontSize: 12 },
  segment: { flexDirection: 'row', padding: 4, borderRadius: radius.button, backgroundColor: colors.primarySoft },
  segmentItem: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  segmentText: { color: colors.body, fontFamily: typography.semibold, fontSize: 13 },
  segmentTextActive: { color: colors.primary, fontFamily: typography.bold },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipText: { color: colors.heading, fontFamily: typography.semibold, fontSize: 13 },
  chipTextActive: { color: colors.white },
  sample: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.small, backgroundColor: colors.warningSoft, alignSelf: 'flex-start' },
  sampleText: { color: colors.warning, fontFamily: typography.semibold, fontSize: 11.5 },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: 48, paddingHorizontal: spacing.xl },
  emptyTitle: { color: colors.heading, fontFamily: typography.bold, fontSize: 17, textAlign: 'center' },
  emptyText: { color: colors.body, fontFamily: typography.regular, fontSize: 13.5, lineHeight: 20, textAlign: 'center' },
  kv: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.lg, paddingVertical: 6 },
  kvLabel: { flexShrink: 0, color: colors.body, fontFamily: typography.regular, fontSize: 14 },
  kvValue: { flexShrink: 1, color: colors.heading, fontFamily: typography.semibold, fontSize: 14, textAlign: 'right' },
  kvStrong: { color: colors.heading, fontFamily: typography.extrabold, fontSize: 15 },
});
