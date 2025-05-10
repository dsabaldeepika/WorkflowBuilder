import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GradientBackground } from '@/components/ui/gradient-background';
import { 
  WorkflowStateIndicator, 
  WorkflowState, 
  useWorkflowState,
  WorkflowStateTransition,
  WorkflowStateProgressBar,
  WorkflowStateHistory
} from '@/components/workflow/StateChangeAnimation';
import WorkflowAnimationCard from '@/components/workflow/WorkflowAnimationCard';
import { 
  ArrowLeft, 
  Zap, 
  RefreshCw, 
  Play, 
  Pause, 
  StopCircle, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WorkflowAnimationsDemo() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('state-indicators');
  
  // Example workflow for demo
  const demoWorkflow = {
    id: 1,
    name: 'Social Media Campaign Automation',
    description: 'Automatically post to multiple social media platforms on a schedule',
    state: 'idle' as WorkflowState,
    lastRun: '2 hours ago',
    nextRun: 'Tomorrow at 8:00 AM',
    type: 'Marketing',
    runCount: 37
  };
  
  // State for demo
  const { currentState, previousState, changeState } = useWorkflowState('idle');
  const [progress, setProgress] = useState(60);
  
  // Example state history
  const stateHistory = [
    { state: 'starting' as WorkflowState, timestamp: 'Today at 09:15 AM' },
    { state: 'running' as WorkflowState, timestamp: 'Today at 09:15 AM' },
    { state: 'paused' as WorkflowState, timestamp: 'Today at 09:45 AM' },
    { state: 'running' as WorkflowState, timestamp: 'Today at 10:15 AM' },
    { state: 'completed' as WorkflowState, timestamp: 'Today at 10:30 AM' },
  ];
  
  return (
    <GradientBackground>
      <div className="container mx-auto py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workflow State Animations</h1>
            <p className="text-muted-foreground mt-1">Visual state transitions for workflow monitoring</p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex mb-8">
            <TabsTrigger value="state-indicators">State Indicators</TabsTrigger>
            <TabsTrigger value="cards">Animated Cards</TabsTrigger>
            <TabsTrigger value="transitions">Transitions</TabsTrigger>
          </TabsList>
          
          {/* State Indicators Tab */}
          <TabsContent value="state-indicators">
            <div className="grid gap-8">
              {/* Introduction */}
              <Card>
                <CardHeader>
                  <CardTitle>Workflow State Indicators</CardTitle>
                  <CardDescription>
                    Visual representations of workflow states with smooth animations between transitions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    States provide visual feedback on the current status of workflows in the system. 
                    Each state has a distinct color and icon to make identification quick and intuitive.
                  </p>
                  
                  <div className="flex flex-wrap gap-8 mt-6 justify-center md:justify-start">
                    {['idle', 'starting', 'running', 'paused', 'completed', 'failed', 'retrying'].map((state) => (
                      <div key={state} className="flex flex-col items-center">
                        <WorkflowStateIndicator 
                          state={state as WorkflowState} 
                          showLabel 
                          size="md"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Interactive Demo */}
              <Card>
                <CardHeader>
                  <CardTitle>Interactive State Transitions</CardTitle>
                  <CardDescription>
                    Experiment with different state transitions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center mb-8">
                    <div className="flex flex-col items-center">
                      <WorkflowStateIndicator 
                        state={currentState} 
                        previousState={previousState}
                        showLabel
                        size="lg"
                      />
                      
                      <p className="text-sm text-muted-foreground mt-3 mb-4">
                        Current state: <span className="font-medium">{currentState}</span>
                        {previousState && <> (transitioned from {previousState})</>}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button variant="outline" onClick={() => changeState('idle')}>
                      Set Idle
                    </Button>
                    <Button variant="outline" onClick={() => changeState('starting')}>
                      <Play className="h-4 w-4 mr-1" /> Set Starting
                    </Button>
                    <Button variant="outline" onClick={() => changeState('running')}>
                      <RefreshCw className="h-4 w-4 mr-1" /> Set Running
                    </Button>
                    <Button variant="outline" onClick={() => changeState('paused')}>
                      <Pause className="h-4 w-4 mr-1" /> Set Paused
                    </Button>
                    <Button variant="outline" onClick={() => changeState('completed')}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Set Completed
                    </Button>
                    <Button variant="outline" onClick={() => changeState('failed')}>
                      <XCircle className="h-4 w-4 mr-1" /> Set Failed
                    </Button>
                    <Button variant="outline" onClick={() => changeState('retrying')}>
                      <AlertCircle className="h-4 w-4 mr-1" /> Set Retrying
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Progress Indicator */}
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Progress</CardTitle>
                  <CardDescription>
                    Visual indication of workflow execution progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-w-lg mx-auto">
                    <WorkflowStateProgressBar 
                      state={currentState}
                      progress={progress}
                    />
                    
                    <div className="flex items-center gap-4 mt-8">
                      <div className="flex-1">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={progress} 
                          onChange={(e) => setProgress(parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setProgress(0)}>
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Animated Cards Tab */}
          <TabsContent value="cards">
            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Cards with State Animations</CardTitle>
                  <CardDescription>
                    Cards that display workflow information with animated state transitions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <WorkflowAnimationCard 
                      workflow={{...demoWorkflow, state: currentState}}
                      animate={true}
                      showControls={true}
                    />
                    
                    <Card className="p-6 flex flex-col">
                      <h3 className="text-base font-medium mb-4">Change Card State</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => changeState('idle')}>
                          Set Idle
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => changeState('starting')}>
                          Set Starting
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => changeState('running')}>
                          Set Running
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => changeState('paused')}>
                          Set Paused
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => changeState('completed')}>
                          Set Completed
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => changeState('failed')}>
                          Set Failed
                        </Button>
                      </div>
                      
                      <Separator className="my-5" />
                      
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-base font-medium mb-2">State History</h3>
                        <div className="flex-1 overflow-auto">
                          <WorkflowStateHistory 
                            states={stateHistory} 
                            currentStateIndex={2}
                          />
                        </div>
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>
              
              {/* State History */}
              <Card>
                <CardHeader>
                  <CardTitle>Running Workflow Example</CardTitle>
                  <CardDescription>Example of a running workflow with progress animation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-card">
                    <div className="flex items-center">
                      <div className="mr-4 relative">
                        <div className="absolute -inset-1.5 bg-blue-100 rounded-full animate-pulse-ring"></div>
                        <div className="relative">
                          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin-slow" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Data Synchronization Workflow</h3>
                        <div className="flex items-center text-sm gap-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">Running</span>
                          <span className="text-blue-700">Started 3 minutes ago</span>
                        </div>
                        <div className="mt-2 w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full animate-pulse w-3/4"></div>
                        </div>
                        <div className="flex justify-between text-xs text-blue-700 mt-1">
                          <span>Progress: 75%</span>
                          <span>Est. completion: 1 min remaining</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button size="sm" variant="outline">
                          <Pause className="h-4 w-4 mr-1" /> Pause
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Transitions Tab */}
          <TabsContent value="transitions">
            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>State Transitions</CardTitle>
                  <CardDescription>
                    Visualize the flow between different workflow states
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-base font-medium mb-4">Common Transitions</h3>
                      <div className="space-y-6">
                        <WorkflowStateTransition 
                          fromState="idle" 
                          toState="starting"
                          onClick={() => {
                            changeState('idle');
                            setTimeout(() => changeState('starting'), 500);
                          }}
                        />
                        
                        <WorkflowStateTransition 
                          fromState="starting" 
                          toState="running"
                          onClick={() => {
                            changeState('starting');
                            setTimeout(() => changeState('running'), 500);
                          }}
                        />
                        
                        <WorkflowStateTransition 
                          fromState="running" 
                          toState="completed"
                          onClick={() => {
                            changeState('running');
                            setTimeout(() => changeState('completed'), 500);
                          }}
                        />
                        
                        <WorkflowStateTransition 
                          fromState="running" 
                          toState="failed"
                          onClick={() => {
                            changeState('running');
                            setTimeout(() => changeState('failed'), 500);
                          }}
                        />
                        
                        <WorkflowStateTransition 
                          fromState="running" 
                          toState="paused"
                          onClick={() => {
                            changeState('running');
                            setTimeout(() => changeState('paused'), 500);
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-4">Error Handling Transitions</h3>
                      <div className="space-y-6">
                        <WorkflowStateTransition 
                          fromState="running" 
                          toState="retrying"
                          onClick={() => {
                            changeState('running');
                            setTimeout(() => changeState('retrying'), 500);
                          }}
                        />
                        
                        <WorkflowStateTransition 
                          fromState="retrying" 
                          toState="running"
                          onClick={() => {
                            changeState('retrying');
                            setTimeout(() => changeState('running'), 500);
                          }}
                        />
                        
                        <WorkflowStateTransition 
                          fromState="retrying" 
                          toState="failed"
                          onClick={() => {
                            changeState('retrying');
                            setTimeout(() => changeState('failed'), 500);
                          }}
                        />
                        
                        <WorkflowStateTransition 
                          fromState="failed" 
                          toState="idle"
                          onClick={() => {
                            changeState('failed');
                            setTimeout(() => changeState('idle'), 500);
                          }}
                        />
                        
                        <WorkflowStateTransition 
                          fromState="paused" 
                          toState="running"
                          onClick={() => {
                            changeState('paused');
                            setTimeout(() => changeState('running'), 500);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-10 flex justify-center">
                    <Card className="p-6 max-w-md w-full">
                      <h3 className="text-base font-medium mb-4 text-center">Current State</h3>
                      <div className="flex justify-center mb-4">
                        <WorkflowStateIndicator 
                          state={currentState} 
                          previousState={previousState}
                          showLabel 
                          size="lg"
                          animate={true}
                        />
                      </div>
                      <p className="text-sm text-center text-muted-foreground">
                        Click on any transition above to see the animation
                      </p>
                    </Card>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-center mt-4">
                <Link href="/dashboard">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </GradientBackground>
  );
}