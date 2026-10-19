import * as Haptics from 'expo-haptics';
import { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import { colors, radius, typography } from '@/theme/tokens';

type Props = PressableProps & { loading?: boolean; variant?: 'primary' | 'secondary' | 'danger' };
export function Button({ children, loading, variant = 'primary', disabled, style, onPress, ...props }: PropsWithChildren<Props>) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading) }} disabled={disabled || loading} onPress={(event) => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress?.(event); }} style={(state) => [styles.base, styles[variant], state.pressed && styles.pressed, (disabled || loading) && styles.disabled, typeof style === 'function' ? style(state) : style]} {...props}>
    {loading ? <ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary} /> : <Text style={[styles.label, variant !== 'primary' && styles.secondaryLabel, variant === 'danger' && styles.dangerLabel]}>{children}</Text>}
  </Pressable>;
}
const styles = StyleSheet.create({ base: { minHeight: 54, borderRadius: radius.pill, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' }, primary: { backgroundColor: colors.primary, shadowColor: colors.primaryPressed, shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 }, secondary: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.primary }, danger: { backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: '#FECACA' }, pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] }, disabled: { opacity: 0.5, shadowOpacity: 0 }, label: { color: colors.white, fontFamily: typography.bold, fontSize: 15.5, letterSpacing: 0.1 }, secondaryLabel: { color: colors.primary }, dangerLabel: { color: colors.danger } });
