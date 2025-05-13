import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { GradientBackground } from '@/components/ui/gradient-background';
import WorkflowTemplates from '@/components/templates/WorkflowTemplates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PlusCircle, 
  ListChecks, 
  Stars, 
  Settings, 
  LayoutGrid, 
  Zap, 
  Activity,
  RefreshCw,
  CreditCard,
  LineChart,
  Gauge
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import { WorkflowStateIndicator, WorkflowState } from '@/components/workflow/StateChangeAnimation';
import WorkflowAnimationCard from '@/components/workflow/WorkflowAnimationCard';
import { PrefetchLink, usePrefetchOnHover } from '@/hooks/usePrefetchOnHover';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('templates');
  
  // Sample workflows with states for demonstration purposes
  const [recentWorkflows] = useState([
    { 
      id: 1, 
      name: 'Daily Social Posts Generator', 
      description: 'Automatically creates and schedules social media posts',
      lastRun: '2 hours ago', 
      nextRun: 'Tomorrow at 8:00 AM',
      state: 'completed' as WorkflowState,
      type: 'Social Media',
      runCount: 145
    },
    { 
      id: 2, 
      name: 'Customer Data Sync', 
      description: 'Syncs customer data between CRM and marketing platforms',
      lastRun: '45 minutes ago', 
      nextRun: 'Running now',
      state: 'running' as WorkflowState,
      type: 'Data Integration',
      runCount: 89
    },
    { 
      id: 3, 
      name: 'Weekly Analytics Report', 
      description: 'Generates and sends weekly analytics reports',
      lastRun: 'Just now', 
      nextRun: 'Next Monday at 6:00 AM',
      state: 'failed' as WorkflowState,
      type: 'Reporting',
      runCount: 52
    },
    { 
      id: 4, 
      name: 'Lead Nurturing Campaign', 
      description: 'Automated email campaign for lead nurturing',
      lastRun: '1 day ago', 
      nextRun: 'Paused',
      state: 'paused' as WorkflowState,
      type: 'Marketing',
      runCount: 27
    },
  ]);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="col-span-1 hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <PlusCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Create Workflow</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">Start building from scratch</p>
              <Button className="w-full" variant="outline" onClick={() => window.location.href = '/create'}>
                Create New
              </Button>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Stars className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Template Library</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">Browse ready-made templates</p>
              <Button className="w-full" variant="outline" onClick={() => window.location.href = '/templates'}>
                Browse Templates
              </Button>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Subscription Plans</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">Explore premium features</p>
              <Button className="w-full" variant="outline" onClick={() => window.location.href = '/pricing'}>
                View Plans
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="col-span-1 hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Health Dashboard</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">Monitor workflow performance</p>
              <Button className="w-full" variant="outline" onClick={() => window.location.href = '/health-dashboard'}>
                View Metrics
              </Button>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Gauge className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Performance Tools</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">Optimize workflow execution</p>
              <Button className="w-full" variant="outline" onClick={() => window.location.href = '/performance'}>
                Optimize Now
              </Button>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">State Animations</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">View workflow transitions</p>
              <Button className="w-full" variant="outline" onClick={() => window.location.href = '/workflow-animations'}>
                View Animations
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Performance Optimization Feature Highlight */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold text-purple-800 flex items-center">
                  <Gauge className="mr-2 h-5 w-5 text-purple-600" />
                  New Feature: Performance Optimization Tools
                </h2>
                <p className="text-purple-600 mt-1">
                  Scale your workflows to 5,000+ users with our new optimization tools, code splitting, and performance monitoring
                </p>
              </div>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => window.location.href = '/performance'}
              >
                Explore Performance Tools
              </Button>
            </div>
          </CardContent>
        </Card>
        
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

        {/* Main content tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="templates">
              <Stars className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
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
          
          {/* Templates Tab */}
          <TabsContent value="templates">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">Workflow Templates</h2>
              <p className="text-muted-foreground">
                Get started quickly with pre-built workflow templates that you can customize for your needs.
              </p>
            </div>
            
            <WorkflowTemplates />
          </TabsContent>
          
          {/* My Workflows Tab */}
          <TabsContent value="workflows">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold mb-2">My Workflows</h2>
                <p className="text-muted-foreground">Manage and monitor your active workflows.</p>
              </div>
              
              <Link href="/workflow-animations">
                <Button variant="outline" size="sm">
                  <Zap className="h-4 w-4 mr-2" />
                  View State Animations
                </Button>
              </Link>
            </div>
            
            {recentWorkflows && recentWorkflows.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {recentWorkflows.map((workflow) => (
                  <WorkflowAnimationCard 
                    key={workflow.id} 
                    workflow={workflow}
                    showControls={true}
                    animate={false}
                  />
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
                <p className="text-muted-foreground">View recent workflow executions and state changes.</p>
              </div>
              
              <Link href="/workflow-animations">
                <Button variant="outline" size="sm">
                  <Zap className="h-4 w-4 mr-2" />
                  View All Animations
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {/* Recent workflow executions with animated state transitions */}
              {recentWorkflows.map((workflow, idx) => (
                <div 
                  key={workflow.id}
                  className="p-4 rounded-lg border bg-card transition-all hover:shadow-md"
                >
                  <div className="flex items-center">
                    <div className="mr-4">
                      <WorkflowStateIndicator 
                        state={workflow.state}
                        previousState={idx === 0 ? 'starting' : undefined} // Animate the first item
                        size="md"
                        animate={idx === 0} // Only animate the first item
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-base">{workflow.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {workflow.lastRun} • {workflow.type}
                      </p>
                    </div>
                    <div>
                      <Button variant="ghost" size="sm">Details</Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Animated card for currently running workflow */}
              <Card className="border-blue-200 bg-blue-50/30 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="mr-4">
                      <div className="relative">
                        <div className="absolute -inset-1.5 bg-blue-100 rounded-full animate-pulse-ring"></div>
                        <div className="relative">
                          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin-slow" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Customer Data Sync</h3>
                      <div className="flex items-center text-sm gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">Running</span>
                        <span className="text-blue-700">Started 2 minutes ago</span>
                      </div>
                      <div className="mt-2 w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full animate-pulse w-2/3"></div>
                      </div>
                      <div className="flex justify-between text-xs text-blue-700 mt-1">
                        <span>Progress: 67%</span>
                        <span>Est. completion: 1 min remaining</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">State Transition Visualization</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center gap-6 justify-center md:justify-between">
                    {['idle', 'starting', 'running', 'completed', 'failed', 'paused', 'retrying'].map((state) => (
                      <div key={state} className="flex flex-col items-center">
                        <WorkflowStateIndicator 
                          state={state as WorkflowState} 
                          size="md"
                          animate={false}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Link href="/workflow-animations">
                      <Button>
                        <Zap className="h-4 w-4 mr-2" />
                        View Full Animation Demo
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">Settings</h2>
              <p className="text-muted-foreground">
                Manage your account preferences and integrations.
              </p>
            </div>
            
            <div className="max-w-lg">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences and integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-md font-medium mb-2">Connected Account</h3>
                    {user && user.claims?.profile_image_url && (
                      <div className="flex items-center gap-3 p-3 border rounded-md">
                        <img 
                          src={user.claims.profile_image_url} 
                          alt="Profile" 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium">{user.claims?.username || 'User'}</div>
                          <div className="text-sm text-muted-foreground">{user.claims?.email || ''}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium mb-2">Subscription & Billing</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Manage your subscription plan, payment methods, and billing history.
                    </p>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <span>Manage subscription</span>
                      <Button variant="outline" size="sm">
                        <Link href="/account/billing">
                          Billing Settings
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium mb-2">Workflow Animation Settings</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Configure how workflow state transitions are animated throughout the application.
                    </p>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <span>Enable animations</span>
                      <Button variant="outline" size="sm">
                        <Link href="/workflow-animations">
                          Configure
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={handleLogout} className="w-full">
                    Log Out
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </GradientBackground>
  );
}