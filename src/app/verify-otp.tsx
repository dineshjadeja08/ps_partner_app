import { useMutation } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useKeyboardHeight } from '@/lib/keyboard';
import { clearFirebaseOtpState, confirmFirebaseOtp, requestFirebaseOtp } from '@/lib/firebase-phone-auth';
import { useAuth } from '@/stores/auth';
import { colors, spacing, typography } from '@/theme/tokens';

export default function VerifyOtpScreen() {
  const params = useLocalSearchParams<{ phone: string }>(); const acceptLogin = useAuth((state) => state.acceptLogin); const [otp, setOtp] = useState(''); const [seconds, setSeconds] = useState(116); const input = useRef<TextInput>(null); const keyboard = useKeyboardHeight();
  useEffect(() => { const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000); return () => clearInterval(timer); }, []);
  const verify = useMutation({ mutationFn: async (code: string) => { const response = await api.auth.firebase(await confirmFirebaseOtp(code)); clearFirebaseOtpState(); await acceptLogin(response); }, onSuccess: () => router.replace('/') });
  const resend = useMutation({ mutationFn: () => requestFirebaseOtp(`+91${params.phone}`), onSuccess: () => setSeconds(116) });
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  return <SafeAreaView style={styles.safe}><View style={[styles.flex, keyboard ? { paddingBottom: keyboard } : null]}><View style={styles.sheet}>
    <Text style={styles.title}>OTP verification</Text><Text style={styles.subtitle}>Enter the code sent to <Text style={styles.phone}>+91 {params.phone}</Text></Text>
    <Pressable onPress={() => input.current?.focus()} style={styles.otpRow}>{[0, 1, 2, 3, 4, 5].map((index) => <View key={index} style={[styles.cell, otp.length === index && styles.cellActive]}><Text style={styles.digit}>{otp[index] ?? ''}</Text></View>)}</Pressable>
    <TextInput ref={input} autoFocus value={otp} onChangeText={(value) => { const code = value.replace(/\D/g, '').slice(0, 6); setOtp(code); if (code.length === 6 && !verify.isPending) verify.mutate(code); }} keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="sms-otp" style={styles.hidden} />
    <Pressable disabled={seconds > 0 || resend.isPending} onPress={() => resend.mutate()}><Text style={[styles.resend, seconds > 0 && styles.resendDisabled]}>{seconds ? `Resend OTP in ${time}` : 'Resend OTP'}</Text></Pressable>
    {verify.error ? <Text style={styles.error}>{verify.error.message}</Text> : null}{resend.error ? <Text style={styles.error}>{resend.error.message}</Text> : null}
    <Button loading={verify.isPending} disabled={otp.length !== 6} onPress={() => verify.mutate(otp)}>Verify</Button>
    <Text onPress={() => router.back()} style={styles.change}>Change number</Text>
  </View></View></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.primary }, flex: { flex: 1, justifyContent: 'center' }, sheet: { gap: spacing.lg, margin: spacing.md, padding: spacing.xl, borderRadius: 30, backgroundColor: colors.white }, title: { color: colors.primary, fontFamily: typography.extrabold, fontSize: 26, textAlign: 'center' }, subtitle: { marginTop: -10, color: colors.body, fontFamily: typography.regular, fontSize: 14, textAlign: 'center' }, phone: { color: colors.heading, fontFamily: typography.bold }, otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 7 }, cell: { width: 43, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#ECECEF' }, cellActive: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primarySoft }, digit: { color: colors.heading, fontFamily: typography.bold, fontSize: 21 }, hidden: { position: 'absolute', width: 1, height: 1, opacity: 0 }, resend: { color: colors.primary, fontFamily: typography.semibold, fontSize: 13, textAlign: 'center' }, resendDisabled: { color: colors.muted }, error: { color: colors.danger, fontFamily: typography.semibold, fontSize: 12, textAlign: 'center' }, change: { color: colors.body, fontFamily: typography.semibold, fontSize: 13, textAlign: 'center' } });
