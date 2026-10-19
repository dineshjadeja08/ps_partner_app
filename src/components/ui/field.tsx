import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radius, typography } from '@/theme/tokens';

export const Field = forwardRef<TextInput, TextInputProps & { label: string; error?: string }>(function Field({ label, error, style, ...props }, ref) {
  return <View style={styles.wrap}><Text style={styles.label}>{label}</Text><TextInput ref={ref} placeholderTextColor="#9A96A8" style={[styles.input, Boolean(error) && styles.inputError, style]} accessibilityLabel={label} {...props} />{error ? <Text style={styles.error}>{error}</Text> : null}</View>;
});
const styles = StyleSheet.create({ wrap: { gap: 6 }, label: { color: colors.heading, fontFamily: typography.semibold, fontSize: 13 }, input: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: radius.button, backgroundColor: colors.white, color: colors.heading, paddingHorizontal: 14, fontFamily: typography.regular, fontSize: 15 }, inputError: { borderColor: colors.danger }, error: { color: colors.danger, fontFamily: typography.medium, fontSize: 12 } });
