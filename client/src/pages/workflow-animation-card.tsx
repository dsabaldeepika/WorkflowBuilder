import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkflowStateIndicator, WorkflowState, useWorkflowState } from '@/components/workflow/StateChangeAnimation';
import { motion } from 'framer-motion';
import { Play, Pause, Zap, Clock, RefreshCw } from 'lucide-react';

interface WorkflowData {
  id: number;
  name: string;
  description: string;
  state: WorkflowState;
  lastRun?: string;
  nextRun?: string;
  type: string;
  runCount: number;
}

/**
 * WorkflowAnimationCard Component
 * 
 * This component displays a workflow card with state indicator animations.
 * It can be used in various parts of the application to display workflow status.
 */
export default function WorkflowAnimationCard({ 
  workflow, 
  showControls = true,
  animate = false,
  className = ''
}: { 
  workflow: WorkflowData;
  showControls?: boolean;
  animate?: boolean;
  className?: string;
}) {
  const { currentState, previousState, changeState } = useWorkflowState(workflow.state);
  
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">{workflow.name}</CardTitle>
          <WorkflowStateIndicator 
            state={animate ? currentState : workflow.state} 
            previousState={animate ? previousState : undefined}
            size="sm"
            animate={animate}
          />
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
        
        {showControls && animate && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => changeState('idle')}
              className="flex-1"
            >
              <Clock className="h-3.5 w-3.5 mr-1" /> Idle
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => changeState('starting')}
              className="flex-1"
            >
              <Play className="h-3.5 w-3.5 mr-1" /> Start
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => changeState('running')}
              className="flex-1"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Run
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => changeState('paused')}
              className="flex-1"
            >
              <Pause className="h-3.5 w-3.5 mr-1" /> Pause
            </Button>
          </div>
        )}
        
        {showControls && !animate && (
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm">Edit</Button>
            <Button size="sm">Run</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * QuickActionCard Component
 * 
 * A card for showing quick actions in the dashboard with animated hover effects
 */
export function QuickActionCard({
  title,
  description,
  icon,
  buttonText,
  buttonAction,
  buttonVariant = "outline"
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  buttonAction: () => void;
  buttonVariant?: "default" | "outline" | "secondary";
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <motion.div 
          className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {icon}
        </motion.div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-muted-foreground text-sm mt-1 mb-4">{description}</p>
        <Button className="w-full" variant={buttonVariant} onClick={buttonAction}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}