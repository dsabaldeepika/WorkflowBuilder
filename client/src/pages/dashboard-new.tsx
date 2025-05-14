import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { GradientBackground } from '@/components/ui/gradient-background';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from '@tanstack/react-query';
import { 
  PlusCircle, 
  ListChecks, 
  Settings, 
  Zap, 
  Activity,
  RefreshCw,
  CreditCard,
  BarChart3,
  Sparkles,
  ArrowRightLeft,
  Rocket,
  CheckCircle,
  XCircle,
  Clock,
  PauseCircle,
  Info,
  LightbulbIcon,
  BrainCircuit,
  CircleEllipsis
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Type definitions for workflow data
interface Workflow {
  id: number | string;
  name: string;
  description: string;
  state: string;
  type: string;
  lastRun?: string;
  nextRun?: string;
  runCount: number;
}

// Type definitions for activity data
interface WorkflowRun {
  id: number | string;
  workflowId: number | string;
  workflowName: string;
  state: string;
  executedAt: string;
  type?: string;
  progress?: number;
  estimatedCompletion?: string;
}

interface ActivityData {
  runs: WorkflowRun[];
  totalRuns: number;
}

// Type definitions for metrics data
interface Metrics {
  avgExecutionTime: string;
  successRate: number;
  totalRuns: number;
  activeWorkflows: number;
  runningWorkflows: number;
  performanceChange: number;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  // Fetch real workflow data from the API
  const { 
    data: workflows = [], 
    isLoading: isLoadingWorkflows,
    error: workflowError
  } = useQuery<Workflow[]>({
    queryKey: ['/api/workflows'],
    enabled: !!user // Only fetch when user is authenticated
  });
  
  // Fetch metrics data for the dashboard
  const {
    data: metrics,
    isLoading: isLoadingMetrics
  } = useQuery<Metrics>({
    queryKey: ['/api/workflows/metrics'],
    enabled: !!user
  });
  
  // Fetch activity data for the dashboard
  const {
    data: activityData,
    isLoading: isLoadingActivity
  } = useQuery<ActivityData>({
    queryKey: ['/api/workflows/activity'],
    enabled: !!user
  });
  
  // Usage ideas for inspiration
  const usageIdeas = [
    {
      title: "Customer Journey Automation",
      description: "Map and automate your entire customer journey from first contact to repeat business.",
      icon: <BrainCircuit className="h-5 w-5 text-purple-500" />,
      templateId: 25, // The ID of the template in the database
      category: "crm",
      url: "/inspiration-gallery?category=crm&search=Customer%20Journey%20Automation"
    },
    {
      title: "Marketing Campaign Orchestration",
      description: "Schedule and coordinate multi-channel marketing campaigns that respond to customer actions.",
      icon: <Sparkles className="h-5 w-5 text-amber-500" />,
      templateId: 26,
      category: "marketing",
      url: "/inspiration-gallery?category=marketing&search=Marketing%20Campaign%20Orchestration"
    },
    {
      title: "Data Synchronization Hub",
      description: "Keep your business data in sync across all platforms without manual imports/exports.",
      icon: <ArrowRightLeft className="h-5 w-5 text-blue-500" />,
      templateId: 27,
      category: "data-processing",
      url: "/inspiration-gallery?category=data-processing&search=Data%20Synchronization%20Hub"
    },
    {
      title: "Intelligent Lead Scoring",
      description: "Automatically score and prioritize leads based on engagement and conversion potential.",
      icon: <LightbulbIcon className="h-5 w-5 text-green-500" />,
      templateId: 28,
      category: "sales",
      url: "/inspiration-gallery?category=sales&search=Intelligent%20Lead%20Scoring"
    }
  ];

  // Function to get badge variant based on workflow state
  const getStateVariant = (state: string) => {
    switch (state) {
      case 'completed':
        return 'success';
      case 'running':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'paused':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Function to get state label for workflow state
  const getStateLabel = (state: string) => {
    switch (state) {
      case 'completed':
        return 'Completed';
      case 'running':
        return 'Running';
      case 'failed':
        return 'Failed';
      case 'paused':
        return 'Paused';
      default:
        return 'Unknown';
    }
  };

  // Function to get state icon based on workflow state
  const getStateIcon = (state: string) => {
    switch (state) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-rose-500" />;
      case 'paused':
        return <PauseCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-500" />;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect is handled in logout function
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <GradientBackground>
      <div className="container mx-auto py-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">PumpFlux Dashboard</h1>
            <p className="text-muted-foreground mt-1">Create powerful automated workflows and connections</p>
          </div>
          
          <div className="flex items-center mt-4 md:mt-0 space-x-4">
            {user && user.claims?.profile_image_url && (
              <div className="flex items-center gap-2 border rounded-full p-1 pr-4 bg-card">
                <img 
                  src={user.claims.profile_image_url} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium">{user.claims?.username || 'User'}</span>
              </div>
            )}
            <Button variant="ghost" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="col-span-1 hover:shadow-md transition-shadow border-2 border-primary/10 hover:border-primary/30">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mb-5">
                <Rocket className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Create Workflow</h3>
              <p className="text-muted-foreground mt-2 mb-5">
                Build custom automations that work for you 24/7. Connect your apps and data with our intuitive drag-and-drop builder.
              </p>
              <Button className="w-full" onClick={() => window.location.href = '/create'}>
                Start Building
              </Button>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 hover:shadow-md transition-shadow border-2 border-amber-100 hover:border-amber-200">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center mb-5">
                <Sparkles className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="font-semibold text-lg">Template Library</h3>
              <p className="text-muted-foreground mt-2 mb-5">
                Save hours with ready-made workflows built by experts. Customize pre-built templates for marketing, sales, operations and more.
              </p>
              <Button className="w-full bg-amber-500 hover:bg-amber-600" onClick={() => window.location.href = '/templates'}>
                Explore Templates
              </Button>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 hover:shadow-md transition-shadow border-2 border-blue-100 hover:border-blue-200">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-5">
                <BarChart3 className="h-7 w-7 text-blue-500" />
              </div>
              <h3 className="font-semibold text-lg">Health Dashboard</h3>
              <p className="text-muted-foreground mt-2 mb-5">
                Gain complete visibility into your workflow performance. Track metrics, receive alerts, and optimize for peak efficiency.
              </p>
              <Button className="w-full bg-blue-500 hover:bg-blue-600" onClick={() => window.location.href = '/health-dashboard'}>
                Monitor Performance
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Workflow use cases and ideas */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">Popular Workflow Ideas</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {usageIdeas.map((idea, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center mb-3">
                    <div className="mr-2">
                      {idea.icon}
                    </div>
                    <h3 className="font-medium text-sm">{idea.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {idea.description}
                  </p>
                  <Link href={idea.url}>
                    <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                      View Templates
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Health Monitoring Feature Highlight */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold text-blue-800 flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-blue-600" />
                  New Feature: Workflow Health Monitoring
                </h2>
                <p className="text-blue-600 mt-1">
                  Track performance metrics, identify bottlenecks, and optimize your workflows with our new health dashboard
                </p>
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => window.location.href = '/health-dashboard'}
              >
                Explore Health Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Workflow Optimizer Feature Highlight */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-100">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold text-purple-800 flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-purple-600" />
                  New Feature: One-Click Performance Optimization
                </h2>
                <p className="text-purple-600 mt-1">
                  Automatically detect performance bottlenecks and optimize your workflows with smart suggestions
                </p>
              </div>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => window.location.href = ROUTES.workflowOptimizer}
              >
                Try Workflow Optimizer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main content tabs */}
        <Tabs defaultValue="workflows" className="w-full">
          <TabsList className="mb-8 grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="workflows">
              <ListChecks className="h-4 w-4 mr-2" />
              My Workflows
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          {/* My Workflows Tab */}
          <TabsContent value="workflows">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold mb-2">My Workflows</h2>
                <p className="text-muted-foreground text-lg">
                  Create, manage and monitor all your active automation flows in one place. Get insights on performance and optimization opportunities.
                </p>
              </div>
              
              <Link href="/create">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Workflow
                </Button>
              </Link>
            </div>
            
            {isLoadingWorkflows ? (
              <div className="grid gap-5 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <Skeleton className="h-9 w-16" />
                        <Skeleton className="h-9 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : workflows && workflows.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {workflows.map((workflow) => (
                  <Card key={workflow.id} className="overflow-hidden transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-medium">{workflow.name}</CardTitle>
                        <Badge variant={getStateVariant(workflow.state)}>
                          {getStateIcon(workflow.state)}
                          <span className="ml-1">{getStateLabel(workflow.state)}</span>
                        </Badge>
                      </div>
                      <CardDescription>{workflow.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-medium">{workflow.type}</span>
                        </div>
                        {workflow.lastRun && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last run:</span>
                            <span>{workflow.lastRun}</span>
                          </div>
                        )}
                        {workflow.nextRun && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Next run:</span>
                            <span>{workflow.nextRun}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total runs:</span>
                          <span>{workflow.runCount}</span>
                        </div>
                      </div>
                      
                      {workflow.state === 'running' && (
                        <div className="mt-3">
                          <Progress value={67} className="h-1.5" />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>67% complete</span>
                            <span>~1 min remaining</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button size="sm">Run</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center max-w-md mx-auto">
                    <PlusCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No workflows yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't created any workflows yet. Start by creating a new workflow or using a template.
                    </p>
                    <Button onClick={() => window.location.href = '/create'}>Create Workflow</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Activity Tab */}
          <TabsContent value="activity">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Recent Activity</h2>
                <p className="text-muted-foreground text-lg">Track your workflow executions and monitor performance metrics in real-time.</p>
              </div>
              
              <Link href="/health-dashboard">
                <Button variant="outline" size="sm">
                  <Activity className="h-4 w-4 mr-2" />
                  View Full Dashboard
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {/* Recent workflow executions */}
              {isLoadingActivity ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <Skeleton className="h-8 w-8 rounded-full mr-4" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-48 mb-2" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <Skeleton className="h-9 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : activityData?.runs && activityData.runs.length > 0 ? (
                activityData.runs.map((run) => (
                  <Card 
                    key={run.id}
                    className={`transition-all hover:shadow-md ${
                      run.state === 'running' ? 'border-blue-200 bg-blue-50/30' :
                      run.state === 'completed' ? 'border-green-200 bg-green-50/30' :
                      run.state === 'failed' ? 'border-rose-200 bg-rose-50/30' :
                      ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="mr-4">
                          {getStateIcon(run.state)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-base">{run.workflowName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {run.executedAt} • {run.type || 'Workflow Run'}
                          </p>
                          {run.state === 'running' && run.progress !== undefined && (
                            <div className="mt-2">
                              <Progress value={run.progress} className="h-1.5" />
                              <div className="flex justify-between text-xs text-blue-700 mt-1">
                                <span>Progress: {run.progress}%</span>
                                <span>Est. completion: {run.estimatedCompletion || 'Calculating...'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Activity className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center">
                      <Activity className="h-10 w-10 text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium mb-1">No recent activity</h3>
                      <p className="text-muted-foreground">
                        Activity data will appear here once your workflows start running.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Performance insights section */}
            <div className="mt-10">
              <h3 className="text-xl font-semibold mb-4">Performance Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Average Execution Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingMetrics ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-3xl font-bold">{metrics?.avgExecutionTime || '0s'}</div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {metrics?.performanceChange !== undefined ? 
                        `${metrics.performanceChange > 0 ? metrics.performanceChange + '% faster' : Math.abs(metrics.performanceChange) + '% slower'} than last week` : 
                        'No comparison data available'
                      }
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingMetrics ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-3xl font-bold text-emerald-600">{metrics?.successRate ? metrics.successRate.toFixed(1) + '%' : '0%'}</div>
                    )}
                    <p className="text-sm text-muted-foreground">Total runs: {metrics?.totalRuns || 0} this week</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Active Workflows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingMetrics ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-3xl font-bold">{metrics?.activeWorkflows || 0}</div>
                    )}
                    <p className="text-sm text-muted-foreground">{metrics?.runningWorkflows || 0} running now</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Execution Trends</CardTitle>
                  <CardDescription>Compare your workflow performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-md p-6 text-center">
                    <div>
                      <BarChart3 className="h-10 w-10 text-muted-foreground mb-2 mx-auto" />
                      <p className="font-medium">Performance analytics visualized here</p>
                      <p className="text-sm text-muted-foreground mt-1">View detailed metrics on the Health Dashboard</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">Settings</h2>
              <p className="text-muted-foreground text-lg">Configure your account and workflow preferences</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account details and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Profile Information</h4>
                      <p className="text-sm text-muted-foreground">Update your account details</p>
                    </div>
                    <Button variant="outline" size="sm">Edit Profile</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Notification Settings</h4>
                      <p className="text-sm text-muted-foreground">Configure email and in-app notifications</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Subscription Plan</h4>
                      <p className="text-sm text-muted-foreground">View or change your current plan</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/pricing'}>
                      View Plans
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Preferences</CardTitle>
                  <CardDescription>Default settings for all workflows</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Default Scheduling</h4>
                      <p className="text-sm text-muted-foreground">Set default schedule for new workflows</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Error Handling</h4>
                      <p className="text-sm text-muted-foreground">Configure retry attempts and notifications</p>
                    </div>
                    <Button variant="outline" size="sm">Settings</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">API Connections</h4>
                      <p className="text-sm text-muted-foreground">Manage your connected services and API keys</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </GradientBackground>
  );
}