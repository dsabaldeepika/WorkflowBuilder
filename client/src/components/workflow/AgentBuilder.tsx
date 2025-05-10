import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, Sparkles, ArrowRight, Settings, Database, FileText, 
  MessageSquare, Code, Webhook, Shield, CheckCircle, AlertCircle, X, Stars
} from 'lucide-react';

// Agent accelerator templates
interface AgentTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  benefits: string[];
  type: string;
}

const agentTemplates: AgentTemplate[] = [
  {
    id: 'itsm-agent',
    title: 'ITSM Agent',
    description: 'Reduce IT workload and speed ticket resolution',
    icon: Bot,
    benefits: [
      'Automate common IT service requests',
      'Resolve common issues without human intervention',
      'Route complex tickets to the right team',
      'Generate reports on IT performance metrics'
    ],
    type: 'it'
  },
  {
    id: 'knowledge-agent',
    title: 'Knowledge Agent',
    description: 'Turn internal docs into AI-powered insights',
    icon: FileText,
    benefits: [
      'Answer questions from your internal documents',
      'Keep information up to date automatically',
      'Improve knowledge sharing across teams',
      'Reduce time spent searching for information'
    ],
    type: 'general'
  },
  {
    id: 'support-agent',
    title: 'Support Agent',
    description: 'Improve customer support with AI-driven workflows',
    icon: MessageSquare,
    benefits: [
      'Auto-respond to common customer queries',
      'Generate solutions based on support history',
      'Escalate complex issues to human agents',
      'Provide 24/7 customer support coverage'
    ],
    type: 'customer'
  },
  {
    id: 'data-agent',
    title: 'Data Processing Agent',
    description: 'Automate data workflows and transformations',
    icon: Database,
    benefits: [
      'Process and clean data automatically',
      'Transform data between different formats',
      'Trigger alerts on data anomalies',
      'Schedule regular data processing tasks'
    ],
    type: 'data'
  },
  {
    id: 'dev-agent',
    title: 'Developer Agent',
    description: 'Automate development workflows and tasks',
    icon: Code,
    benefits: [
      'Auto-generate code from specifications',
      'Review code for issues and best practices',
      'Automate testing and deployment workflows',
      'Manage documentation and code comments'
    ],
    type: 'dev'
  }
];

interface AgentBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAgent: (agentConfig: any) => void;
}

