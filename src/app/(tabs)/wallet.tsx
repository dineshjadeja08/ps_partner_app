import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState, SampleDataNote, Segmented, TabHeader } from '@/components/partner-ui';
import { Screen } from '@/components/ui/screen';
import { RowSkeleton } from '@/components/ui/skeleton';
import { MessageState } from '@/components/ui/states';
import { api, money } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { useProfile } from '@/lib/queries';
import { colors, radius, spacing, typography } from '@/theme/tokens';

type Tab = 'transactions' | 'incentives' | 'penalties';
const tabs: { value: Tab; label: string }[] = [{ value: 'transactions', label: 'Transactions' }, { value: 'incentives', label: 'Incentives' }, { value: 'penalties', label: 'Penalties' }];
type Row = { id: string; title: string; meta: string; amount: string; credit: boolean };

export default function WalletScreen() {
  const profile = useProfile(); const wallet = useQuery({ queryKey: ['partner', 'wallet'], queryFn: api.partner.wallet });
  const [tab, setTab] = useState<Tab>('transactions');
  const data = wallet.data;
  const rows: Row[] = !data ? [] : tab === 'penalties'
    ? data.penalties.map((item) => ({ id: item.id, title: item.reason, meta: `${formatDateTime(item.created_at)}${item.work_order ? ` · WO ${item.work_order}` : ''}`, amount: item.amount, credit: false }))
    : data[tab].map((item) => ({ id: item.id, title: item.title, meta: `${formatDateTime(item.created_at)}${item.work_order ? ` · WO ${item.work_order}` : ''}`, amount: item.amount, credit: item.kind === 'CREDIT' }));
  return <View style={styles.flex}>
    <TabHeader title="Wallet" status={profile.data?.status} />
    <Screen refreshing={wallet.isRefetching} onRefresh={() => void wallet.refetch()}>
      <SampleDataNote />
      <View style={styles.balance}><Text style={styles.balanceLabel}>Running credits</Text><Text style={styles.balanceValue}>{data ? money(data.running_credits) : '–'}</Text><Text style={styles.balanceHint}>Lead fees and penalties are deducted from credits. Keep a positive balance to keep receiving jobs.</Text></View>
      <Segmented options={tabs} value={tab} onChange={setTab} />
      {wallet.isLoading ? <RowSkeleton /> : wallet.isError ? <MessageState title="Couldn’t load wallet" message={wallet.error.message} actionLabel="Try again" onAction={() => void wallet.refetch()} />
        : rows.length ? <View style={styles.list}>{rows.map((row) => <View key={row.id} style={styles.row}><View style={styles.flex}><Text style={styles.rowTitle}>{row.title}</Text><Text style={styles.rowMeta}>{row.meta}</Text></View><Text style={[styles.amount, { color: row.credit ? colors.success : colors.danger }]}>{row.credit ? '+' : '−'}{money(row.amount)}</Text></View>)}</View>
        : <EmptyState icon="wallet-outline" title={`No ${tab} found`} />}
      <View style={{ height: 64 }} />
    </Screen>
    <Pressable accessibilityRole="button" onPress={() => router.push('/recharge')} style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}><Ionicons name="add" size={20} color={colors.white} /><Text style={styles.fabText}>Recharge</Text></Pressable>
  </View>;
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  balance: { alignItems: 'center', gap: 4, padding: spacing.xl, borderRadius: radius.card, backgroundColor: colors.primary },
  balanceLabel: { color: '#E9DDFB', fontFamily: typography.semibold, fontSize: 14 },
  balanceValue: { color: colors.white, fontFamily: typography.extrabold, fontSize: 34 },
  balanceHint: { color: '#E9DDFB', fontFamily: typography.regular, fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: 4 },
  list: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderBottomWidth: 1, borderColor: colors.border },
  rowTitle: { color: colors.heading, fontFamily: typography.semibold, fontSize: 14.5 },
  rowMeta: { color: colors.muted, fontFamily: typography.regular, fontSize: 12, marginTop: 2 },
  amount: { fontFamily: typography.extrabold, fontSize: 15 },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 14, borderRadius: radius.button, backgroundColor: colors.primary, shadowColor: colors.primaryPressed, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  fabText: { color: colors.white, fontFamily: typography.bold, fontSize: 15 },
});
