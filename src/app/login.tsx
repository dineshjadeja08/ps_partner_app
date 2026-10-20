import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Screen } from '@/components/ui/screen';
import { requestFirebaseOtp } from '@/lib/firebase-phone-auth';
import { colors, radius, spacing, typography } from '@/theme/tokens';

const schema = z.object({ phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number') });
type Form = z.infer<typeof schema>;
export default function LoginScreen() {
  const { control, handleSubmit, setError } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { phone: '' } });
  const send = useMutation({ mutationFn: (phone: string) => requestFirebaseOtp(`+91${phone}`), onSuccess: (_, phone) => router.push({ pathname: '/verify-otp', params: { phone } }), onError: (error: Error) => setError('phone', { message: error.message }) });
  return <Screen><View style={styles.brand}><Image source={require('../../assets/images/icon.png')} contentFit="cover" style={styles.logo} /><Text style={styles.brandName}>PurplePartner</Text><Text style={styles.brandTag}>For Purple Squad service partners</Text></View>
    <View style={styles.card}><Text accessibilityRole="header" style={styles.title}>Sign in or join</Text><Text style={styles.subtitle}>Enter your mobile number. New partners can sign up here and complete KYC to start getting jobs.</Text>
      <Controller control={control} name="phone" render={({ field, fieldState }) => <Field label="Mobile number" value={field.value} onChangeText={(value) => field.onChange(value.replace(/\D/g, '').slice(0, 10))} keyboardType="phone-pad" error={fieldState.error?.message} placeholder="10-digit mobile number" />} />
      <Button loading={send.isPending} onPress={handleSubmit((values) => send.mutate(values.phone))}>Send OTP</Button>
      <View style={styles.notice}><Text style={styles.noticeTitle}>What you’ll need to join</Text><Text style={styles.noticeText}>Aadhaar card, PAN card and a clear photo of yourself. Our team verifies them, usually within 1–2 working days.</Text></View>
    </View>
  </Screen>;
}
const styles = StyleSheet.create({ brand: { alignItems: 'center', gap: 6, marginTop: spacing.xxl }, logo: { width: 76, height: 76, borderRadius: 22 }, brandName: { color: colors.primary, fontFamily: typography.extrabold, fontSize: 26 }, brandTag: { color: colors.body, fontFamily: typography.medium, fontSize: 13 }, card: { gap: spacing.lg, padding: spacing.xl, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 3 }, title: { color: colors.heading, fontFamily: typography.extrabold, fontSize: 24 }, subtitle: { marginTop: -8, color: colors.body, fontFamily: typography.regular, fontSize: 13, lineHeight: 20 }, notice: { padding: spacing.md, gap: spacing.xs, backgroundColor: colors.primarySoft, borderRadius: radius.button }, noticeTitle: { color: colors.primary, fontFamily: typography.bold, fontSize: 13 }, noticeText: { color: colors.body, fontFamily: typography.regular, fontSize: 12, lineHeight: 18 } });
