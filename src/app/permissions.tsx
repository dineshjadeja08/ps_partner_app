import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useState, type ComponentProps } from 'react';
import { AppState, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { permissionsStorage } from '@/lib/session';
import { colors, radius, spacing, typography } from '@/theme/tokens';

type State = { foreground: boolean; background: boolean; gps: boolean };
async function readState(): Promise<State> {
  if (Platform.OS === 'web') return { foreground: true, background: true, gps: true };
  const [foreground, background, gps] = await Promise.all([Location.getForegroundPermissionsAsync(), Location.getBackgroundPermissionsAsync(), Location.hasServicesEnabledAsync()]);
  return { foreground: foreground.granted, background: background.granted, gps };
}

export default function PermissionsScreen() {
  const [state, setState] = useState<State>({ foreground: false, background: false, gps: false });
  const refresh = useCallback(() => { void readState().then(setState); }, []);
  // Re-check when the partner comes back from system settings.
  useEffect(() => { refresh(); const subscription = AppState.addEventListener('change', (next) => { if (next === 'active') refresh(); }); return () => subscription.remove(); }, [refresh]);
  const askForeground = async () => { await Location.requestForegroundPermissionsAsync(); refresh(); };
  const askBackground = async () => { if (!state.foreground) await Location.requestForegroundPermissionsAsync(); await Location.requestBackgroundPermissionsAsync(); refresh(); };
  const askGps = async () => { if (Platform.OS === 'android') { try { await Location.enableNetworkProviderAsync(); } catch {} } else await Linking.openSettings(); refresh(); };
  const ready = state.foreground && state.gps;
  const finish = async () => { await permissionsStorage.complete(); router.replace('/(tabs)'); };
  return <Screen title="Allow permissions" subtitle="PurplePartner needs these permissions to send you jobs and track arrival at customer sites." bottom={<Button disabled={!ready} onPress={() => void finish()}>{ready ? 'Continue' : 'Allow location to continue'}</Button>}>
    <View style={styles.notice}><Ionicons name="information-circle" size={18} color={colors.warning} /><Text style={styles.noticeText}>PurplePartner collects location data to enable job dispatch, nearby lead alerts and arrival tracking, even when the app is closed or not in use. Location is never shared outside a live job.</Text></View>
    <PermissionRow icon="location" title="Location access" body="Needed to detect your current area for job dispatch and customer arrival tracking." done={state.foreground} onAllow={askForeground} />
    <PermissionRow icon="navigate" title="Allow all the time" body="Recommended: choose 'Allow all the time' in settings so you keep receiving nearby leads while the app is in the background." done={state.background} onAllow={askBackground} />
    <PermissionRow icon="radio" title="Device GPS" body="Device location must be turned on in your phone settings." done={state.gps} onAllow={askGps} />
    <Pressable accessibilityRole="button" onPress={() => void Linking.openSettings()} style={styles.settings}><Ionicons name="settings-outline" size={18} color={colors.primary} /><Text style={styles.settingsText}>Open app settings</Text></Pressable>
  </Screen>;
}

function PermissionRow({ icon, title, body, done, onAllow }: { icon: ComponentProps<typeof Ionicons>['name']; title: string; body: string; done: boolean; onAllow: () => void }) {
  return <View style={styles.row}><View style={styles.icon}><Ionicons name={icon} size={20} color={colors.primary} /></View><View style={styles.flex}><Text style={styles.title}>{title}</Text><Text style={styles.body}>{body}</Text></View>
    {done ? <Ionicons name="checkmark-circle" size={28} color={colors.success} accessibilityLabel="Allowed" /> : <Pressable accessibilityRole="button" onPress={onAllow} style={styles.allow}><Text style={styles.allowText}>Allow</Text></Pressable>}</View>;
}
const styles = StyleSheet.create({
  flex: { flex: 1, gap: 3 },
  notice: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.button, backgroundColor: colors.warningSoft, borderWidth: 1, borderColor: '#FDE68A' },
  noticeText: { flex: 1, color: colors.heading, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  title: { color: colors.heading, fontFamily: typography.bold, fontSize: 15 },
  body: { color: colors.body, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18 },
  allow: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.primary },
  allowText: { color: colors.white, fontFamily: typography.bold, fontSize: 13 },
  settings: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, minHeight: 50, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.primary },
  settingsText: { color: colors.primary, fontFamily: typography.bold, fontSize: 14 },
});
