import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/hooks/useAuth';
import { GradientBackground } from '@/components/ui/gradient-background';
import WorkflowTemplates from '@/components/templates/WorkflowTemplates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, ListChecks, Stars, Settings, LayoutGrid, Zap, Activity } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import { WorkflowStateIndicator, WorkflowState } from '@/components/workflow/StateChangeAnimation';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('templates');
  
  // Sample workflows with states for demonstration purposes
  const [recentWorkflows] = useState([
    { 
      id: 1, 
      name: 'Daily Social Posts Generator', 
      lastRun: '2 hours ago', 
      state: 'completed' as WorkflowState,
      type: 'Social Media',
      runCount: 145
    },
    { 
      id: 2, 
      name: 'Customer Data Sync', 
      lastRun: '45 minutes ago', 
      state: 'running' as WorkflowState,
      type: 'Data Integration',
      runCount: 89
    },
    { 
      id: 3, 
      name: 'Weekly Analytics Report', 
      lastRun: 'Just now', 
      state: 'failed' as WorkflowState,
      type: 'Reporting',
      runCount: 52
    },
    { 
      id: 4, 
      name: 'Lead Nurturing Campaign', 
      lastRun: '1 day ago', 
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
              <h3 className="font-medium">AI Assistant</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">Let AI build for you</p>
              <Button className="w-full" variant="outline">
                Try AI Builder
              </Button>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ListChecks className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">My Workflows</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">Manage existing workflows</p>
              <Button className="w-full" variant="outline">
                View All
              </Button>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <LayoutGrid className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Connections</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">Manage your integrations</p>
              <Button className="w-full" variant="outline">
                Connections
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main content tabs */}
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="workflows">My Workflows</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">Workflow Templates</h2>
              <p className="text-muted-foreground">
                Get started quickly with pre-built workflow templates that you can customize for your needs.
              </p>
            </div>
            
            <WorkflowTemplates />
          </TabsContent>
          
          <TabsContent value="workflows">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">My Workflows</h2>
              <p className="text-muted-foreground">Manage and monitor your active workflows.</p>
            </div>
            
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
          </TabsContent>
          
          <TabsContent value="monitoring">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">Workflow Monitoring</h2>
              <p className="text-muted-foreground">
                Track the performance and status of your workflows.
              </p>
            </div>
            
            <Card>
              <CardContent className="p-12 text-center">
                <p>Monitoring dashboard will appear here for your active workflows.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">Account Settings</h2>
              <p className="text-muted-foreground">
                Manage your account settings and preferences.
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>View and update your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user && (
                    <div className="rounded-lg bg-muted p-4">
                      <h3 className="mb-2 font-medium">User Information</h3>
                      <div className="grid gap-2">
                        {user.claims?.profile_image_url && (
                          <div className="flex justify-center">
                            <img 
                              src={user.claims.profile_image_url} 
                              alt="Profile" 
                              className="h-16 w-16 rounded-full object-cover"
                            />
                          </div>
                        )}
                        <p><span className="font-semibold">Username:</span> {user.claims?.username || 'Unknown'}</p>
                        <p><span className="font-semibold">Email:</span> {user.claims?.email || 'Not provided'}</p>
                        <p><span className="font-semibold">User ID:</span> {user.claims?.sub || 'Unknown'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </GradientBackground>
  );
}