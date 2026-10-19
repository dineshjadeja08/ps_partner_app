import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, SampleDataNote, Stars } from '@/components/partner-ui';
import { Screen } from '@/components/ui/screen';
import { RowSkeleton } from '@/components/ui/skeleton';
import { MessageState } from '@/components/ui/states';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { colors, typography } from '@/theme/tokens';

export default function ReviewsScreen() {
  const reviews = useQuery({ queryKey: ['partner', 'reviews'], queryFn: api.partner.reviews });
  const list = reviews.data ?? [];
  const average = list.length ? list.reduce((sum, item) => sum + item.rating, 0) / list.length : 0;
  return <Screen refreshing={reviews.isRefetching} onRefresh={() => void reviews.refetch()}>
    <SampleDataNote />
    {list.length ? <Card style={styles.summary}><Text style={styles.average}>{average.toFixed(1)}</Text><Stars rating={Math.round(average)} size={20} /><Text style={styles.meta}>{list.length} customer reviews</Text></Card> : null}
    {reviews.isLoading ? <RowSkeleton /> : reviews.isError ? <MessageState title="Couldn’t load reviews" message={reviews.error.message} actionLabel="Try again" onAction={() => void reviews.refetch()} />
      : list.length ? list.map((review) => <Card key={review.id}>
        <View style={styles.top}><Text style={styles.name}>{review.customer_name}</Text><Text style={styles.meta}>{formatDateTime(review.created_at)}</Text></View>
        <Stars rating={review.rating} /><Text style={styles.service}>{review.service_name}</Text>{review.comment ? <Text style={styles.comment}>“{review.comment}”</Text> : null}
      </Card>)
      : <EmptyState icon="star-outline" title="No reviews yet" message="Customers can rate you after a job is completed." />}
  </Screen>;
}
const styles = StyleSheet.create({
  summary: { alignItems: 'center' },
  average: { color: colors.heading, fontFamily: typography.extrabold, fontSize: 36 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: colors.heading, fontFamily: typography.bold, fontSize: 16 },
  meta: { color: colors.muted, fontFamily: typography.regular, fontSize: 12 },
  service: { color: colors.body, fontFamily: typography.semibold, fontSize: 13.5 },
  comment: { color: colors.body, fontFamily: typography.regular, fontSize: 13.5, fontStyle: 'italic' },
});
