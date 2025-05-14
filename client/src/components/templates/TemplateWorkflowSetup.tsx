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
import { 
  ArrowLeft, 
  Check, 
  Cog, 
  ExternalLink, 
  Info, 
  Save, 
  Workflow, 
  MessageCircle, 
  LifeBuoy,
  HelpCircle, 
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { InlineWorkflowLoading } from '@/components/workflow/InlineWorkflowLoading';
// Import template preview images
import defaultTemplatePreview from "@/assets/templates/workflow-template-placeholder.svg";
import facebookToHubspotPreview from "@/assets/templates/facebook-lead-to-hubspot.svg";
import customerFollowUpPreview from "@/assets/templates/customer-follow-up.svg";
import pipedriveToGoogleSheetsPreview from "@/assets/templates/pipedrive-to-googlesheets.svg";
import { TemplateIntegrationGuide } from './TemplateIntegrationGuide';
// Import integration components
import { ConnectionManager } from '@/components/integration/ConnectionManager';
import { GoogleSheetsConnector } from '@/components/integration/GoogleSheetsConnector';
// Import integration icons
import { 
  SiGooglesheets, 
  SiHubspot, 
  SiFacebook, 
  SiClickup, 
  SiTrello, 
  SiSalesforce, 
  SiMailchimp, 
  SiAirtable,
  SiSlack,
  SiGmail
} from 'react-icons/si';
import { Layers } from 'lucide-react';

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
  
  // Function to get appropriate preview image based on template name and ID
  const getTemplatePreviewImage = (template: WorkflowTemplate) => {
    // Match template with preview image based on ID or name
    
    // Special case matching for template ID 13 (Pipedrive to Google Sheets)
    if (template.id === 13 || 
        (template.name && (
          template.name.toLowerCase().includes('pipedrive') || 
          (template.name.toLowerCase().includes('google') && template.name.toLowerCase().includes('sheet'))
        ))
    ) {
      return pipedriveToGoogleSheetsPreview;
    }
    
    // Match by keywords in template name
    const templateName = template.name.toLowerCase();
    
    if (templateName.includes('facebook') && (templateName.includes('hubspot') || templateName.includes('lead'))) {
      return facebookToHubspotPreview;
    } else if (templateName.includes('customer') && templateName.includes('follow')) {
      return customerFollowUpPreview;
    }
    
    // Default placeholder for any other templates
    return defaultTemplatePreview;
  };

  // Fetch template details
  const { data: template, isLoading: isTemplateLoading, error } = useQuery<WorkflowTemplate>({
    queryKey: ['/api/workflow/templates', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const res = await fetch(`/api/workflow/templates/${templateId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch template: ${res.statusText}`);
      }
      return res.json();
    },
    enabled: !!templateId
  });

  // Extract template nodes and edges
  const templateNodes = template?.nodes 
    ? (typeof template.nodes === 'string' ? JSON.parse(template.nodes) : template.nodes) 
    : [];
    
  const templateEdges = template?.edges 
    ? (typeof template.edges === 'string' ? JSON.parse(template.edges) : template.edges) 
    : [];

  // Extract required credentials from the template
  useEffect(() => {
    if (template) {
      // Prepare workflow name using template name as a base
      setWorkflowName(`${template.name} Workflow`);
      setWorkflowDescription(template.description || '');
      
      // Load the workflow data into the store (for the canvas preview)
      if (template.nodes && template.edges) {
        try {
          const parsedNodes = typeof template.nodes === 'string' ? JSON.parse(template.nodes) : template.nodes;
          const parsedEdges = typeof template.edges === 'string' ? JSON.parse(template.edges) : template.edges;
          loadWorkflowFromTemplate(parsedNodes, parsedEdges);
        } catch (err) {
          console.error('Error loading workflow template:', err);
        }
      }
      
      // Extract required credentials from node configs
      const extractedCredentials: Record<string, string> = {};
      
      // Process nodes to find all credential placeholders
      const processNodes = (nodes: any[]) => {
        return nodes.map(node => {
          if (!node.data?.config) return node;
          
          // Check if config contains credential placeholders
          Object.entries(node.data.config).forEach(([key, value]) => {
            if (typeof value === 'string' && value.includes('${')) {
              // Extract credential name from placeholder pattern ${CREDENTIAL_NAME}
              const match = value.match(/\${([^}]+)}/);
              if (match && match[1]) {
                const credentialName = match[1];
                // Add to credentials if not already present
                if (!extractedCredentials[credentialName]) {
                  extractedCredentials[credentialName] = '';
                }
              }
            }
          });
          
          return node;
        });
      };
      
      // Extract credentials
      const updatedNodes = processNodes(templateNodes);
      
      // Set the extracted credentials
      setCredentials(extractedCredentials);
      
      // Check if credentials are complete (no credentials needed = complete)
      setCredentialsComplete(Object.keys(extractedCredentials).length === 0);
    }
  }, [template, loadWorkflowFromTemplate]);
  
  // Update credentialsComplete status whenever credentials change
  useEffect(() => {
    const allFilled = Object.values(credentials).every(val => val.trim() !== '');
    setCredentialsComplete(Object.keys(credentials).length === 0 || allFilled);
  }, [credentials]);
  
  // Handle credential input changes
  const handleCredentialChange = (key: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handle workflow saving
  const handleSaveWorkflow = async () => {
    if (!template) return;
    
    setIsLoading(true);
    
    try {
      // Save the workflow
      // Prepare nodes with credential values
      const nodesWithCredentials = nodes.map(node => {
        if (!node.data?.config) return node;
        
        // Replace credential placeholders with actual values
        const updatedConfig = { ...node.data.config };
        Object.entries(updatedConfig).forEach(([key, value]) => {
          if (typeof value === 'string' && value.includes('${')) {
            // Find and replace all credential placeholders
            Object.entries(credentials).forEach(([credKey, credValue]) => {
              const placeholder = `\${${credKey}}`;
              if (value.includes(placeholder)) {
                updatedConfig[key] = value.replace(placeholder, credValue);
              }
            });
          }
        });
        
        // Return node with updated config
        return {
          ...node,
          data: {
            ...node.data,
            config: updatedConfig
          }
        };
      });
      
      const savedWorkflow = await saveWorkflow({
        name: workflowName,
        description: workflowDescription,
        nodes: nodesWithCredentials,
        edges: edges
      });
      
      toast({
        title: "Workflow created successfully",
        description: "Your new workflow is ready to use.",
      });
      
      // Navigate to the workflow builder
      navigate('/workflows');
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: "Failed to create workflow",
        description: "There was an error creating your workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate progress percentage for progress bar
  const calculateProgress = () => {
    let progress = 30; // Start with 30% for viewing the template
    
    if (workflowName.trim().length > 0) {
      progress += 20; // Add 20% for naming the workflow
    }
    
    if (credentialsComplete) {
      progress += 50; // Add remaining 50% when credentials are complete
    } else if (Object.keys(credentials).length > 0) {
      // Calculate partial progress based on filled credentials
      const filledCount = Object.values(credentials).filter(v => v.trim().length > 0).length;
      const totalCount = Object.keys(credentials).length;
      if (totalCount > 0) {
        progress += Math.floor((filledCount / totalCount) * 40); // Up to 40% for partial credential completion
      }
    } else {
      // No credentials required, so add the full 50%
      progress += 50;
    }
    
    return Math.min(progress, 100); // Cap at 100%
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      {/* Hero header with template info */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto py-10 px-4">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/templates')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Button>
          </div>
          
          {/* Loading, Error, or Template Not Found States */}
          {isTemplateLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  ease: "linear",
                  repeat: Infinity
                }}
                className="mb-4"
              >
                <Workflow className="h-16 w-16 text-white" />
              </motion.div>
              <InlineWorkflowLoading 
                size="lg" 
                text="Loading automation template" 
                variant="default"
                className="bg-white/20 text-white" 
              />
            </div>
          ) : error ? (
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-lg text-center max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-white mb-2">Failed to load template</h2>
              <p className="text-blue-100 mb-4">We encountered an error while loading the template details. Please try again.</p>
              <Button onClick={() => navigate('/templates')} variant="outline" className="border-white/30 text-white hover:bg-white/20">
                Return to Templates
              </Button>
            </div>
          ) : !template ? (
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-lg text-center max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-white mb-2">Template not found</h2>
              <p className="text-blue-100 mb-4">We couldn't find the template you're looking for. Please select another template.</p>
              <Button onClick={() => navigate('/templates')} variant="outline" className="border-white/30 text-white hover:bg-white/20">
                Browse Templates
              </Button>
            </div>
          ) : (
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                {template.name}
              </h1>
              <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
                {template.description}
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {template.tags?.map((tag, i) => (
                  <Badge key={i} className="bg-white/20 hover:bg-white/30 text-white border-none">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      {template && !isTemplateLoading && !error && (
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Setup progress indicator */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">Setup Progress</h2>
                <Badge className={credentialsComplete ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                  {credentialsComplete ? "Ready to Launch" : "Configuration Needed"}
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column: Workflow visualization */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                <div className="mb-8">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Workflow Visualization</h2>
                      <p className="text-gray-600 mb-6">See how data flows between services in this automation</p>
                      
                      <div className="bg-white rounded-lg border border-gray-100 shadow-inner p-6 flex flex-col justify-center items-center">
                        <img 
                          src={template.coverImage || getTemplatePreviewImage(template)}
                          alt={`${template.name} workflow preview`}
                          className="max-w-full object-contain rounded mb-6"
                          style={{ maxHeight: '320px' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = defaultTemplatePreview;
                          }}
                        />
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                              <span className="text-sm text-gray-600">Trigger</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                              <span className="text-sm text-gray-600">Action</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                              <span className="text-sm text-gray-600">Logic</span>
                            </div>
                          </div>
                          <p className="text-gray-600">
                            <span className="font-semibold">{templateNodes.length} nodes</span> · <span className="font-semibold">{templateEdges.length} connections</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 border-t border-gray-100">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">How It Works</h3>
                      <div className="space-y-6">
                        {templateNodes.map((node: any, index: number) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{node.data?.label || node.id}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {node.data?.service && `Service: ${node.data.service}`}
                                {node.data?.event && ` • Event: ${node.data.event}`}
                                {node.data?.action && ` • Action: ${node.data.action}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Component Details</h2>
                    <p className="text-gray-600 mb-6">Technical details of each workflow component</p>
                    
                    <Accordion type="single" collapsible className="w-full">
                      {templateNodes.map((node: any, index: number) => (
                        <AccordionItem key={index} value={`node-${index}`} className="border-b border-gray-100">
                          <AccordionTrigger className="py-4 text-gray-800 hover:text-indigo-600 hover:no-underline">
                            {node.data?.label || node.id}
                          </AccordionTrigger>
                          <AccordionContent className="bg-gray-50 p-4 rounded-lg">
                            <div className="space-y-3 text-sm">
                              <div className="flex">
                                <span className="font-medium w-32 text-gray-700">Type:</span> 
                                <span className="text-gray-600">{node.type}</span>
                              </div>
                              {node.data?.service && (
                                <div className="flex">
                                  <span className="font-medium w-32 text-gray-700">Service:</span> 
                                  <span className="text-gray-600">{node.data.service}</span>
                                </div>
                              )}
                              {node.data?.event && (
                                <div className="flex">
                                  <span className="font-medium w-32 text-gray-700">Event:</span> 
                                  <span className="text-gray-600">{node.data.event}</span>
                                </div>
                              )}
                              {node.data?.action && (
                                <div className="flex">
                                  <span className="font-medium w-32 text-gray-700">Action:</span> 
                                  <span className="text-gray-600">{node.data.action}</span>
                                </div>
                              )}
                              
                              {node.data?.config && Object.keys(node.data.config).length > 0 && (
                                <div>
                                  <span className="font-medium text-gray-700 block mb-2">Configuration:</span>
                                  <div className="bg-white p-3 border border-gray-200 rounded-md">
                                    <ul className="space-y-2">
                                      {Object.entries(node.data.config).map(([key, value], i) => (
                                        <li key={i} className="flex flex-wrap">
                                          <span className="font-medium text-gray-700 mr-2">{key}:</span>
                                          {typeof value === 'string' && value.includes('${') ? (
                                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                                              Requires credential
                                            </Badge>
                                          ) : (
                                            <code className="text-xs bg-gray-100 p-1 rounded text-gray-700">
                                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                            </code>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              </div>
              
              {/* Right column: Configuration form */}
              <div className="order-1 lg:order-2">
                <div className="sticky top-4 space-y-6">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-800 mb-4">Setup Your Workflow</h2>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="workflow-name" className="text-gray-700">Workflow Name</Label>
                          <Input
                            id="workflow-name"
                            value={workflowName}
                            onChange={(e) => setWorkflowName(e.target.value)}
                            placeholder="Enter workflow name"
                            className="mt-1 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="workflow-description" className="text-gray-700">Description (optional)</Label>
                          <Input
                            id="workflow-description"
                            value={workflowDescription}
                            onChange={(e) => setWorkflowDescription(e.target.value)}
                            placeholder="Enter workflow description"
                            className="mt-1 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                          Connection Details
                        </h2>
                        <Badge className={Object.keys(credentials).length > 0 ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}>
                          {Object.keys(credentials).length > 0 ? "Connections Needed" : "No Connections Required"}
                        </Badge>
                      </div>
                      
                      {Object.keys(credentials).length > 0 ? (
                        <>
                          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded mb-6">
                            <h3 className="text-indigo-800 font-medium mb-1 flex items-center">
                              <Info className="h-4 w-4 mr-2" />
                              Service Connections
                            </h3>
                            <p className="text-sm text-indigo-700">
                              Configure connections to external services required for this workflow
                            </p>
                          </div>
                          
                          {/* Google Sheets specific connection UI */}
                          {templateNodes.some(node => 
                            node.data?.service === 'google-sheets' || 
                            (node.type === 'action' && node.data?.service?.includes('google')) ||
                            Object.keys(credentials).some(key => 
                              key.includes('spreadsheet') || 
                              key.includes('sheet_')
                            )
                          ) && (
                            <div className="mb-6 p-4 border rounded-md bg-green-50/30">
                              <div className="flex items-center mb-4">
                                <SiGooglesheets className="h-5 w-5 text-green-600 mr-2" />
                                <h3 className="text-lg font-medium">Google Sheets Integration</h3>
                              </div>
                              
                              <GoogleSheetsConnector 
                                initialSpreadsheetId={credentials['spreadsheet_id'] || ''} 
                                initialSheetName={credentials['sheet_name'] || ''}
                                initialAction={Object.keys(credentials).some(key => key.includes('append')) ? 'append_row' : 'get_values'}
                                onConfigurationComplete={(config) => {
                                  // Update all Google Sheets related credentials
                                  handleCredentialChange('spreadsheet_id', config.spreadsheetId);
                                  handleCredentialChange('sheet_name', config.sheetName);
                                  
                                  if (config.range) {
                                    handleCredentialChange('range', config.range);
                                  }
                                }}
                              />
                            </div>
                          )}
                          
                          {/* Facebook specific connection UI */}
                          {templateNodes.some(node => 
                            node.data?.service === 'facebook' || 
                            Object.keys(credentials).some(key => 
                              key.includes('facebook') || 
                              key.includes('fb_') || 
                              key.includes('form_id')
                            )
                          ) && (
                            <div className="mb-6 p-4 border rounded-md bg-blue-50/30">
                              <div className="flex items-center mb-4">
                                <SiFacebook className="h-5 w-5 text-blue-600 mr-2" />
                                <h3 className="text-lg font-medium">Facebook Integration</h3>
                              </div>
                              
                              <div className="space-y-4">
                                <ConnectionManager 
                                  service="facebook"
                                  requiredFields={{
                                    app_id: '',
                                    app_secret: '',
                                    access_token: ''
                                  }}
                                  enableCreate={true}
                                />
                                
                                {/* Additional Facebook-specific configuration */}
                                {Object.entries(credentials).filter(([key]) => 
                                  key.includes('form_id') || 
                                  key.includes('page_id') ||
                                  key.includes('ad_account')
                                ).map(([key, value]) => (
                                  <div key={key} className="mt-4">
                                    <Label htmlFor={`fb-${key}`} className="capitalize flex items-center">
                                      {key.replace(/_/g, ' ')}
                                      {key.includes('form_id') && 
                                        <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">Required</span>
                                      }
                                    </Label>
                                    <Input
                                      id={`fb-${key}`}
                                      value={value}
                                      onChange={(e) => handleCredentialChange(key, e.target.value)}
                                      placeholder={`Enter your ${key.replace(/_/g, ' ')}`}
                                      className="mt-1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      {key.includes('form_id') 
                                        ? "The ID of your Facebook Lead Form" 
                                        : key.includes('page_id')
                                        ? "The ID of your Facebook Page"
                                        : "Required to connect to this Facebook resource"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* HubSpot specific connection UI */}
                          {templateNodes.some(node => 
                            node.data?.service === 'hubspot' || 
                            Object.keys(credentials).some(key => 
                              key.includes('hubspot') || 
                              key.includes('deal_id') ||
                              key.includes('contact_id')
                            )
                          ) && (
                            <div className="mb-6 p-4 border rounded-md bg-orange-50/30">
                              <div className="flex items-center mb-4">
                                <SiHubspot className="h-5 w-5 text-orange-600 mr-2" />
                                <h3 className="text-lg font-medium">HubSpot Integration</h3>
                              </div>
                              
                              <div className="space-y-4">
                                <ConnectionManager 
                                  service="hubspot"
                                  requiredFields={{
                                    api_key: ''
                                  }}
                                  enableCreate={true}
                                />
                                
                                {/* Additional HubSpot-specific configuration */}
                                {Object.entries(credentials).filter(([key]) => 
                                  key.includes('deal_id') || 
                                  key.includes('contact_id') ||
                                  key.includes('form_id') ||
                                  key.includes('hubspot_')
                                ).map(([key, value]) => (
                                  <div key={key} className="mt-4">
                                    <Label htmlFor={`hubspot-${key}`} className="capitalize flex items-center">
                                      {key.replace(/_/g, ' ')}
                                    </Label>
                                    <Input
                                      id={`hubspot-${key}`}
                                      value={value}
                                      onChange={(e) => handleCredentialChange(key, e.target.value)}
                                      placeholder={`Enter your ${key.replace(/_/g, ' ')}`}
                                      className="mt-1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      {key.includes('deal_id') 
                                        ? "The HubSpot Deal ID to monitor or update" 
                                        : key.includes('contact_id')
                                        ? "The HubSpot Contact ID to use"
                                        : key.includes('form_id')
                                        ? "The ID of your HubSpot form"
                                        : "Required for the HubSpot integration"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Slack specific connection UI */}
                          {templateNodes.some(node => 
                            node.data?.service === 'slack' || 
                            Object.keys(credentials).some(key => 
                              key.includes('slack')
                            )
                          ) && (
                            <div className="mb-6 p-4 border rounded-md bg-purple-50/30">
                              <div className="flex items-center mb-4">
                                <SiSlack className="h-5 w-5 text-purple-600 mr-2" />
                                <h3 className="text-lg font-medium">Slack Integration</h3>
                              </div>
                              
                              <div className="space-y-4">
                                <ConnectionManager 
                                  service="slack"
                                  requiredFields={{
                                    webhook_url: '',
                                    bot_token: ''
                                  }}
                                  enableCreate={true}
                                />
                                
                                {/* Additional Slack-specific configuration */}
                                {Object.entries(credentials).filter(([key]) => 
                                  key.includes('channel') || 
                                  key.includes('slack_')
                                ).map(([key, value]) => (
                                  <div key={key} className="mt-4">
                                    <Label htmlFor={`slack-${key}`} className="capitalize flex items-center">
                                      {key.replace(/_/g, ' ')}
                                    </Label>
                                    <Input
                                      id={`slack-${key}`}
                                      value={value}
                                      onChange={(e) => handleCredentialChange(key, e.target.value)}
                                      placeholder={`Enter your ${key.replace(/_/g, ' ')}`}
                                      className="mt-1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      {key.includes('channel') 
                                        ? "The Slack channel to send messages to (e.g. #general)" 
                                        : "Required for the Slack integration"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Pipedrive specific connection UI */}
                          {templateNodes.some(node => 
                            node.data?.service === 'pipedrive' || 
                            Object.keys(credentials).some(key => 
                              key.includes('pipedrive') || 
                              key.includes('deal_id')
                            )
                          ) && (
                            <div className="mb-6 p-4 border rounded-md bg-green-50/30">
                              <div className="flex items-center mb-4">
                                <Layers className="h-5 w-5 text-green-600 mr-2" />
                                <h3 className="text-lg font-medium">Pipedrive Integration</h3>
                              </div>
                              
                              <div className="space-y-4">
                                <ConnectionManager 
                                  service="pipedrive"
                                  requiredFields={{
                                    api_token: ''
                                  }}
                                  enableCreate={true}
                                />
                                
                                {/* Additional Pipedrive-specific configuration */}
                                {Object.entries(credentials).filter(([key]) => 
                                  key.includes('pipedrive_') || 
                                  key.includes('deal_id') ||
                                  key.includes('person_id') ||
                                  key.includes('org_id')
                                ).map(([key, value]) => (
                                  <div key={key} className="mt-4">
                                    <Label htmlFor={`pipedrive-${key}`} className="capitalize flex items-center">
                                      {key.replace(/_/g, ' ')}
                                    </Label>
                                    <Input
                                      id={`pipedrive-${key}`}
                                      value={value}
                                      onChange={(e) => handleCredentialChange(key, e.target.value)}
                                      placeholder={`Enter your ${key.replace(/_/g, ' ')}`}
                                      className="mt-1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      {key.includes('deal_id') 
                                        ? "The Pipedrive Deal ID to use" 
                                        : key.includes('person_id')
                                        ? "The Pipedrive Person ID to use"
                                        : "Required for the Pipedrive integration"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Generic credentials */}
                          {Object.entries(credentials).filter(([key]) => 
                            !key.includes('spreadsheet') && 
                            !key.includes('sheet_') && 
                            !key.includes('facebook') && 
                            !key.includes('fb_') && 
                            !key.includes('form_id') &&
                            !key.includes('hubspot') && 
                            !key.includes('slack') &&
                            !key.includes('pipedrive') &&
                            !key.includes('deal_id') &&
                            !key.includes('contact_id') &&
                            !key.includes('channel') &&
                            !key.includes('person_id') &&
                            !key.includes('org_id')
                          ).length > 0 && (
                            <div className="space-y-6 p-4 border rounded-md">
                              <h3 className="text-lg font-medium flex items-center">
                                <Cog className="h-5 w-5 mr-2 text-gray-600" /> 
                                Additional Configuration
                              </h3>
                              
                              {Object.entries(credentials).filter(([key]) => 
                                !key.includes('spreadsheet') && 
                                !key.includes('sheet_') && 
                                !key.includes('facebook') && 
                                !key.includes('fb_') && 
                                !key.includes('form_id') &&
                                !key.includes('hubspot') && 
                                !key.includes('slack') &&
                                !key.includes('pipedrive') &&
                                !key.includes('deal_id') &&
                                !key.includes('contact_id') &&
                                !key.includes('channel') &&
                                !key.includes('person_id') &&
                                !key.includes('org_id')
                              ).map(([key, value]) => (
                                <div key={key}>
                                  <div className="flex items-center justify-between mb-2">
                                    <Label htmlFor={`credential-${key}`} className="text-gray-700 capitalize flex items-center">
                                      {key.replace(/_/g, ' ')}
                                    </Label>
                                    {value.trim() !== '' ? (
                                      <Badge className="bg-green-100 text-green-800 flex items-center">
                                        <Check className="h-3 w-3 mr-1" />
                                        Provided
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-amber-100 text-amber-800">Required</Badge>
                                    )}
                                  </div>
                                  <Input
                                    id={`credential-${key}`}
                                    value={value}
                                    onChange={(e) => handleCredentialChange(key, e.target.value)}
                                    placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                                    type={key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('password') ? 'password' : 'text'}
                                    className={`border-gray-300 ${value.trim() !== '' ? 'border-green-300 bg-green-50' : ''}`}
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    {key.toLowerCase().includes('api') ? 
                                      "API key from your account settings" : 
                                      key.toLowerCase().includes('token') ? 
                                        "Authentication token for secure access" : 
                                        "Required for connection"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                          <h3 className="text-green-800 font-medium mb-1 flex items-center">
                            <Check className="h-4 w-4 mr-2" />
                            Ready to Go
                          </h3>
                          <p className="text-sm text-green-700">
                            This workflow is ready to use without any additional connections.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <Button 
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md" 
                        disabled={!credentialsComplete || isLoading}
                        onClick={handleSaveWorkflow}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Creating Workflow...
                          </>
                        ) : !credentialsComplete ? (
                          'Complete Required Fields'
                        ) : (
                          'Create & Activate Workflow'
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Quick help section */}
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md overflow-hidden text-white">
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3">Need Help?</h3>
                      <p className="mb-4 text-blue-100">
                        Confused about where to find your credentials or how to configure this workflow?
                      </p>
                      <div className="space-y-3">
                        <TemplateIntegrationGuide 
                          template={template} 
                          variant="blue" 
                        />
                        <a href="#" className="flex items-center text-white hover:text-blue-200 transition-colors">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Join Community Discord
                        </a>
                        <a href="#" className="flex items-center text-white hover:text-blue-200 transition-colors">
                          <LifeBuoy className="h-4 w-4 mr-2" />
                          Contact Support
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}