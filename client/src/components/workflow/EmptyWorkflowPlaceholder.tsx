import React, { useState } from 'react';
import { PlusCircle, Clock, CalendarClock, Calendar, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type ScheduleFrequency, type ScheduleOptions } from './TriggerScheduleDialog';

interface EmptyWorkflowPlaceholderProps {
  onAddNodeClick: () => void;
  onScheduleChange?: (schedule: ScheduleOptions) => void;
  onCreateWorkflow?: (useSchedule: boolean) => void;
}

export const EmptyWorkflowPlaceholder: React.FC<EmptyWorkflowPlaceholderProps> = ({
  onAddNodeClick,
  onScheduleChange,
  onCreateWorkflow
}) => {
  const [frequency, setFrequency] = useState<ScheduleFrequency>('once');
  const [activeTab, setActiveTab] = useState<string>('trigger');
  
  const handleFrequencyChange = (value: string) => {
    setFrequency(value as ScheduleFrequency);
    if (onScheduleChange) {
      onScheduleChange({
        enabled: true,
        frequency: value as ScheduleFrequency,
        runCount: 0
      });
    }
  };
  
  const handleCreateWorkflow = (useSchedule: boolean) => {
    if (onCreateWorkflow) {
      onCreateWorkflow(useSchedule);
    } else {
      onAddNodeClick();
    }
  };
  
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Card className="w-[650px] shadow-xl border-primary/20">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Create a new workflow</CardTitle>
          <CardDescription>Start by selecting how you want to trigger your workflow</CardDescription>
        </CardHeader>
        
        <CardContent className="pb-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="trigger" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedule Trigger
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Manual Trigger
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="trigger">
              <div className="bg-blue-50 p-4 mb-4 rounded-md">
                <div className="flex items-start">
                  <CalendarClock className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    Choose how often this workflow should run. You can change this later in the workflow settings.
                  </p>
                </div>
              </div>
              
              <RadioGroup 
                value={frequency} 
                onValueChange={handleFrequencyChange}
                className="space-y-2"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="once" id="run-once" />
                    <Label htmlFor="run-once" className="flex-1 cursor-pointer">Run once</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="hourly" id="run-hourly" />
                    <Label htmlFor="run-hourly" className="flex-1 cursor-pointer">Run hourly</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="daily" id="run-daily" />
                    <Label htmlFor="run-daily" className="flex-1 cursor-pointer">Run daily</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="weekly" id="run-weekly" />
                    <Label htmlFor="run-weekly" className="flex-1 cursor-pointer">Run weekly</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="monthly" id="run-monthly" />
                    <Label htmlFor="run-monthly" className="flex-1 cursor-pointer">Run monthly</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="custom" id="run-custom" />
                    <Label htmlFor="run-custom" className="flex-1 cursor-pointer">Custom interval</Label>
                  </div>
                </div>
              </RadioGroup>
            </TabsContent>
            
            <TabsContent value="manual">
              <div className="p-8 text-center space-y-4">
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium">Manual Trigger</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  This workflow will only run when you manually trigger it. You can add automation steps after creating the workflow.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-4">
          <Button variant="outline" onClick={() => handleCreateWorkflow(false)}>
            Skip & Create Empty Workflow
          </Button>
          <Button onClick={() => handleCreateWorkflow(true)} className="bg-blue-500 hover:bg-blue-600">
            {activeTab === 'trigger' ? 'Create Scheduled Workflow' : 'Create Manual Workflow'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmptyWorkflowPlaceholder;