import React from 'react';
import { PageHeader } from '@/components/page-header';
import { SettingsLayout } from '@/components/layouts/settings-layout';
import { FeatureFlagSettings } from '@/components/settings/FeatureFlagSettings';
import { Button } from '@/components/ui/button';
import { InfoIcon } from 'lucide-react';

export default function FeatureFlagsPage() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <PageHeader
          title="Feature Management"
          description="Control and configure platform features across the application."
          actions={
            <Button variant="outline" size="sm" className="gap-1">
              <InfoIcon className="h-4 w-4" />
              <span>Documentation</span>
            </Button>
          }
        />

        <FeatureFlagSettings />
      </div>
    </SettingsLayout>
  );
}