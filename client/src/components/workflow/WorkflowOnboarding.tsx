import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Info, CheckCircle, PlusCircle, Code, GitBranch, Clock } from 'lucide-react';

interface WorkflowOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWorkflow: (steps: OnboardingStep[]) => void;
}

export interface OnboardingStep {
  title: string;
  description: string;
  completed: boolean;
  type: 'trigger' | 'action' | 'conditional' | 'connection';
}

const WorkflowOnboarding: React.FC<WorkflowOnboardingProps> = ({
  isOpen,
  onClose,
  onStartWorkflow,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowName, setWorkflowName] = useState('My Workflow');
  const [workflowTrigger, setWorkflowTrigger] = useState('schedule');
  
  const steps = [
    {
      title: 'Name your workflow',
      content: (
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Choose a name for your workflow to identify it easily later.
          </p>
          <div className="space-y-2">
            <Label htmlFor="workflow-name">Workflow Name</Label>
            <Input 
              id="workflow-name" 
              value={workflowName} 
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="My Automated Workflow"
            />
          </div>
        </div>
      )
    },
    {
      title: 'Choose a trigger',
      content: (
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Select what will start your workflow.
          </p>
          <RadioGroup value={workflowTrigger} onValueChange={setWorkflowTrigger}>
            <div className="flex items-start space-x-2 rounded-md border p-3">
              <RadioGroupItem value="schedule" id="schedule" />
              <div className="flex flex-1 items-start gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="schedule" className="text-sm font-medium">Schedule</Label>
                  <p className="text-xs text-muted-foreground">Run workflow on a regular schedule</p>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-2 rounded-md border p-3">
              <RadioGroupItem value="webhook" id="webhook" />
              <div className="flex flex-1 items-start gap-2">
                <Code className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="webhook" className="text-sm font-medium">Webhook</Label>
                  <p className="text-xs text-muted-foreground">Trigger via API request</p>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-2 rounded-md border p-3">
              <RadioGroupItem value="manual" id="manual" />
              <div className="flex flex-1 items-start gap-2">
                <PlusCircle className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="manual" className="text-sm font-medium">Manual Trigger</Label>
                  <p className="text-xs text-muted-foreground">Start workflow manually</p>
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>
      )
    },
    {
      title: 'How to create a workflow',
      content: (
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Next, you'll be taken to the workflow editor. Follow these steps to create your workflow:
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border bg-background">
                1
              </div>
              <div>
                <p className="font-medium">Add nodes from the Node Picker</p>
                <p className="text-sm text-muted-foreground">Click the + button or empty canvas to add nodes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border bg-background">
                2
              </div>
              <div>
                <p className="font-medium">Configure each node</p>
                <p className="text-sm text-muted-foreground">Set up the required parameters for each node</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border bg-background">
                3
              </div>
              <div>
                <p className="font-medium">Connect the nodes</p>
                <p className="text-sm text-muted-foreground">Drag from one node's output to another node's input</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border bg-background">
                4
              </div>
              <div>
                <p className="font-medium">Save your workflow</p>
                <p className="text-sm text-muted-foreground">Click Save in the Actions menu to preserve your work</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
  ];
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Create onboarding steps to display in the workflow canvas
      const onboardingSteps: OnboardingStep[] = [
        {
          title: 'Add a trigger node',
          description: 'Start by adding a trigger node to your workflow',
          completed: false,
          type: 'trigger'
        },
        {
          title: 'Configure the trigger',
          description: 'Set up the parameters for your trigger node',
          completed: false,
          type: 'trigger'
        },
        {
          title: 'Add an action node',
          description: 'Now add an action node to process data',
          completed: false,
          type: 'action'
        },
        {
          title: 'Connect your nodes',
          description: 'Connect the trigger to the action',
          completed: false,
          type: 'connection'
        },
        {
          title: 'Save your workflow',
          description: 'Save your workflow to use it later',
          completed: false,
          type: 'action'
        }
      ];
      
      onStartWorkflow(onboardingSteps);
      onClose();
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{steps[currentStep].title}</DialogTitle>
        </DialogHeader>
        
        {steps[currentStep].content}
        
        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowOnboarding;