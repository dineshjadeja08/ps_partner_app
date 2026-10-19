import { Linking } from 'react-native';
import { MenuRow } from '@/components/partner-ui';
import { Screen } from '@/components/ui/screen';
import { router } from 'expo-router';

export default function HelpScreen() {
  return <Screen title="How can we help?" subtitle="Reach the Purple Squad partner team for job, payment or account issues.">
    <MenuRow icon="book-outline" label="Service flow guide" detail="Steps to follow on every job" onPress={() => router.push('/service-guide')} />
    <MenuRow icon="call-outline" label="Call Purple Squad" detail="+91 76760 76361" onPress={() => void Linking.openURL('tel:+917676076361')} />
    <MenuRow icon="logo-whatsapp" label="WhatsApp support" detail="Share your work order number for faster help" onPress={() => void Linking.openURL('https://wa.me/917676076361')} />
    <MenuRow icon="globe-outline" label="Partner support" detail="purplesquad.in/partner-support" onPress={() => void Linking.openURL('https://purplesquad.in/partner-support')} />
    <MenuRow icon="mail-outline" label="Email us" detail="support@purplesquad.in" onPress={() => void Linking.openURL('mailto:support@purplesquad.in?subject=PurplePartner%20support')} />
  </Screen>;
}
