import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/ui/screen';
import { colors, radius, spacing, typography } from '@/theme/tokens';

const steps = [
  { title: 'Start travelling on time', body: 'Tap Start travelling when you leave for the job so the customer knows you are on the way.' },
  { title: 'Inspect and agree the work', body: 'Check the site carefully and confirm the work and price with the customer before starting.' },
  { title: 'Start the job', body: 'Tap Start job only after the customer has approved the work.' },
  { title: 'Complete and collect payment', body: 'Finish the work, collect the balance shown in the app, then tap Complete job.' },
];

export default function ServiceGuideScreen() {
  return <Screen title="Service guide" subtitle="Follow these steps strictly for a smooth and successful service experience.">
    {steps.map((step, index) => <View key={step.title} style={styles.step}>
      <View style={styles.rail}><View style={styles.num}><Text style={styles.numText}>{index + 1}</Text></View>{index < steps.length - 1 ? <View style={styles.line} /> : null}</View>
      <View style={styles.flex}><Text style={styles.title}>{step.title}</Text><Text style={styles.body}>{step.body}</Text></View>
    </View>)}
    <View style={styles.warning}><View style={styles.warningHead}><Ionicons name="warning" size={18} color={colors.warning} /><Text style={styles.warningTitle}>Important – strictly follow the process</Text></View><Text style={styles.body}>Not following the process may lead to penalties. Repeated or serious violations may lead to permanent removal from the Purple Squad platform.</Text></View>
  </Screen>;
}
const styles = StyleSheet.create({
  flex: { flex: 1, gap: 4, paddingBottom: spacing.lg },
  step: { flexDirection: 'row', gap: spacing.md },
  rail: { alignItems: 'center' },
  num: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  numText: { color: colors.white, fontFamily: typography.bold, fontSize: 13 },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 4 },
  title: { color: colors.heading, fontFamily: typography.bold, fontSize: 16 },
  body: { color: colors.body, fontFamily: typography.regular, fontSize: 13.5, lineHeight: 20 },
  warning: { gap: spacing.sm, padding: spacing.lg, borderRadius: radius.card, borderWidth: 1, borderColor: '#FDE68A', backgroundColor: colors.warningSoft },
  warningHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  warningTitle: { flex: 1, color: colors.heading, fontFamily: typography.extrabold, fontSize: 13.5, textTransform: 'uppercase' },
});
