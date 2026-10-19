import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { money } from '@/lib/api';
import { colors, radius, spacing, typography } from '@/theme/tokens';

const presets = [500, 1000, 2000, 5000];

// Online recharge needs a backend wallet payment order (Razorpay) that does not exist yet,
// so this screen collects the amount but cannot take payment.
export default function RechargeScreen() {
  const [amount, setAmount] = useState('1000');
  const value = Number(amount) || 0;
  return <Screen title="Add credits" subtitle="Credits pay for job leads and platform fees." bottom={<Button disabled>Online recharge coming soon</Button>}>
    <View style={styles.presets}>{presets.map((preset) => <Pressable key={preset} accessibilityRole="button" onPress={() => setAmount(String(preset))} style={[styles.preset, value === preset && styles.presetActive]}><Text style={[styles.presetText, value === preset && styles.presetTextActive]}>{money(preset)}</Text></Pressable>)}</View>
    <Field label="Amount" value={amount} onChangeText={(text) => setAmount(text.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" />
    <View style={styles.notice}><Text style={styles.noticeTitle}>Recharge is not available in the app yet</Text><Text style={styles.noticeText}>Until online recharge launches, contact your Purple Squad partner manager to add credits to your wallet.</Text></View>
  </Screen>;
}
const styles = StyleSheet.create({
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  preset: { flexGrow: 1, flexBasis: '22%', alignItems: 'center', paddingVertical: 12, borderRadius: radius.button, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  presetActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  presetText: { color: colors.heading, fontFamily: typography.bold, fontSize: 14 },
  presetTextActive: { color: colors.primary },
  notice: { gap: 4, padding: spacing.md, borderRadius: radius.button, backgroundColor: colors.warningSoft },
  noticeTitle: { color: colors.warning, fontFamily: typography.bold, fontSize: 13 },
  noticeText: { color: colors.body, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18 },
});
