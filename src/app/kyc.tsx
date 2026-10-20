import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Chips, SectionTitle } from '@/components/partner-ui';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Screen } from '@/components/ui/screen';
import { LoadingState, MessageState } from '@/components/ui/states';
import { api } from '@/lib/api';
import { pickImage } from '@/lib/pick-image';
import { useProfile } from '@/lib/queries';
import { useAuth } from '@/stores/auth';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import type { DocumentType, TechnicianProfile } from '@/types/api';

const documentSlots: { type: DocumentType; label: string; required: boolean }[] = [
  { type: 'PHOTO', label: 'Your photo', required: true },
  { type: 'AADHAAR_FRONT', label: 'Aadhaar – front', required: true },
  { type: 'AADHAAR_BACK', label: 'Aadhaar – back', required: true },
  { type: 'PAN', label: 'PAN card', required: true },
  { type: 'CERTIFICATE', label: 'Certificates (optional)', required: false },
];

/** Partner sign-up: details and documents, submit for review, then wait for admin approval. */
export default function KycScreen() {
  const profile = useProfile();
  const logout = useAuth((state) => state.logout);
  const signOut = () => void logout().finally(() => router.replace('/login'));
  if (profile.isLoading) return <LoadingState />;
  if (!profile.data) return <Screen><MessageState title="Couldn’t load your profile" message={profile.error?.message ?? 'Please try again.'} actionLabel="Try again" onAction={() => void profile.refetch()} /></Screen>;
  const status = profile.data.background_verification_status;
  if (status === 'VERIFIED') return <Redirect href="/" />;
  if (status === 'UNDER_REVIEW' || status === 'SUSPENDED') return <Screen>
    <View style={styles.statusCard}>
      <Ionicons name={status === 'SUSPENDED' ? 'ban-outline' : 'hourglass-outline'} size={44} color={status === 'SUSPENDED' ? colors.danger : colors.primary} />
      <Text style={styles.statusTitle}>{status === 'SUSPENDED' ? 'Account suspended' : 'KYC under review'}</Text>
      <Text style={styles.statusBody}>{status === 'SUSPENDED' ? 'Contact Purple Squad support to know more.' : 'Our team is checking your documents. This usually takes 1–2 working days. We’ll start sending you jobs once you’re approved.'}</Text>
      <Button variant="secondary" loading={profile.isRefetching} onPress={() => void profile.refetch()}>Check status</Button>
    </View>
    <Text accessibilityRole="button" onPress={signOut} style={styles.logout}>Log out</Text>
  </Screen>;
  return <KycForm profile={profile.data} onSignOut={signOut} />;
}

