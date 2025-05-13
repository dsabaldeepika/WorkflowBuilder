import React from 'react';
import { EmailSettings } from '@/components/settings/EmailSettings';

export default function EmailSettingsPage() {
  return (
    <div className="container py-6 md:py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Configure how and when PumpFlux notifies you via email about workflows and system events
          </p>
        </div>
        
        <EmailSettings />
      </div>
    </div>
  );
}