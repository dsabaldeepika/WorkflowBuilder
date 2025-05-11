import React, { useState } from 'react';
import { PlusCircle, Clock, CalendarClock, Calendar, ArrowRight, Zap, Sparkles, Wand2, SplitSquareVertical, ArrowLeftRight, Gift, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type ScheduleFrequency, type ScheduleOptions } from './TriggerScheduleDialog';
import { AiAssistPanel } from '../dashboard/AiAssistPanel';

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
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  
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
  
  const handleAiGenerate = (prompt: string) => {
    // Convert the AI prompt to a workflow
    setShowAiAssistant(false);
    
    // Create a default scheduled workflow
    if (onScheduleChange) {
      onScheduleChange({
        enabled: true,
        frequency: 'daily',
        runCount: 0
      });
    }
    
    // Then open the node picker to continue building
    if (onCreateWorkflow) {
      onCreateWorkflow(true);
    }
  };
  
  // Define workflow creation methods
  const createMethods = [
    {
      id: 'visual',
      title: 'Visual Builder',
      icon: <SplitSquareVertical className="h-10 w-10 text-blue-500" />,
      description: 'Drag-and-drop nodes to create your workflow visually',
      buttonText: 'Start Building',
      action: () => setActiveTab('trigger')
    },
    {
      id: 'ai',
      title: 'AI Assistant',
      icon: <Brain className="h-10 w-10 text-purple-500" />,
      description: 'Describe what you want to build and let AI create it for you',
      buttonText: 'Use AI Assistant',
      action: () => setShowAiAssistant(true)
    },
    {
      id: 'template',
      title: 'Templates',
      icon: <Gift className="h-10 w-10 text-green-500" />,
      description: 'Choose from pre-built templates for common use cases',
      buttonText: 'Browse Templates',
      action: () => window.location.href = '/templates'
    }
  ];
  
  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-transparent to-blue-50/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl p-6"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl"></div>
              <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-700 to-purple-700 text-transparent bg-clip-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Create Your Workflow
          </motion.h1>
          <motion.p 
            className="text-lg text-slate-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            PumpFlux helps you connect your apps and automate tasks without coding
          </motion.p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {createMethods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + (index * 0.1) }}
            >
              <Card className="h-full bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-300 border-primary/10 overflow-hidden group">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="mb-4">
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-slate-100 group-hover:bg-blue-50 transition-colors duration-300">
                      {method.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                  <p className="text-slate-500 mb-6 flex-grow">{method.description}</p>
                  <Button 
                    onClick={method.action} 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    {method.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        {activeTab === 'trigger' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-xl border-primary/20 bg-white">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Configure Your Trigger</CardTitle>
                <CardDescription>
                  A trigger is what starts your workflow. Choose when you want it to run.
                </CardDescription>
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
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 mb-4 rounded-md">
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
                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/50 cursor-pointer group">
                          <RadioGroupItem value="once" id="run-once" />
                          <Label htmlFor="run-once" className="flex-1 cursor-pointer group-hover:text-blue-700">Run once</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/50 cursor-pointer group">
                          <RadioGroupItem value="hourly" id="run-hourly" />
                          <Label htmlFor="run-hourly" className="flex-1 cursor-pointer group-hover:text-blue-700">Run hourly</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/50 cursor-pointer group">
                          <RadioGroupItem value="daily" id="run-daily" />
                          <Label htmlFor="run-daily" className="flex-1 cursor-pointer group-hover:text-blue-700">Run daily</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/50 cursor-pointer group">
                          <RadioGroupItem value="weekly" id="run-weekly" />
                          <Label htmlFor="run-weekly" className="flex-1 cursor-pointer group-hover:text-blue-700">Run weekly</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/50 cursor-pointer group">
                          <RadioGroupItem value="monthly" id="run-monthly" />
                          <Label htmlFor="run-monthly" className="flex-1 cursor-pointer group-hover:text-blue-700">Run monthly</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/50 cursor-pointer group">
                          <RadioGroupItem value="custom" id="run-custom" />
                          <Label htmlFor="run-custom" className="flex-1 cursor-pointer group-hover:text-blue-700">Custom interval</Label>
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
                <Button 
                  onClick={() => handleCreateWorkflow(true)} 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  {activeTab === 'trigger' ? 'Create Scheduled Workflow' : 'Create Manual Workflow'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </motion.div>
      
      {/* AI Assistant Panel */}
      <AiAssistPanel
        isOpen={showAiAssistant}
        onClose={() => setShowAiAssistant(false)}
        onGenerateWorkflow={handleAiGenerate}
      />
    </div>
  );
};

export default EmptyWorkflowPlaceholder;