function KycForm({ profile, onSignOut }: { profile: TechnicianProfile; onSignOut: () => void }) {
  const client = useQueryClient();
  const skills = useQuery({ queryKey: ['me', 'skills'], queryFn: api.me.skills });
  const documents = useQuery({ queryKey: ['me', 'documents'], queryFn: api.me.documents });
  const [name, setName] = useState(profile.display_name);
  const [email, setEmail] = useState(profile.email);
  const [city, setCity] = useState(profile.city);
  const [pincode, setPincode] = useState(profile.pincode);
  const [experience, setExperience] = useState(Number(profile.experience_years) ? String(Number(profile.experience_years)) : '');
  const [languages, setLanguages] = useState(profile.languages.join(', '));
  const [skillIds, setSkillIds] = useState(profile.skills.map((skill) => skill.id));
  const refreshProfile = (updated: TechnicianProfile) => client.setQueryData(['me', 'profile'], updated);
  // Send only what's filled in, so submitting early lists what's missing instead of failing on blank fields.
  const filled = <T,>(value: T) => (value ? value : undefined);
  const details = { display_name: filled(name.trim()), email: email.trim(), city: filled(city.trim()), pincode: filled(pincode.trim()), experience_years: experience || '0', languages: languages.split(',').map((item) => item.trim()).filter(Boolean), skill_ids: skillIds };
  const save = useMutation({ mutationFn: () => api.me.updateProfile(details), onSuccess: refreshProfile, onError: (error: Error) => Alert.alert('Couldn’t save details', error.message) });
  const submit = useMutation({
    mutationFn: async () => { refreshProfile(await api.me.updateProfile(details)); return api.me.submitKyc(); },
    onSuccess: refreshProfile,
    onError: (error: Error) => Alert.alert('Not ready to submit', error.message),
  });
  const upload = useMutation({
    mutationFn: async (type: DocumentType) => { const file = await pickImage(); return file ? api.me.uploadDocument(type, file) : null; },
    onSuccess: () => void client.invalidateQueries({ queryKey: ['me', 'documents'] }),
    onError: (error: Error) => Alert.alert('Couldn’t upload', error.message),
  });
  const remove = useMutation({ mutationFn: api.me.deleteDocument, onSuccess: () => void client.invalidateQueries({ queryKey: ['me', 'documents'] }) });
  const toggleSkill = (id: string) => setSkillIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  return <Screen title="Complete your KYC" subtitle="Purple Squad verifies every partner before sending jobs. Fill in your details and upload clear photos of your documents." bottom={<Button loading={submit.isPending} onPress={() => submit.mutate()}>Submit for review</Button>}>
    {profile.background_verification_status === 'REJECTED' ? <View style={styles.rejected}><Ionicons name="alert-circle" size={18} color={colors.danger} /><View style={styles.flex}><Text style={styles.rejectedTitle}>Your KYC needs changes</Text><Text style={styles.rejectedBody}>{profile.verification_note || 'Please check your details and documents, then submit again.'}</Text></View></View> : null}
    <SectionTitle>Your details</SectionTitle>
    <Card>
      <Field label="Full name (as on Aadhaar)" value={name} onChangeText={setName} autoCapitalize="words" />
      <Field label="Email (optional)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <View style={styles.row}><View style={styles.flex}><Field label="City" value={city} onChangeText={setCity} /></View><View style={styles.flex}><Field label="Pincode" value={pincode} onChangeText={(value) => setPincode(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" /></View></View>
      <View style={styles.row}><View style={styles.flex}><Field label="Experience (years)" value={experience} onChangeText={(value) => setExperience(value.replace(/[^\d.]/g, '').slice(0, 4))} keyboardType="decimal-pad" /></View><View style={styles.flex}><Field label="Languages" value={languages} onChangeText={setLanguages} placeholder="Tamil, English" /></View></View>
      <Button variant="secondary" loading={save.isPending} onPress={() => save.mutate()}>Save details</Button>
    </Card>
    <SectionTitle>Services you offer</SectionTitle>
    {skills.isLoading ? <ActivityIndicator color={colors.primary} /> : skills.data?.length
      ? <Chips options={skills.data.map((skill) => ({ value: skill.id, label: skill.name }))} selected={skillIds} onChange={toggleSkill} />
      : <Text style={styles.muted}>No services are listed yet. Contact Purple Squad support.</Text>}
    <SectionTitle>Documents</SectionTitle>
    <Card>
      {documentSlots.map((slot) => {
        const items = (documents.data ?? []).filter((doc) => doc.doc_type === slot.type);
        const busy = upload.isPending && upload.variables === slot.type;
        return <View key={slot.type} style={styles.docRow}>
          <View style={styles.flex}><Text style={styles.docLabel}>{slot.label}</Text><Text style={[styles.docState, items.length ? styles.docDone : slot.required && styles.docMissing]}>{items.length ? `${items.length} uploaded` : slot.required ? 'Required' : 'Optional'}</Text></View>
          {items.map((doc) => <Pressable key={doc.id} accessibilityLabel={`Remove ${slot.label}`} onLongPress={() => remove.mutate(doc.id)}>{doc.url.toLowerCase().endsWith('.pdf') ? <View style={[styles.thumb, styles.pdf]}><Ionicons name="document-text" size={20} color={colors.primary} /></View> : <Image source={{ uri: doc.url }} style={styles.thumb} contentFit="cover" />}</Pressable>)}
          <Pressable accessibilityRole="button" accessibilityLabel={`Upload ${slot.label}`} disabled={upload.isPending} onPress={() => upload.mutate(slot.type)} style={styles.uploadButton}>
            {busy ? <ActivityIndicator color={colors.primary} size="small" /> : <Ionicons name={items.length && slot.type !== 'CERTIFICATE' ? 'refresh' : 'cloud-upload-outline'} size={20} color={colors.primary} />}
          </Pressable>
        </View>;
      })}
      <Text style={styles.muted}>Uploading Aadhaar, PAN or your photo again replaces the old one. Long-press a document to remove it.</Text>
    </Card>
    <Text accessibilityRole="button" onPress={onSignOut} style={styles.logout}>Log out</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: spacing.md },
  muted: { color: colors.muted, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18 },
  rejected: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.button, backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: '#FECACA' },
  rejectedTitle: { color: colors.danger, fontFamily: typography.bold, fontSize: 14 },
  rejectedBody: { color: colors.heading, fontFamily: typography.regular, fontSize: 13, lineHeight: 19 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderColor: colors.border },
  docLabel: { color: colors.heading, fontFamily: typography.semibold, fontSize: 14.5 },
  docState: { color: colors.muted, fontFamily: typography.medium, fontSize: 12 },
  docDone: { color: colors.success },
  docMissing: { color: colors.danger },
  thumb: { width: 40, height: 40, borderRadius: radius.small, backgroundColor: colors.border },
  pdf: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  uploadButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  statusCard: { alignItems: 'center', gap: spacing.md, marginTop: spacing.xxl, padding: spacing.xl, borderRadius: radius.card, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  statusTitle: { color: colors.heading, fontFamily: typography.extrabold, fontSize: 20 },
  statusBody: { color: colors.body, fontFamily: typography.regular, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  logout: { alignSelf: 'center', paddingVertical: spacing.sm, color: colors.danger, fontFamily: typography.bold, fontSize: 14 },
});
