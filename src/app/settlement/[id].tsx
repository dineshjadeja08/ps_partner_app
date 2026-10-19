import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Card, KeyValue, SampleDataNote, StatusPill } from '@/components/partner-ui';
import { Screen } from '@/components/ui/screen';
import { LoadingState, MessageState } from '@/components/ui/states';
import { api, money } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { colors, spacing, typography } from '@/theme/tokens';

export default function SettlementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const settlement = useQuery({ queryKey: ['partner', 'settlement', id], queryFn: () => api.partner.settlement(id) });
  if (settlement.isLoading) return <LoadingState />;
  if (!settlement.data) return <Screen><MessageState title="Couldn’t load settlement" message={settlement.error?.message ?? 'Please try again.'} actionLabel="Try again" onAction={() => void settlement.refetch()} /></Screen>;
  const item = settlement.data;
  return <Screen>
    <SampleDataNote />
    <Card>
      <View style={styles.top}><Text style={styles.amount}>{money(item.amount)}</Text><StatusPill label={item.status} tone={item.status === 'COMPLETED' ? 'success' : item.status === 'REVERSED' ? 'danger' : 'progress'} /></View>
      <Text style={styles.meta}>Settlement #{item.settlement_number} · {formatDateTime(item.created_at)}</Text>
      <Text style={styles.meta}>WO {item.work_order} · Invoice {item.invoice_number}</Text>
      <Text style={styles.meta}>Amount collected by {item.collected_by === 'CASH' ? 'cash' : 'online payment'}</Text>
    </Card>
    <Card>
      <View style={styles.head}><Text style={styles.headText}>Items</Text><Text style={styles.headText}>Total</Text></View>
      {item.items.map((line, index) => <View key={index} style={styles.item}><View style={styles.flex}><Text style={styles.itemName}>{line.name}</Text><Text style={styles.meta}>{line.quantity} × {money(line.unit_price)}</Text></View><Text style={styles.itemName}>{money(line.total)}</Text></View>)}
      <View style={styles.divider} />
      <KeyValue label="Subtotal" value={money(item.subtotal)} /><KeyValue label="Discount" value={money(item.discount)} /><KeyValue strong label="Total" value={money(item.total)} />
    </Card>
  </Screen>;
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amount: { color: colors.success, fontFamily: typography.extrabold, fontSize: 28 },
  meta: { color: colors.body, fontFamily: typography.regular, fontSize: 13 },
  head: { flexDirection: 'row', justifyContent: 'space-between' },
  headText: { color: colors.heading, fontFamily: typography.bold, fontSize: 15 },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  itemName: { color: colors.heading, fontFamily: typography.semibold, fontSize: 14.5 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
});
