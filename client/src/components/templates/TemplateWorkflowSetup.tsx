import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { WorkflowTemplate } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { ArrowLeft, Check, Cog, ExternalLink, Info, Save, Workflow } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WorkflowCanvas } from '../workflow/WorkflowCanvas';

interface TemplateWorkflowSetupProps {
  templateId?: string | null;
}

export function TemplateWorkflowSetup({ templateId }: TemplateWorkflowSetupProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [credentialsComplete, setCredentialsComplete] = useState(false);
  
  const {
    loadWorkflowFromTemplate,
    saveWorkflow,
    nodes,
    edges
  } = useWorkflowStore();

  // Fetch template details
  const { data: template, isLoading: isTemplateLoading, error } = useQuery<WorkflowTemplate>({
    queryKey: ['/api/workflow/templates', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      return fetch(`/api/workflow/templates/${templateId}`).then(res => res.json());
    },
    enabled: !!templateId
  });

  useEffect(() => {
    // Set default workflow name and description from template
    if (template) {
      setWorkflowName(`${template.name} Workflow`);
      setWorkflowDescription(template.description || '');
      
      // Load workflow data from template
      if (template.nodes && template.edges) {
        try {
          const nodes = JSON.parse(template.nodes as string);
          const edges = JSON.parse(template.edges as string);
          loadWorkflowFromTemplate(nodes, edges);
          
          // Extract credential fields needed
          const requiredCredentials: Record<string, string> = {};
          nodes.forEach((node: any) => {
            if (node.data?.config) {
              Object.entries(node.data.config).forEach(([key, value]) => {
                if (typeof value === 'string' && value.includes('${')) {
                  // Extract the credential name from ${credential_name}
                  const match = value.match(/\${([^}]+)}/);
                  if (match && match[1]) {
                    requiredCredentials[match[1]] = '';
                  }
                }
              });
            }
          });
          
          setCredentials(requiredCredentials);
        } catch (error) {
          console.error('Error parsing template data:', error);
          toast({
            title: "Error loading template",
            description: "Failed to load the workflow template data.",
            variant: "destructive"
          });
        }
      }
    }
  }, [template, loadWorkflowFromTemplate, toast]);

  // Check if all credentials are filled
  useEffect(() => {
    const allFilled = Object.values(credentials).every(value => value.trim() !== '');
    setCredentialsComplete(allFilled);
  }, [credentials]);

  const handleCredentialChange = (key: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyCredentialsToWorkflow = () => {
    const updatedNodes = nodes.map(node => {
      if (!node.data?.config) return node;
      
      const updatedConfig = { ...node.data.config };
      
      Object.entries(updatedConfig).forEach(([key, value]) => {
        if (typeof value === 'string' && value.includes('${')) {
          // Replace all ${credential_name} with actual values
          Object.entries(credentials).forEach(([credKey, credValue]) => {
            const regex = new RegExp(`\\$\\{${credKey}\\}`, 'g');
            updatedConfig[key] = (updatedConfig[key] as string).replace(regex, credValue);
          });
        }
      });
      
      return {
        ...node,
        data: {
          ...node.data,
          config: updatedConfig
        }
      };
    });
    
    return updatedNodes;
  };

  const handleSaveWorkflow = async () => {
    setIsLoading(true);
    
    try {
      // Apply credentials to nodes before saving
      const updatedNodes = applyCredentialsToWorkflow();
      
      // Save workflow with updated nodes
      await saveWorkflow({
        name: workflowName,
        description: workflowDescription,
        nodes: updatedNodes, 
        edges
      });
      
      toast({
        title: "Workflow saved!",
        description: "Your customized workflow has been saved successfully.",
      });
      
      // Navigate to dashboard or workflows list
      navigate('/');
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: "Save failed",
        description: "There was a problem saving your workflow.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isTemplateLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3">Loading template...</span>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="container mx-auto p-8 text-center">
        <Alert variant="destructive" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load the template. It may not exist or there was a server error.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link to="/templates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Link>
        </Button>
      </div>
    );
  }

  // Parse node data for visualization
  const templateNodes = template.nodes ? JSON.parse(template.nodes as string) : [];
  const templateEdges = template.edges ? JSON.parse(template.edges as string) : [];

  return (
    <div className="container max-w-7xl mx-auto p-4 md:p-8">
      {/* Header with back button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            asChild 
            className="mb-4 md:mb-0"
          >
            <Link to="/templates">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Templates
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{template.name}</h1>
          <p className="text-gray-600 mt-2">{template.description}</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="default" 
            disabled={!credentialsComplete || isLoading}
            onClick={handleSaveWorkflow}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save & Activate
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Template metadata */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="secondary" className="capitalize">
          {template.category}
        </Badge>
        {template.tags?.map((tag, i) => (
          <Badge key={i} variant="outline">
            {tag}
          </Badge>
        ))}
        <Badge variant="secondary" className={
          template.complexity === 'simple' ? 'bg-green-100 text-green-800' :
          template.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }>
          {template.complexity} complexity
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cog className="h-5 w-5 mr-2" />
                Workflow Configuration
              </CardTitle>
              <CardDescription>
                Customize your workflow before saving
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workflowName">Workflow Name</Label>
                <Input 
                  id="workflowName"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="Enter a name for your workflow"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workflowDescription">Description</Label>
                <Input 
                  id="workflowDescription"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Enter a description"
                />
              </div>
              
              <Separator className="my-4" />
              
              {Object.keys(credentials).length > 0 ? (
                <>
                  <h3 className="text-md font-medium mb-2">Required Credentials</h3>
                  
                  <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Credentials Required</AlertTitle>
                    <AlertDescription>
                      This workflow requires the following credentials to function properly.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4">
                    {Object.entries(credentials).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={`credential-${key}`} className="flex items-center">
                          {key.replace(/_/g, ' ')}
                          {value.trim() !== '' && (
                            <Check className="h-4 w-4 ml-2 text-green-500" />
                          )}
                        </Label>
                        <Input
                          id={`credential-${key}`}
                          value={value}
                          onChange={(e) => handleCredentialChange(key, e.target.value)}
                          placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                          type={key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('password') ? 'password' : 'text'}
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <Check className="h-4 w-4" />
                  <AlertTitle>No Credentials Required</AlertTitle>
                  <AlertDescription>
                    This workflow doesn't require any credentials and is ready to use.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                disabled={!credentialsComplete || isLoading}
                onClick={handleSaveWorkflow}
              >
                {!credentialsComplete ? 'Fill in all credentials to continue' : 'Save & Activate Workflow'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Workflow className="h-5 w-5 mr-2" />
                Workflow Components
              </CardTitle>
              <CardDescription>
                This workflow contains {templateNodes.length} nodes and {templateEdges.length} connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {templateNodes.map((node: any, index: number) => (
                  <AccordionItem key={index} value={`node-${index}`}>
                    <AccordionTrigger className="text-sm font-medium">
                      {node.data?.label || node.id}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm space-y-2 text-muted-foreground">
                        <div><span className="font-medium text-foreground">Type:</span> {node.type}</div>
                        {node.data?.service && (
                          <div><span className="font-medium text-foreground">Service:</span> {node.data.service}</div>
                        )}
                        {node.data?.event && (
                          <div><span className="font-medium text-foreground">Event:</span> {node.data.event}</div>
                        )}
                        {node.data?.action && (
                          <div><span className="font-medium text-foreground">Action:</span> {node.data.action}</div>
                        )}
                        {node.data?.config && Object.keys(node.data.config).length > 0 && (
                          <div>
                            <span className="font-medium text-foreground">Configuration:</span>
                            <ul className="pl-4 mt-1 space-y-1">
                              {Object.entries(node.data.config).map(([key, value], i) => (
                                <li key={i}>
                                  {key}: {typeof value === 'string' && value.includes('${') ? (
                                    <span className="text-amber-600">(Requires credential)</span>
                                  ) : (
                                    <span className="text-gray-600">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column: Workflow Canvas */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-lg">Workflow Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-0 relative">
              <div className="absolute inset-0">
                <WorkflowCanvas readOnly={true} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}