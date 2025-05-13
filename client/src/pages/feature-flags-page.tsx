import { FeatureFlagSettings } from '@/components/settings/FeatureFlagSettings';
import { PageHeader } from '@/components/page-header';
import { SettingsLayout } from '@/components/layouts/settings-layout';

export default function FeatureFlagsPage() {
  return (
    <SettingsLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <PageHeader
          title="Platform Configuration"
          description="Manage platform-wide features and configurations"
        />
        <div className="mt-8">
          <FeatureFlagSettings />
        </div>
      </div>
    </SettingsLayout>
  );
}