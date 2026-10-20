import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Grid, SampleDataNote, SectionTitle, StatTile, TabHeader } from '@/components/partner-ui';
import { Screen } from '@/components/ui/screen';
import { MessageState } from '@/components/ui/states';
import { api } from '@/lib/api';
import { countBuckets, jobsQuery, type JobBucket } from '@/lib/jobs';
import { usePartnerStatus, useProfile, useRestrictions } from '@/lib/queries';
import { colors, radius, spacing, typography } from '@/theme/tokens';

const buckets: { key: JobBucket; label: string }[] = [{ key: 'today', label: 'Today' }, { key: 'tomorrow', label: 'Tomorrow' }, { key: 'upcoming', label: 'Upcoming' }, { key: 'overdue', label: 'Overdue' }, { key: 'closed', label: 'Closed' }];

export default function DashboardScreen() {
  const profile = useProfile(); const status = usePartnerStatus(); const restrictions = useRestrictions(); const jobs = useQuery(jobsQuery);
  const summary = useQuery({ queryKey: ['partner', 'dashboard'], queryFn: api.partner.dashboard });
  const counts = countBuckets(jobs.data?.results ?? []);
  const restriction = restrictions.data?.[0];
  const refresh = () => { void Promise.all([profile.refetch(), restrictions.refetch(), jobs.refetch(), summary.refetch()]); };
  return <>
    <TabHeader title={profile.data ? `Hi, ${profile.data.display_name.split(' ')[0]}` : 'PurplePartner'} status={status} />
    <Screen refreshing={jobs.isRefetching} onRefresh={refresh}>
      <SampleDataNote label="Restrictions and opportunities are sample data. Jobs and profile are live." />
      {restriction ? <Pressable accessibilityRole="button" onPress={() => router.push('/restrictions')} style={styles.restricted}>
        <Text style={styles.restrictedTitle}>Profile is restricted</Text><Text style={styles.restrictedBody}>{restriction.level} – {restriction.reason}{restriction.work_order ? ` WO #${restriction.work_order}` : ''}</Text>
        <View style={styles.viewRow}><Text style={styles.viewText}>View details</Text><Ionicons name="arrow-forward" size={16} color={colors.white} /></View>
      </Pressable> : null}
      <Card onPress={() => router.push('/service-guide')} style={styles.guide}><View style={styles.guideIcon}><Ionicons name="information" size={20} color={colors.primary} /></View><View style={styles.flex}><Text style={styles.guideTitle}>Service flow guide</Text><Text style={styles.guideBody}>Read the steps to avoid penalties</Text></View><Ionicons name="chevron-forward" size={18} color={colors.primary} /></Card>
      <SectionTitle action="View all" onAction={() => router.push('/(tabs)/jobs')}>My jobs</SectionTitle>
      {jobs.isError ? <MessageState title="Couldn’t load jobs" message={jobs.error.message} actionLabel="Try again" onAction={() => void jobs.refetch()} /> : <Grid>
        {buckets.map((bucket) => <StatTile key={bucket.key} value={jobs.isLoading ? '–' : counts[bucket.key]} label={bucket.label} onPress={() => router.push({ pathname: '/(tabs)/jobs', params: { filter: bucket.key } })} />)}
        <StatTile value={jobs.data?.count ?? '–'} label="All jobs" onPress={() => router.push('/(tabs)/jobs')} />
      </Grid>}
      <SectionTitle>Opportunities (last 30 days)</SectionTitle>
      <Grid><StatTile value={summary.data?.opportunities.mine ?? '–'} label="My opportunities" /><StatTile value={summary.data?.opportunities.open ?? '–'} label="Open opportunities" /></Grid>
      <Card onPress={() => router.push('/performance')} style={styles.guide}><View style={styles.guideIcon}><Ionicons name="bar-chart" size={18} color={colors.primary} /></View><View style={styles.flex}><Text style={styles.guideTitle}>Performance report</Text><Text style={styles.guideBody}>View job completion, earnings and ratings</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted} /></Card>
    </Screen>
  </>;
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  restricted: { gap: spacing.sm, padding: spacing.lg, borderRadius: radius.card, backgroundColor: colors.accent, shadowColor: colors.accent, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  restrictedTitle: { color: colors.white, fontFamily: typography.extrabold, fontSize: 17 },
  restrictedBody: { color: colors.white, fontFamily: typography.medium, fontSize: 13, lineHeight: 19 },
  viewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  viewText: { color: colors.white, fontFamily: typography.bold, fontSize: 14 },
  guide: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  guideIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  guideTitle: { color: colors.heading, fontFamily: typography.bold, fontSize: 15 },
  guideBody: { color: colors.body, fontFamily: typography.regular, fontSize: 12.5 },
});
