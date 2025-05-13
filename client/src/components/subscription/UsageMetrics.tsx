import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Activity, Package, Terminal, Clock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';

interface UsageLimits {
  workflowsUsed: number;
  workflowsLimit: number;
  workflowRunsUsed: number;
  workflowRunsLimit: number;
  workflowNodesUsed: number;
  workflowNodesLimit: number;
  templatesUsed: number;
  templatesLimit: number;
  apiCallsUsed: number;
  apiCallsLimit: number;
}

export default function UsageMetrics() {
  // Fetch usage metrics
  const { data: usage, isLoading } = useQuery({
    queryKey: ['/api/subscriptions/usage'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/subscriptions/usage');
        return response;
      } catch (error) {
        console.error('Error fetching usage metrics:', error);
        return null;
      }
    }
  });

  // Calculate percentage usage
  const calculatePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  // Get appropriate color based on usage percentage
  const getColorByPercentage = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 75) return 'bg-amber-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    if (num === -1) return 'Unlimited';
    return new Intl.NumberFormat().format(num);
  };

  // Render progress bar with label
  const UsageProgressBar = ({ 
    used, 
    limit, 
    label, 
    icon: Icon, 
    warningPercentage = 80 
  }: { 
    used: number, 
    limit: number, 
    label: string, 
    icon: any, 
    warningPercentage?: number 
  }) => {
    const isUnlimited = limit === -1;
    const percentage = isUnlimited ? 0 : calculatePercentage(used, limit);
    const showWarning = percentage >= warningPercentage;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium">
              {formatNumber(used)} / {formatNumber(limit)}
            </span>
            {!isUnlimited && (
              <span className="text-xs text-muted-foreground ml-1">
                ({percentage}%)
              </span>
            )}
          </div>
        </div>
        
        {isUnlimited ? (
          <div className="flex items-center">
            <Progress value={5} className="h-2" />
            <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200">Unlimited</Badge>
          </div>
        ) : (
          <Progress 
            value={percentage} 
            className={`h-2 ${getColorByPercentage(percentage)}`} 
          />
        )}
      </div>
    );
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Activity className="mr-2 h-5 w-5 text-primary" />
          Subscription Usage
        </CardTitle>
        <CardDescription>
          Monitor your usage metrics against your subscription limits
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : usage ? (
          <>
            {/* Show warning if any usage is over 90% */}
            {Object.entries(usage).some(([key, value]: [string, any]) => {
              const limit = value.limit;
              const used = value.used;
              return limit !== -1 && calculatePercentage(used, limit) >= 90;
            }) && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Usage limit approaching</AlertTitle>
                <AlertDescription>
                  You're approaching the limits of your current plan. Consider upgrading to avoid service disruptions.
                </AlertDescription>
              </Alert>
            )}
            
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList>
                <TabsTrigger value="all">All Usage</TabsTrigger>
                <TabsTrigger value="workflows">Workflows</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-6">
                <UsageProgressBar
                  used={usage.workflows.used}
                  limit={usage.workflows.limit}
                  label="Workflows"
                  icon={Terminal}
                />
                
                <UsageProgressBar
                  used={usage.workflowRuns.used}
                  limit={usage.workflowRuns.limit}
                  label="Workflow Executions (This Month)"
                  icon={Activity}
                />
                
                <UsageProgressBar
                  used={usage.templates.used}
                  limit={usage.templates.limit}
                  label="Templates"
                  icon={Package}
                />
                
                <UsageProgressBar
                  used={usage.apiCalls.used}
                  limit={usage.apiCalls.limit}
                  label="API Calls (This Month)"
                  icon={Clock}
                />
              </TabsContent>
              
              <TabsContent value="workflows" className="space-y-6">
                <UsageProgressBar
                  used={usage.workflows.used}
                  limit={usage.workflows.limit}
                  label="Workflows"
                  icon={Terminal}
                />
                
                <UsageProgressBar
                  used={usage.workflowRuns.used}
                  limit={usage.workflowRuns.limit}
                  label="Workflow Executions (This Month)"
                  icon={Activity}
                />
                
                <UsageProgressBar
                  used={usage.nodes.used}
                  limit={usage.nodes.limit}
                  label="Nodes Per Workflow (Average)"
                  icon={Terminal}
                />
              </TabsContent>
              
              <TabsContent value="integrations" className="space-y-6">
                <UsageProgressBar
                  used={usage.templates.used}
                  limit={usage.templates.limit}
                  label="Templates"
                  icon={Package}
                />
                
                <UsageProgressBar
                  used={usage.apiCalls.used}
                  limit={usage.apiCalls.limit}
                  label="API Calls (This Month)"
                  icon={Clock}
                />
                
                <UsageProgressBar
                  used={usage.integrations.used}
                  limit={usage.integrations.limit}
                  label="Active Integrations"
                  icon={Package}
                />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Unable to load usage data. Please try again later.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}