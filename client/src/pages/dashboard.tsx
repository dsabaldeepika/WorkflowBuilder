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
import { WelcomeContent } from '@/components/dashboard/WelcomeContent';

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
          <div>
      <WelcomeContent />
      {/* Rest of your dashboard content */}
      </div>
  );
}