import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS } from '@shared/config';
import { Loader2, AlertCircle, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';

type UsageMetric = {
  used: number;
  limit: number;
};

type UsageData = {
  workflows: UsageMetric;
  workflowRuns: UsageMetric;
  nodes: UsageMetric;
  templates: UsageMetric;
  apiCalls: UsageMetric;
  integrations: UsageMetric;
};

export default function UsageMetrics() {
  const { data: usage, isLoading, error } = useQuery<UsageData>({
    queryKey: [API_ENDPOINTS.subscriptions.usage],
    queryFn: async () => {
      return await apiRequest(API_ENDPOINTS.subscriptions.usage);
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          We were unable to load your usage metrics. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // If no usage data available or on free plan with no metrics
  if (!usage) {
    return (
      <Alert>
        <AlertTitle>No Usage Data Available</AlertTitle>
        <AlertDescription>
          Usage metrics will appear here once you start using the platform.
        </AlertDescription>
      </Alert>
    );
  }

  // Calculate percentage for progress bar
  const getPercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  // Determine urgency for styling (warning when > 80% of limit)
  const getVariant = (used: number, limit: number) => {
    if (limit === -1) return 'default';
    const percentage = (used / limit) * 100;
    if (percentage > 90) return 'destructive';
    if (percentage > 75) return 'warning';
    return 'default';
  };

  // Format limit value for display
  const formatLimit = (limit: number) => {
    if (limit === -1) return 'Unlimited';
    return limit.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Workflows */}
        <UsageCard
          title="Workflows"
          used={usage.workflows.used}
          limit={usage.workflows.limit}
          description="Total number of workflows you can create"
          getPercentage={getPercentage}
          getVariant={getVariant}
          formatLimit={formatLimit}
        />

        {/* Workflow Runs */}
        <UsageCard
          title="Workflow Runs"
          used={usage.workflowRuns.used}
          limit={usage.workflowRuns.limit}
          description="Monthly execution count across all workflows"
          getPercentage={getPercentage}
          getVariant={getVariant}
          formatLimit={formatLimit}
        />

        {/* Nodes Per Workflow */}
        <UsageCard
          title="Nodes Per Workflow"
          used={usage.nodes.used}
          limit={usage.nodes.limit}
          description="Maximum nodes allowed in a single workflow"
          getPercentage={getPercentage}
          getVariant={getVariant}
          formatLimit={formatLimit}
        />

        {/* Templates */}
        <UsageCard
          title="Template Access"
          used={usage.templates.used}
          limit={usage.templates.limit}
          description="Number of premium templates you can use"
          getPercentage={getPercentage}
          getVariant={getVariant}
          formatLimit={formatLimit}
        />

        {/* API Calls */}
        <UsageCard
          title="API Calls"
          used={usage.apiCalls.used}
          limit={usage.apiCalls.limit}
          description="Monthly API request limit"
          getPercentage={getPercentage}
          getVariant={getVariant}
          formatLimit={formatLimit}
        />

        {/* Integrations */}
        <UsageCard
          title="Active Integrations"
          used={usage.integrations.used}
          limit={usage.integrations.limit}
          description="Number of integrations you can connect"
          getPercentage={getPercentage}
          getVariant={getVariant}
          formatLimit={formatLimit}
        />
      </div>

      <div className="bg-muted/40 rounded-lg p-4 text-sm text-muted-foreground">
        <p>Usage metrics are refreshed hourly. For more detailed analytics, visit the Workflow Monitoring dashboard.</p>
      </div>
    </div>
  );
}

type UsageCardProps = {
  title: string;
  used: number;
  limit: number;
  description: string;
  getPercentage: (used: number, limit: number) => number;
  getVariant: (used: number, limit: number) => 'default' | 'warning' | 'destructive';
  formatLimit: (limit: number) => string;
};

// Extracted card component to avoid repetition
function UsageCard({ 
  title, 
  used, 
  limit, 
  description,
  getPercentage,
  getVariant,
  formatLimit
}: UsageCardProps) {
  const percentage = getPercentage(used, limit);
  const variant = getVariant(used, limit);
  const isUnlimited = limit === -1;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          {isUnlimited && (
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Unlimited
            </Badge>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {!isUnlimited && (
            <Progress 
              value={percentage} 
              className={
                variant === 'destructive' 
                  ? 'bg-destructive/20' 
                  : variant === 'warning' 
                    ? 'bg-amber-100' 
                    : 'bg-primary/20'
              }
              indicatorClassName={
                variant === 'destructive' 
                  ? 'bg-destructive' 
                  : variant === 'warning' 
                    ? 'bg-amber-500'
                    : ''
              }
            />
          )}
          <div className="flex justify-between text-sm">
            <span>
              <span className="font-medium">{used.toLocaleString()}</span> used
            </span>
            <span>
              {isUnlimited ? (
                <span className="text-primary font-medium">Unlimited</span>
              ) : (
                <span>Limit: <span className="font-medium">{formatLimit(limit)}</span></span>
              )}
            </span>
          </div>
          
          {/* Show warning when approaching limit */}
          {variant === 'warning' && !isUnlimited && (
            <div className="text-xs text-amber-600 mt-1.5">
              <AlertCircle className="h-3 w-3 inline mr-1" />
              Approaching limit
            </div>
          )}
          
          {/* Show critical warning when at/over limit */}
          {variant === 'destructive' && !isUnlimited && (
            <div className="text-xs text-destructive mt-1.5">
              <AlertCircle className="h-3 w-3 inline mr-1" />
              Limit reached
            </div>
          )}
          
          {/* Show good status when well below limit */}
          {variant === 'default' && !isUnlimited && percentage > 0 && (
            <div className="text-xs text-primary mt-1.5">
              <Check className="h-3 w-3 inline mr-1" />
              Good usage
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}