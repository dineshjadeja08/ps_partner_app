import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Grid, Segmented, StatTile, StatusPill } from '@/components/partner-ui';
import { Screen } from '@/components/ui/screen';
import { LoadingState, MessageState } from '@/components/ui/states';
import { api, money } from '@/lib/api';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import type { MonthPoint } from '@/types/api';

type Metric = 'jobs' | 'earnings' | 'rating';
const metrics: { value: Metric; label: string }[] = [{ value: 'jobs', label: 'Jobs' }, { value: 'earnings', label: 'Earnings' }, { value: 'rating', label: 'Rating' }];

export default function PerformanceScreen() {
  const report = useQuery({ queryKey: ['me', 'performance'], queryFn: api.me.performance });
  const [metric, setMetric] = useState<Metric>('jobs');
  if (report.isLoading) return <LoadingState />;
  if (!report.data) return <Screen><MessageState title="Couldn’t load report" message={report.error?.message ?? 'Please try again.'} actionLabel="Try again" onAction={() => void report.refetch()} /></Screen>;
  const data = report.data;
  const rateColor = data.completion_rate >= 80 ? colors.success : data.completion_rate >= 50 ? colors.warning : colors.danger;
  return <Screen refreshing={report.isRefetching} onRefresh={() => void report.refetch()}>
    <Card>
      <View style={styles.top}><View><Text style={styles.caption}>{data.period} performance</Text><Text style={styles.cardTitle}>Completion overview</Text></View>{data.needs_attention ? <StatusPill label="Needs attention" tone="danger" /> : null}</View>
      <View style={styles.overview}>
        <View style={[styles.ring, { borderColor: rateColor }]}><Text style={styles.ringValue}>{data.completion_rate}%</Text><Text style={styles.caption}>Rate</Text></View>
        <View style={styles.flex}><Text style={styles.bold}>{data.completed} of {data.total} jobs completed</Text><Bar value={data.completed} total={data.total} color={rateColor} /><Text style={styles.caption}>{data.cancelled} cancelled · {data.open} open</Text></View>
      </View>
    </Card>
    <Grid>
      <StatTile icon="checkmark-circle" tone={colors.success} value={data.completed} label="Completed jobs" footer={<Text style={styles.footerDanger}>{data.cancelled} cancelled of {data.total}</Text>} />
      <StatTile icon="cash" value={money(data.gross_revenue)} label="Total earnings" footer={<Text style={styles.caption}>Gross revenue</Text>} />
      <StatTile icon="star" tone="#F5B301" value={data.average_rating?.toFixed(1) ?? '–'} label="Average rating" footer={<Text style={styles.caption}>{data.review_count} customer reviews</Text>} />
      {data.penalties !== null ? <StatTile icon="warning" tone={colors.danger} value={data.penalties} label="Penalties incurred" footer={data.penalty_amount ? <Text style={styles.footerDanger}>Deducted {money(data.penalty_amount)}</Text> : null} /> : <StatTile icon="briefcase" value={data.open} label="Open jobs" footer={<Text style={styles.caption}>Not yet completed</Text>} />}
    </Grid>
    <Card>
      <Text style={styles.cardTitle}>3-month trend</Text><Text style={styles.caption}>Performance trajectory over time</Text>
      <Segmented options={metrics} value={metric} onChange={setMetric} />
      <Chart points={data.trend} metric={metric} />
    </Card>
  </Screen>;
}

function Bar({ value, total, color }: { value: number; total: number; color: string }) {
  return <View style={styles.track}><View style={[styles.fill, { width: `${total ? Math.round((value / total) * 100) : 0}%`, backgroundColor: color }]} /></View>;
}
function Chart({ points, metric }: { points: MonthPoint[]; metric: Metric }) {
  const values = points.map((point) => point[metric] ?? 0);
  const max = Math.max(...values, metric === 'rating' ? 5 : 1);
  const label = (value: number) => (metric === 'earnings' ? money(value) : metric === 'rating' ? value.toFixed(1) : String(value));
  return <View style={styles.chart}>{points.map((point, index) => <View key={point.month} style={styles.column}>
    <Text style={styles.colValue}>{point[metric] === null ? '–' : label(values[index])}</Text>
    <View style={[styles.colBar, { height: Math.max(4, (values[index] / max) * 140) }]} />
    <Text style={styles.caption}>{point.month}</Text>
  </View>)}</View>;
}
const styles = StyleSheet.create({
  flex: { flex: 1, gap: 6 },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  caption: { color: colors.muted, fontFamily: typography.medium, fontSize: 11.5 },
  cardTitle: { color: colors.heading, fontFamily: typography.extrabold, fontSize: 17 },
  bold: { color: colors.heading, fontFamily: typography.bold, fontSize: 14 },
  overview: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.sm },
  ring: { width: 84, height: 84, borderRadius: 42, borderWidth: 7, alignItems: 'center', justifyContent: 'center' },
  ringValue: { color: colors.heading, fontFamily: typography.extrabold, fontSize: 19 },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.dangerSoft, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  footerDanger: { color: colors.danger, fontFamily: typography.semibold, fontSize: 11.5 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 200, paddingTop: spacing.md },
  column: { alignItems: 'center', gap: 6, width: 72 },
  colValue: { color: colors.heading, fontFamily: typography.bold, fontSize: 12 },
  colBar: { width: 34, borderTopLeftRadius: radius.small, borderTopRightRadius: radius.small, backgroundColor: colors.primary },
});
