import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Brain, Database, Code, CheckSquare, Users, HelpCircle, ArrowRight, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface AgentBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAgent: (agent: any) => void;
}

export function AgentBuilder({ isOpen, onClose, onCreateAgent }: AgentBuilderProps) {
  const [activeTab, setActiveTab] = useState('configure');
  const [agentName, setAgentName] = useState('My Custom Agent');
  const [agentDescription, setAgentDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Agent capabilities settings
  const [temperature, setTemperature] = useState(0.7);
  const [canAccessWeb, setCanAccessWeb] = useState(true);
  const [canUseTools, setCanUseTools] = useState(true);
  const [canAccessDatabase, setCanAccessDatabase] = useState(true);
  const [maxTokens, setMaxTokens] = useState(2048);
  
  const handleCreateAgent = () => {
    setIsCreating(true);
    
    // Simulate agent creation delay
    setTimeout(() => {
      onCreateAgent({
        name: agentName,
        description: agentDescription,
        template: selectedTemplate,
        settings: {
          temperature,
          canAccessWeb,
          canUseTools,
          canAccessDatabase,
          maxTokens
        }
      });
      
      setIsCreating(false);
      onClose();
    }, 1500);
  };
  
  const agentTemplates = [
    {
      id: 'customer-service',
      name: 'Customer Service Agent',
      description: 'Helps respond to customer inquiries and resolve support tickets',
      icon: <Users className="h-10 w-10 text-blue-500" />,
      popular: true
    },
    {
      id: 'data-analyst',
      name: 'Data Analysis Agent',
      description: 'Analyzes data and generates insights and reports',
      icon: <Database className="h-10 w-10 text-green-500" />,
      new: true
    },
    {
      id: 'coding-assistant',
      name: 'Code Assistant',
      description: 'Helps write, review, and debug code across multiple languages',
      icon: <Code className="h-10 w-10 text-purple-500" />,
    },
    {
      id: 'task-automator',
      name: 'Task Automator',
      description: 'Automates routine tasks and workflows based on triggers',
      icon: <CheckSquare className="h-10 w-10 text-orange-500" />,
      popular: true
    },
    {
      id: 'custom',
      name: 'Custom Agent',
      description: 'Build a completely custom agent from scratch',
      icon: <Settings className="h-10 w-10 text-slate-500" />,
    }
  ];
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] p-0 max-h-[85vh] overflow-hidden">
        <DialogHeader className="pt-6 px-6 pb-2">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            Merlin Agent Builder
          </DialogTitle>
          <DialogDescription>
            Create AI agents that can perform tasks and make decisions automatically
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="configure">1. Configure Agent</TabsTrigger>
              <TabsTrigger value="connect">2. Connect Data Sources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="configure" className="pt-4 pb-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Agent Template</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agentTemplates.map(template => (
                      <Card 
                        key={template.id}
                        className={`border cursor-pointer transition-all hover:border-primary/50 ${
                          selectedTemplate === template.id ? 'ring-2 ring-primary border-primary' : ''
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <CardContent className="p-4 flex flex-col h-full">
                          <div className="mb-3 flex justify-between items-start">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary/10">
                              {template.icon}
                            </div>
                            <div className="flex flex-col items-end">
                              {template.popular && (
                                <Badge variant="secondary" className="mb-1">Popular</Badge>
                              )}
                              {template.new && (
                                <Badge className="bg-blue-500">New</Badge>
                              )}
                            </div>
                          </div>
                          <h4 className="font-medium text-lg mb-1">{template.name}</h4>
                          <p className="text-sm text-muted-foreground flex-grow">{template.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <div>
                    <Label htmlFor="agent-name">Agent Name</Label>
                    <Input 
                      id="agent-name" 
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      className="mt-1"
                      placeholder="Enter agent name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="agent-description">Description</Label>
                    <Textarea 
                      id="agent-description" 
                      value={agentDescription}
                      onChange={(e) => setAgentDescription(e.target.value)}
                      className="mt-1"
                      placeholder="What will this agent do?"
                      rows={3}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    Agent Capabilities
                    <HelpCircle className="h-4 w-4 text-muted-foreground ml-1" />
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="temperature">Temperature</Label>
                          <span className="text-sm text-muted-foreground">{temperature}</span>
                        </div>
                        <Slider
                          id="temperature"
                          min={0}
                          max={1}
                          step={0.1}
                          value={[temperature]}
                          onValueChange={(value) => setTemperature(value[0])}
                        />
                        <p className="text-xs text-muted-foreground">Controls creativity vs precision</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="max-tokens">Max Tokens</Label>
                          <span className="text-sm text-muted-foreground">{maxTokens}</span>
                        </div>
                        <Slider
                          id="max-tokens"
                          min={512}
                          max={4096}
                          step={512}
                          value={[maxTokens]}
                          onValueChange={(value) => setMaxTokens(value[0])}
                        />
                        <p className="text-xs text-muted-foreground">Maximum length of responses</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <Label htmlFor="web-access" className="mb-1">Web Access</Label>
                          <p className="text-xs text-muted-foreground">Allow agent to search the web</p>
                        </div>
                        <Switch 
                          id="web-access" 
                          checked={canAccessWeb}
                          onCheckedChange={setCanAccessWeb}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <Label htmlFor="tool-use" className="mb-1">Tool Use</Label>
                          <p className="text-xs text-muted-foreground">Allow agent to use external tools</p>
                        </div>
                        <Switch 
                          id="tool-use" 
                          checked={canUseTools}
                          onCheckedChange={setCanUseTools}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <Label htmlFor="database-access" className="mb-1">Database Access</Label>
                          <p className="text-xs text-muted-foreground">Allow agent to read/write database</p>
                        </div>
                        <Switch 
                          id="database-access" 
                          checked={canAccessDatabase}
                          onCheckedChange={setCanAccessDatabase}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={() => setActiveTab('connect')}>
                    Next: Connect Data
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="connect" className="pt-4 pb-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Knowledge Sources</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect data sources your agent can access to provide better responses
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Database
                        </CardTitle>
                        <CardDescription>
                          Allow the agent to query your database
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Connected</Badge>
                          <span className="text-sm text-muted-foreground">Using PostgreSQL database</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          Internal Documents
                        </CardTitle>
                        <CardDescription>
                          Add knowledge from your internal documents
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" className="mb-2">
                          + Add Document
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          No documents added yet
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          API Endpoints
                        </CardTitle>
                        <CardDescription>
                          Allow the agent to call custom API endpoints
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" className="mb-2">
                          + Add API
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          No API endpoints added yet
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Agent Governance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <Label htmlFor="content-filter" className="mb-1">Content Filtering</Label>
                        <p className="text-xs text-muted-foreground">Filter out harmful or inappropriate content</p>
                      </div>
                      <Switch 
                        id="content-filter" 
                        checked={true}
                        disabled
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <Label htmlFor="log-conversations" className="mb-1">Log Conversations</Label>
                        <p className="text-xs text-muted-foreground">Keep records of agent interactions</p>
                      </div>
                      <Switch 
                        id="log-conversations" 
                        checked={true}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <Label htmlFor="action-approval" className="mb-1">Require Action Approval</Label>
                        <p className="text-xs text-muted-foreground">Get approval before performing actions</p>
                      </div>
                      <Switch 
                        id="action-approval" 
                        checked={true}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setActiveTab('configure')}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleCreateAgent} 
                    disabled={isCreating}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isCreating ? 'Creating Agent...' : 'Create Agent'}
                    {!isCreating && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}