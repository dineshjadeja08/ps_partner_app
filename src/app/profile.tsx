import { Card, KeyValue, SampleDataNote } from '@/components/partner-ui';
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
    <SampleDataNote label="Profile details are sample data. Your signed-in number is live." />
    <Card>
      <KeyValue label="Name" value={data.display_name} /><KeyValue label="Signed in as" value={user?.phone_number ?? data.phone} /><KeyValue label="Email" value={data.email || '–'} />
      <KeyValue label="Role" value={data.role === 'OWNER' ? 'Owner' : 'Technician'} /><KeyValue label="Partner type" value={data.technician_type.toLowerCase()} />
    </Card>
    <Card>
      <KeyValue label="Company" value={data.company_name} /><KeyValue label="Address" value={data.company_address} /><KeyValue label="Partner ID" value={data.partner_code} />
      <KeyValue label="Verification" value={data.background_verification_status.replaceAll('_', ' ').toLowerCase()} /><KeyValue label="Joined" value={data.joined_at ? formatDate(data.joined_at) : '–'} />
    </Card>
  </Screen>;
}
