import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/partner-ui';
import { api } from '@/lib/api';
import { pickImage } from '@/lib/pick-image';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import type { JobPhotoKind } from '@/types/api';

const sections: { kind: JobPhotoKind; label: string }[] = [{ kind: 'BEFORE', label: 'Before work' }, { kind: 'AFTER', label: 'After work' }, { kind: 'RECEIPT', label: 'Invoice / receipt' }];

/** Completion proof for a job. Photos can be added or removed only while the job is in progress. */
export function JobPhotos({ jobId, editable }: { jobId: string; editable: boolean }) {
  const client = useQueryClient();
  const key = ['jobs', jobId, 'photos'];
  const photos = useQuery({ queryKey: key, queryFn: () => api.jobs.photos(jobId) });
  const upload = useMutation({
    mutationFn: async (kind: JobPhotoKind) => { const file = await pickImage(); return file ? api.jobs.uploadPhoto(jobId, kind, file) : null; },
    onSuccess: () => void client.invalidateQueries({ queryKey: key }),
    onError: (error: Error) => Alert.alert('Couldn’t upload photo', error.message),
  });
  const remove = useMutation({ mutationFn: (photoId: string) => api.jobs.deletePhoto(jobId, photoId), onSuccess: () => void client.invalidateQueries({ queryKey: key }), onError: (error: Error) => Alert.alert('Couldn’t remove photo', error.message) });
  const list = photos.data ?? [];
  if (!editable && !list.length) return null;
  return <Card>
    <Text style={styles.label}>Completion proof</Text>
    {editable ? <Text style={styles.hint}>Add before and after photos, and the invoice if you gave one.</Text> : null}
    {sections.map((section) => {
      const items = list.filter((photo) => photo.kind === section.kind);
      if (!editable && !items.length) return null;
      return <View key={section.kind} style={styles.section}>
        <Text style={styles.sectionTitle}>{section.label}</Text>
        <View style={styles.row}>
          {items.map((photo) => <View key={photo.id} style={styles.thumbWrap}>
            {photo.url.toLowerCase().endsWith('.pdf') ? <View style={[styles.thumb, styles.pdf]}><Ionicons name="document-text" size={26} color={colors.primary} /></View> : <Image source={{ uri: photo.url }} style={styles.thumb} contentFit="cover" />}
            {editable ? <Pressable accessibilityRole="button" accessibilityLabel="Remove photo" onPress={() => remove.mutate(photo.id)} style={styles.remove}><Ionicons name="close" size={14} color={colors.white} /></Pressable> : null}
          </View>)}
          {editable ? <Pressable accessibilityRole="button" accessibilityLabel={`Add ${section.label} photo`} disabled={upload.isPending} onPress={() => upload.mutate(section.kind)} style={[styles.thumb, styles.add]}>
            {upload.isPending && upload.variables === section.kind ? <ActivityIndicator color={colors.primary} /> : <Ionicons name="camera-outline" size={24} color={colors.primary} />}
          </Pressable> : null}
        </View>
      </View>;
    })}
  </Card>;
}
const styles = StyleSheet.create({
  label: { color: colors.muted, fontFamily: typography.bold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  hint: { color: colors.body, fontFamily: typography.regular, fontSize: 13, lineHeight: 19 },
  section: { gap: 6, marginTop: spacing.xs },
  sectionTitle: { color: colors.heading, fontFamily: typography.semibold, fontSize: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  thumbWrap: { position: 'relative' },
  thumb: { width: 72, height: 72, borderRadius: radius.small, backgroundColor: colors.border },
  pdf: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  add: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.primary, backgroundColor: colors.primarySoft },
  remove: { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.danger },
});