export function AgentBuilder({ isOpen, onClose, onCreateAgent }: AgentBuilderProps) {
  const [step, setStep] = useState<'template' | 'configure' | 'capabilities' | 'deploy'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  
  const resetState = () => {
    setStep('template');
    setSelectedTemplate(null);
    setAgentName('');
    setAgentDescription('');
    setIsAdvancedMode(false);
  };
  
  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const handleSelectTemplate = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setAgentName(`${template.title} ${new Date().toLocaleDateString()}`);
    setAgentDescription(template.description);
    setStep('configure');
  };
  
  const handleContinue = () => {
    if (step === 'configure') {
      setStep('capabilities');
    } else if (step === 'capabilities') {
      setStep('deploy');
    } else if (step === 'deploy') {
      // Create agent with configured settings
      onCreateAgent({
        name: agentName,
        description: agentDescription,
        template: selectedTemplate?.id,
        advanced: isAdvancedMode,
        // Add other configuration options here
      });
      handleClose();
    }
  };
  
  const handleBack = () => {
    if (step === 'configure') {
      setStep('template');
    } else if (step === 'capabilities') {
      setStep('configure');
    } else if (step === 'deploy') {
      setStep('capabilities');
    }
  };
  
  const renderTemplateSelection = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Choose an Agent Accelerator</h2>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="it">IT</TabsTrigger>
          <TabsTrigger value="customer">Customer Support</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="dev">Development</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[400px] mt-4 px-1">
          <div className="grid grid-cols-2 gap-4">
            {agentTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:border-primary hover:shadow-sm transition-all"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                      <template.icon size={20} />
                    </div>
                    {template.id === 'itsm-agent' && (
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                        <Stars className="h-3 w-3 mr-1 fill-purple-400 text-purple-400" />
                        New!
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base mt-2">{template.title}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-xs text-gray-500 space-y-1">
                    {template.benefits.slice(0, 2).map((benefit, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="h-3 w-3 mr-1 mt-0.5 text-green-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" className="w-full text-primary">
                    Select Template
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
  
  const renderConfigureAgent = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="h-10 w-10 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
          {selectedTemplate && <selectedTemplate.icon size={20} />}
        </div>
        <div>
          <h2 className="text-lg font-semibold">Configure {selectedTemplate?.title}</h2>
          <p className="text-sm text-gray-500">{selectedTemplate?.description}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="agentName">Agent Name</Label>
          <Input 
            id="agentName" 
            value={agentName} 
            onChange={(e) => setAgentName(e.target.value)} 
            placeholder="Enter a name for your agent"
          />
        </div>
        
        <div>
          <Label htmlFor="agentDescription">Description</Label>
          <Textarea 
            id="agentDescription" 
            value={agentDescription} 
            onChange={(e) => setAgentDescription(e.target.value)}
            placeholder="Describe what this agent will do"
            className="h-20"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="advancedMode" className="block">Advanced Configuration</Label>
            <p className="text-xs text-gray-500">Enable advanced settings for this agent</p>
          </div>
          <Switch 
            id="advancedMode" 
            checked={isAdvancedMode} 
            onCheckedChange={setIsAdvancedMode} 
          />
        </div>
        
        {isAdvancedMode && (
          <div className="space-y-4 p-4 border rounded-md bg-gray-50">
            <h3 className="text-sm font-medium">Advanced Settings</h3>
            
            <div>
              <Label htmlFor="model">AI Model</Label>
              <Select defaultValue="gpt4">
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt4">GPT-4</SelectItem>
                  <SelectItem value="gpt35">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude3">Anthropic Claude 3</SelectItem>
                  <SelectItem value="mixtral">Mixtral 8x7B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="maxTokens">Max Tokens</Label>
              <Input id="maxTokens" type="number" defaultValue="4096" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
  const renderCapabilities = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Configure Agent Capabilities</h2>
      <p className="text-sm text-gray-500">
        Select which capabilities your agent will have access to
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-md hover:border-primary hover:bg-blue-50 transition-colors">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-green-100 text-green-600 flex items-center justify-center mr-3">
              <Database size={16} />
            </div>
            <div>
              <h3 className="text-sm font-medium">Data Access</h3>
              <p className="text-xs text-gray-500">Access data sources and databases</p>
            </div>
          </div>
          <Switch defaultChecked />
        </div>
        
        <div className="flex items-center justify-between p-3 border rounded-md hover:border-primary hover:bg-blue-50 transition-colors">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center mr-3">
              <Webhook size={16} />
            </div>
            <div>
              <h3 className="text-sm font-medium">API Integration</h3>
              <p className="text-xs text-gray-500">Connect with external services via API</p>
            </div>
          </div>
          <Switch defaultChecked />
        </div>
        
        <div className="flex items-center justify-between p-3 border rounded-md hover:border-primary hover:bg-blue-50 transition-colors">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <Code size={16} />
            </div>
            <div>
              <h3 className="text-sm font-medium">Code Execution</h3>
              <p className="text-xs text-gray-500">Run code snippets and scripts</p>
            </div>
          </div>
          <Switch />
        </div>
        
        <div className="flex items-center justify-between p-3 border rounded-md hover:border-primary hover:bg-blue-50 transition-colors">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
              <Shield size={16} />
            </div>
            <div>
              <h3 className="text-sm font-medium">Security Controls</h3>
              <p className="text-xs text-gray-500">Enhanced security features and restrictions</p>
            </div>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  );
  
  const renderDeploy = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Ready to Deploy</h2>
      <div className="rounded-md bg-green-50 p-4 flex items-start">
        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
        <div>
          <p className="text-sm font-medium text-green-800">Your agent is ready to deploy</p>
          <p className="text-xs text-green-700 mt-1">
            The {selectedTemplate?.title} agent has been configured successfully. 
            Click "Deploy Agent" to launch it.
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
              {selectedTemplate && <selectedTemplate.icon size={20} />}
            </div>
            <div>
              <CardTitle className="text-base">{agentName}</CardTitle>
              <CardDescription>{agentDescription}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Template:</span>
              <span>{selectedTemplate?.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Mode:</span>
              <span>{isAdvancedMode ? 'Advanced' : 'Standard'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Capabilities:</span>
              <span>3 enabled</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="rounded-md bg-amber-50 p-4 flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
        <div>
          <p className="text-sm font-medium text-amber-800">Governance Note</p>
          <p className="text-xs text-amber-700 mt-1">
            This agent will be deployed with the security controls and governance settings
            configured in your Enterprise Core settings.
          </p>
        </div>
      </div>
    </div>
  );
  
  const renderStepContent = () => {
    switch (step) {
      case 'template':
        return renderTemplateSelection();
      case 'configure':
        return renderConfigureAgent();
      case 'capabilities':
        return renderCapabilities();
      case 'deploy':
        return renderDeploy();
      default:
        return null;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <DialogTitle>AI Agent Builder</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X size={18} />
            </Button>
          </div>
          <DialogDescription>
            Create autonomous AI agents to handle repetitive tasks and workflows
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto py-3">
          {renderStepContent()}
        </div>
        
        <DialogFooter className="flex justify-between items-center mt-4">
          {step !== 'template' ? (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          ) : (
            <div></div> // Empty div for spacing
          )}
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {step === 'template' ? (
              <div></div> // No continue button on template selection
            ) : step === 'deploy' ? (
              <Button onClick={handleContinue}>
                <Bot className="h-4 w-4 mr-2" />
                Deploy Agent
              </Button>
            ) : (
              <Button onClick={handleContinue}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}