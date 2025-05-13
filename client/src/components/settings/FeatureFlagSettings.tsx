import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface FeatureFlag {
  id: number;
  featureName: string;
  isEnabled: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export function FeatureFlagSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch all feature flags
  const {
    data: featureFlags,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<FeatureFlag[]>({
    queryKey: ['/api/feature-flags'],
    queryFn: async () => {
      const res = await fetch('/api/feature-flags');
      return await res.json();
    }
  });

  // Mutation for updating a feature flag
  const updateFeatureFlagMutation = useMutation({
    mutationFn: async ({ flagName, isEnabled }: { flagName: string; isEnabled: boolean }) => {
      const res = await fetch(`/api/feature-flags/${flagName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isEnabled }),
      });
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate the feature flags cache to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['/api/feature-flags'] });
      toast({
        title: 'Feature flag updated',
        description: 'The feature flag has been updated successfully.',
        variant: 'default'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update feature flag.',
        variant: 'destructive'
      });
    }
  });

  // Handle toggling a feature flag
  const handleToggleFeature = (flagName: string, currentValue: boolean) => {
    updateFeatureFlagMutation.mutate({
      flagName,
      isEnabled: !currentValue
    });
  };

  // Handle manual refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Create descriptive labels for each feature flag
  const getFeatureDescription = (featureName: string, description: string | null) => {
    if (description) return description;

    // Default descriptions if none is provided
    switch (featureName) {
      case 'stripe_enabled':
        return 'Enable Stripe payment processing functionality throughout the application.';
      case 'sendgrid_enabled':
        return 'Enable SendGrid email functionality for notifications and alerts.';
      default:
        return `Controls the ${featureName.replace('_', ' ')} feature.`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Feature Flags</h2>
          <p className="text-muted-foreground mt-2">
            Enable or disable platform features throughout the application.
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error?.message || 'Failed to load feature flags. Please try again later.'}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <Skeleton className="h-4 w-52" />
                <Skeleton className="h-6 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {featureFlags?.map((flag) => (
            <Card key={flag.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {flag.featureName}
                  {flag.isEnabled && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      <Check className="mr-1 h-3 w-3" />
                      Enabled
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {getFeatureDescription(flag.featureName, flag.description)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {flag.isEnabled
                    ? 'This feature is currently enabled and active throughout the platform.'
                    : 'This feature is currently disabled and will not be available to users.'}
                </div>
                <Switch
                  checked={flag.isEnabled}
                  onCheckedChange={() => handleToggleFeature(flag.featureName, flag.isEnabled)}
                  disabled={updateFeatureFlagMutation.isPending}
                  aria-label={`Toggle ${flag.featureName}`}
                />
              </CardContent>
            </Card>
          ))}

          {featureFlags?.length === 0 && (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground">No feature flags found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Alert>
        <AlertTitle>Important Information</AlertTitle>
        <AlertDescription className="text-sm">
          Changing these settings will immediately affect the application's behavior. Disabling features may result in certain functionality becoming unavailable to users.
        </AlertDescription>
      </Alert>
    </div>
  );
}