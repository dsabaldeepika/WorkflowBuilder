import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Step, Stepper } from '@/components/ui/stepper';
// Note: We created the stepper component but aren't using it in this wizard yet
import { Separator } from '@/components/ui/separator';
import { GoogleSheetsConnector } from '@/components/integration/GoogleSheetsConnector';
import { ConnectionManager } from '@/components/integration/ConnectionManager';
import { AlertCircle, Check, ChevronRight, AlertTriangle, Database, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SiGooglesheets, SiHubspot, SiFacebook, SiSlack } from 'react-icons/si';
import { Layers } from 'lucide-react';

// Types
interface Node {
  id: string;
  type: string;
  data: {
    label: string;
    service?: string;
    config?: Record<string, any>;
  };
  position: { x: number; y: number };
}

interface NodeConfigWizardProps {
  nodes: Node[];
  onComplete: (configuredNodes: Node[]) => void;
  onCancel: () => void;
}

export function NodeConfigWizard({ nodes, onComplete, onCancel }: NodeConfigWizardProps) {
  // Create fallback nodes if none are provided
  const allNodes = React.useMemo(() => {
    return nodes.length > 0 ? nodes : [
      {
        id: 'google-sheets-1',
        type: 'custom',
        data: {
          label: 'Google Sheets',
          service: 'google-sheets',
          config: {
            spreadsheet_id: '',
            sheet_name: '',
            range: ''
          }
        },
        position: { x: 250, y: 100 }
      },
      {
        id: 'slack-1',
        type: 'custom',
        data: {
          label: 'Slack',
          service: 'slack',
          config: {
            channel: '',
            message: ''
          }
        },
        position: { x: 250, y: 250 }
      }
    ];
  }, [nodes]);
  
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [configuredNodes, setConfiguredNodes] = useState<Node[]>([...allNodes]);
  const [nodeConfigs, setNodeConfigs] = useState<Record<string, any>>({});
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Filter out nodes that need configuration (have service property)
  const configurableNodes = React.useMemo(() => {
    return allNodes.filter(node => 
      node.data.service || (node.data.config && Object.keys(node.data.config).length > 0)
    );
  }, [allNodes]);
  
  const currentNode = configurableNodes[currentNodeIndex];
  const progress = Math.round(((currentNodeIndex) / Math.max(1, configurableNodes.length)) * 100);
  
  // Get service icon based on node service type
  const getServiceIcon = (service?: string) => {
    if (!service) return <Database className="h-5 w-5 text-gray-600" />;
    
    const iconSize = 24;
    
    switch(service.toLowerCase()) {
      case 'google-sheets':
      case 'googlesheets':
        return <SiGooglesheets size={iconSize} className="text-green-600" />;
      case 'hubspot':
        return <SiHubspot size={iconSize} className="text-orange-500" />;
      case 'facebook':
        return <SiFacebook size={iconSize} className="text-blue-600" />;
      case 'slack':
        return <SiSlack size={iconSize} className="text-purple-600" />;
      case 'pipedrive':
        return <Layers size={iconSize} className="text-green-700" />;
      default:
        return <Database className="h-5 w-5 text-gray-600" />;
    }
  };
  
  // Handle node configuration changes
  const handleNodeConfigChange = (nodeId: string, config: Record<string, any>) => {
    setNodeConfigs(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        ...config
      }
    }));
  };
  
  // Apply configs to nodes
  useEffect(() => {
    const updatedNodes = allNodes.map(node => {
      if (nodeConfigs[node.id]) {
        return {
          ...node,
          data: {
            ...node.data,
            config: {
              ...node.data.config,
              ...nodeConfigs[node.id]
            }
          }
        };
      }
      return node;
    });
    
    setConfiguredNodes(updatedNodes);
  }, [allNodes, nodeConfigs]);
  
  // Handle moving to next node
  const handleNext = () => {
    if (currentNodeIndex < configurableNodes.length - 1) {
      setCurrentNodeIndex(prevIndex => prevIndex + 1);
    } else {
      handleComplete();
    }
  };
  
  // Handle moving to previous node
  const handlePrevious = () => {
    if (currentNodeIndex > 0) {
      setCurrentNodeIndex(prevIndex => prevIndex - 1);
    }
  };
  
  // Complete the wizard
  const handleComplete = () => {
    setIsCompleting(true);
    
    // Simulate API call or processing
    setTimeout(() => {
      onComplete(configuredNodes);
      setIsCompleting(false);
    }, 1000);
  };
  
  // Skip configuration for the current node
  const handleSkipNode = () => {
    if (currentNodeIndex < configurableNodes.length - 1) {
      setCurrentNodeIndex(prevIndex => prevIndex + 1);
    } else {
      handleComplete();
    }
  };
  
  // Check if current node is configured
  const isCurrentNodeConfigured = () => {
    if (!currentNode) return true;
    
    const nodeConfig = nodeConfigs[currentNode.id];
    if (!nodeConfig) return false;
    
    // Simple validation - check if all required fields have values
    const requiredFields = Object.keys(currentNode.data.config || {}).filter(
      key => currentNode.data.config?.[key] && 
      typeof currentNode.data.config[key] === 'string' && 
      currentNode.data.config[key].includes('${')
    );
    
    // If no required fields, consider configured
    if (requiredFields.length === 0) return true;
    
    // Check if all required fields are present in the config
    return requiredFields.every(field => 
      nodeConfig[field] && nodeConfig[field].trim() !== ''
    );
  };
  
  // Render config form based on service type
  const renderConfigForm = (node: Node) => {
    const service = node.data.service?.toLowerCase();
    
    if (!service) {
      return (
        <div className="p-6 bg-gray-50 rounded-lg text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Configuration Required</h3>
          <p className="text-gray-500">This node doesn't require any additional setup.</p>
        </div>
      );
    }
    
    // Extract required fields from config
    const requiredFields: Record<string, string> = {};
    if (node.data.config) {
      Object.entries(node.data.config).forEach(([key, value]) => {
        if (typeof value === 'string' && value.includes('${')) {
          const match = value.match(/\${([^}]+)}/);
          if (match && match[1]) {
            requiredFields[match[1]] = '';
          }
        }
      });
    }
    
    // Render appropriate connector based on service type
    switch(service) {
      case 'google-sheets':
      case 'googlesheets':
        return (
          <div className="mb-6 p-4 border rounded-md bg-green-50/30">
            <div className="flex items-center mb-4">
              <SiGooglesheets className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-medium">Google Sheets Configuration</h3>
            </div>
            
            <GoogleSheetsConnector 
              initialSpreadsheetId={nodeConfigs[node.id]?.spreadsheet_id || ''} 
              initialSheetName={nodeConfigs[node.id]?.sheet_name || ''}
              initialAction={
                Object.keys(requiredFields).some(key => key.includes('append')) 
                  ? 'append_row' 
                  : 'get_values'
              }
              onConfigurationComplete={(config) => {
                // Map Google Sheets config to node config
                handleNodeConfigChange(node.id, {
                  spreadsheet_id: config.spreadsheetId,
                  sheet_name: config.sheetName,
                  range: config.range || '',
                  action: config.action
                });
              }}
            />
          </div>
        );
      
      case 'facebook':
        return (
          <div className="mb-6 p-4 border rounded-md bg-blue-50/30">
            <div className="flex items-center mb-4">
              <SiFacebook className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium">Facebook Configuration</h3>
            </div>
            
            <ConnectionManager 
              service="facebook"
              requiredFields={requiredFields}
              onCredentialSelected={(credential) => {
                handleNodeConfigChange(node.id, {
                  facebook_credential_id: credential.id,
                  ...requiredFields // Add any field placeholder values
                });
              }}
            />
            
            {/* Additional Facebook-specific form fields */}
            {Object.keys(requiredFields).length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium mb-3">Configure Facebook Details</h4>
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Required Settings</AlertTitle>
                  <AlertDescription>
                    Complete these fields to connect your Facebook account properly
                  </AlertDescription>
                </Alert>
                
                {/* Additional form fields based on required parameters */}
                {/* Field mapping would be implemented here */}
              </div>
            )}
          </div>
        );
      
      case 'hubspot':
        return (
          <div className="mb-6 p-4 border rounded-md bg-orange-50/30">
            <div className="flex items-center mb-4">
              <SiHubspot className="h-5 w-5 text-orange-600 mr-2" />
              <h3 className="text-lg font-medium">HubSpot Configuration</h3>
            </div>
            
            <ConnectionManager 
              service="hubspot"
              requiredFields={requiredFields}
              onCredentialSelected={(credential) => {
                handleNodeConfigChange(node.id, {
                  hubspot_credential_id: credential.id,
                  ...requiredFields
                });
              }}
            />
            
            {/* Additional HubSpot-specific form fields */}
            {Object.keys(requiredFields).length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium mb-3">Configure HubSpot Details</h4>
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Required Settings</AlertTitle>
                  <AlertDescription>
                    Complete these fields to connect your HubSpot account properly
                  </AlertDescription>
                </Alert>
                
                {/* Additional form fields based on required parameters */}
                {/* Field mapping would be implemented here */}
              </div>
            )}
          </div>
        );
      
      case 'slack':
        return (
          <div className="mb-6 p-4 border rounded-md bg-purple-50/30">
            <div className="flex items-center mb-4">
              <SiSlack className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-medium">Slack Configuration</h3>
            </div>
            
            <ConnectionManager 
              service="slack"
              requiredFields={requiredFields}
              onCredentialSelected={(credential) => {
                handleNodeConfigChange(node.id, {
                  slack_credential_id: credential.id,
                  ...requiredFields
                });
              }}
            />
            
            {/* Additional Slack-specific form fields */}
            {Object.keys(requiredFields).length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium mb-3">Configure Slack Details</h4>
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Required Settings</AlertTitle>
                  <AlertDescription>
                    Complete these fields to connect your Slack account properly
                  </AlertDescription>
                </Alert>
                
                {/* Additional form fields based on required parameters */}
                {/* Field mapping would be implemented here */}
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-4">
              <Database className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-medium">Generic Service Configuration</h3>
            </div>
            
            <ConnectionManager 
              service={service}
              requiredFields={requiredFields}
              onCredentialSelected={(credential) => {
                handleNodeConfigChange(node.id, {
                  [`${service}_credential_id`]: credential.id,
                  ...requiredFields
                });
              }}
            />
          </div>
        );
    }
  };
  
  if (configurableNodes.length === 0) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>No Configuration Required</CardTitle>
            <CardDescription>
              This template doesn't have any nodes that require configuration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 inline-flex mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-medium mb-2">Ready to Use</h3>
                <p className="text-gray-500 mb-6">
                  This workflow template is ready to use as-is. No additional setup is required.
                </p>
                <Button onClick={() => onComplete(configuredNodes)}>
                  Activate Workflow
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-auto flex items-start justify-center p-4 sm:p-6 md:p-8">
      <Card className="shadow-lg border-0 w-full max-w-4xl">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Configure Workflow Nodes</CardTitle>
              <CardDescription>
                Step {currentNodeIndex + 1} of {configurableNodes.length} - Setup each node in your workflow
              </CardDescription>
            </div>
            <Badge 
              variant={isCurrentNodeConfigured() ? "outline" : "secondary"}
              className={isCurrentNodeConfigured() ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
            >
              {isCurrentNodeConfigured() ? "Ready" : "Needs Setup"}
            </Badge>
          </div>
        </CardHeader>
        
        <div className="p-1">
          <Progress value={progress} className="h-1" />
        </div>
        
        <div className="flex">
          {/* Left sidebar with node list */}
          <div className="w-64 border-r p-4 hidden md:block">
            <h3 className="font-medium mb-3 text-sm text-muted-foreground">WORKFLOW NODES</h3>
            <ul className="space-y-1">
              {configurableNodes.map((node, index) => (
                <li key={node.id}>
                  <button
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                      index === currentNodeIndex 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setCurrentNodeIndex(index)}
                  >
                    {getServiceIcon(node.data.service)}
                    <span className="truncate">{node.data.label}</span>
                    {index < currentNodeIndex && (
                      <Check className="h-4 w-4 ml-auto text-green-500" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
            
            <Separator className="my-4" />
            
            <Alert variant="default" className="bg-blue-50/50 border-blue-100 text-sm">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-700">Setup Service Nodes</AlertTitle>
              <AlertDescription className="text-blue-600">
                Configure each node to connect your workflow with external services.
              </AlertDescription>
            </Alert>
          </div>
          
          {/* Main content area */}
          <div className="flex-1 p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentNodeIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center mb-4">
                  {getServiceIcon(currentNode?.data.service)}
                  <h2 className="text-xl font-medium ml-2">{currentNode?.data.label}</h2>
                </div>
                
                <ScrollArea className="h-[calc(100vh-350px)] min-h-[400px] pr-4">
                  {currentNode && renderConfigForm(currentNode)}
                </ScrollArea>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        <CardFooter className="border-t p-4 bg-muted/10 flex justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isCompleting}
            >
              Cancel
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleSkipNode}
              disabled={isCompleting || currentNodeIndex >= configurableNodes.length - 1}
            >
              Skip This Node
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentNodeIndex === 0 || isCompleting}
            >
              Previous
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={isCompleting}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              {isCompleting 
                ? 'Processing...' 
                : currentNodeIndex < configurableNodes.length - 1 
                  ? 'Next' 
                  : 'Complete'
              }
              {!isCompleting && currentNodeIndex < configurableNodes.length - 1 && 
                <ChevronRight className="ml-1 h-4 w-4" />
              }
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}