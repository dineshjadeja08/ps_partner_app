import { Card, KeyValue } from '@/components/partner-ui';
import { Screen } from '@/components/ui/screen';
import { LoadingState, MessageState } from '@/components/ui/states';
import { formatDate } from '@/lib/format';
import { useProfile } from '@/lib/queries';
import { useAuth } from '@/stores/auth';

export default function ProfileScreen() {
  const profile = useProfile(); const user = useAuth((state) => state.user);
  if (profile.isLoading) return <LoadingState />;
  if (!profile.data) return <Screen><MessageState title="Couldn’t load profile" message={profile.error?.message ?? 'Please try again.'} actionLabel="Try again" onAction={() => void profile.refetch()} /></Screen>;
  const data = profile.data;
  return <Screen>
    <Card>
      <KeyValue label="Name" value={data.display_name} /><KeyValue label="Signed in as" value={user?.phone_number ?? data.phone} /><KeyValue label="Email" value={data.email || '–'} />
      <KeyValue label="Partner type" value={data.technician_type.toLowerCase()} /><KeyValue label="Experience" value={`${Number(data.experience_years)} years`} /><KeyValue label="Languages" value={data.languages.join(', ') || '–'} />
    </Card>
    <Card>
      <KeyValue label="Partner ID" value={data.employee_code} /><KeyValue label="City" value={[data.city, data.pincode].filter(Boolean).join(' – ') || '–'} /><KeyValue label="Status" value={data.employment_status.toLowerCase()} />
      <KeyValue label="Verification" value={data.background_verification_status.replaceAll('_', ' ').toLowerCase()} /><KeyValue label="Joined" value={data.joined_at ? formatDate(data.joined_at) : '–'} />
    </Card>
  </Screen>;
}
