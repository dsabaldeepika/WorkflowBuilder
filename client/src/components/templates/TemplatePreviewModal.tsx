import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowTemplate } from "@shared/schema";
import { Clock, Tag, FileCode, DraftingCompass, LayoutDashboard, Image, Info } from "lucide-react";
import logger from "@/utils/logger";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

// Import template preview images
import defaultTemplatePreview from "@/assets/templates/workflow-template-placeholder.svg";
import facebookToHubspotPreview from "@/assets/templates/facebook-lead-to-hubspot.svg";
import customerFollowUpPreview from "@/assets/templates/customer-follow-up.svg";
import pipedriveToGoogleSheetsPreview from "@/assets/templates/pipedrive-to-googlesheets.svg";

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: WorkflowTemplate | null;
  onUseTemplate: (template: WorkflowTemplate) => void;
}

export function TemplatePreviewModal({
  isOpen,
  onClose,
  template,
  onUseTemplate,
}: TemplatePreviewModalProps) {
  const { toast } = useToast();

  // Log component mount and unmount with error handling
  useEffect(() => {
    try {
      if (isOpen && template) {
        logger.component.mount("TemplatePreviewModal", {
          templateId: template.id,
          templateName: template.name
        });
      }
      return () => {
        if (template) {
          logger.component.unmount("TemplatePreviewModal");
        }
      };
    } catch (error) {
      logger.error("Error in component lifecycle", 
        error instanceof Error ? error : new Error(String(error)),
        { templateId: template?.id }
      );
    }
  }, [isOpen, template]);

  if (!template) return null;
  
  // Extract nodes and edges data from the template with safe parsing
  let nodes = [];
  let edges = [];
  
  try {
    if (template.workflowData) {
      logger.debug("Parsing template workflow data", {
        templateId: template.id,
        dataType: typeof template.workflowData
      });

      const data = typeof template.workflowData === 'string' 
        ? JSON.parse(template.workflowData)
        : template.workflowData;
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid workflow data format');
      }

      nodes = Array.isArray(data.nodes) ? data.nodes : [];
      edges = Array.isArray(data.edges) ? data.edges : [];

      logger.debug("Successfully parsed workflow data", {
        templateId: template.id,
        nodesCount: nodes.length,
        edgesCount: edges.length,
        nodeTypes: nodes.map((n: { type: string }) => n.type)
      });
    }
  } catch (error) {
    logger.error("Error parsing workflow data", 
      error instanceof Error ? error : new Error(String(error)),
      {
        templateId: template.id,
        workflowData: template.workflowData,
        dataType: typeof template.workflowData
      }
    );
    nodes = [];
    edges = [];
  }
  
  // Get difficulty badge color with error handling
  const getDifficultyColor = (difficulty: string) => {
    try {
      switch (difficulty.toLowerCase()) {
        case 'beginner': return 'bg-green-100 text-green-800';
        case 'intermediate': return 'bg-yellow-100 text-yellow-800';
        case 'advanced': return 'bg-red-100 text-red-800';
        default: 
          logger.warn("Unknown difficulty level", { difficulty });
          return 'bg-gray-100 text-gray-800';
      }
    } catch (error) {
      logger.error("Error getting difficulty color", 
        error instanceof Error ? error : new Error(String(error)),
        { difficulty }
      );
      return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get the preview image with error handling
  const getTemplatePreviewImage = (template: WorkflowTemplate) => {
    try {
      logger.debug("Getting template preview image", {
        templateId: template.id,
        templateName: template.name
      });

      // Match template with preview image based on ID or name
      if (template.id === 13 || 
          (template.name && (
            template.name.toLowerCase().includes('pipedrive') || 
            (template.name.toLowerCase().includes('google') && template.name.toLowerCase().includes('sheet'))
          ))
      ) {
        logger.debug("Using Pipedrive to Google Sheets preview image", { templateId: template.id });
        return pipedriveToGoogleSheetsPreview;
      }
      
      // Match by keywords in template name
      const templateName = template.name.toLowerCase();
      
      if (templateName.includes('facebook') && (templateName.includes('hubspot') || templateName.includes('lead'))) {
        logger.debug("Using Facebook to Hubspot preview image", { templateId: template.id });
        return facebookToHubspotPreview;
      } else if (templateName.includes('customer') && templateName.includes('follow')) {
        logger.debug("Using Customer Follow-up preview image", { templateId: template.id });
        return customerFollowUpPreview;
      }
      
      // Default placeholder for any other templates
      logger.debug("Using default template preview image", { templateId: template.id });
      return defaultTemplatePreview;
    } catch (error) {
      logger.error("Error getting template preview image", 
        error instanceof Error ? error : new Error(String(error)),
        { templateId: template.id, templateName: template.name }
      );
      return defaultTemplatePreview;
    }
  };
  
  // Format node type count with error handling
  const formatNodeTypeCount = (nodes: any[]) => {
    try {
      const typeCount: Record<string, number> = {};
      
      nodes.forEach(node => {
        const type = node.type || 'unknown';
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
      
      const formattedCount = Object.entries(typeCount).map(([type, count]) => (
        `${count} ${type}${count > 1 ? 's' : ''}`
      )).join(', ');

      logger.debug("Node type count formatted", {
        templateId: template.id,
        typeCount,
        formattedCount
      });

      return formattedCount;
    } catch (error) {
      logger.error("Error formatting node type count", 
        error instanceof Error ? error : new Error(String(error)),
        { templateId: template.id, nodesCount: nodes.length }
      );
      return 'Unknown';
    }
  };

  // Handle template use with error handling
  const handleUseTemplateClick = () => {
    try {
      logger.info("Template selected from preview", {
        templateId: template.id,
        templateName: template.name,
        nodesCount: nodes.length,
        edgesCount: edges.length
      });

      onUseTemplate(template);
    } catch (error) {
      logger.error("Error handling template use", 
        error instanceof Error ? error : new Error(String(error)),
        { templateId: template.id }
      );
      toast({
        title: "Error",
        description: "Failed to use template. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle dialog close with error handling
  const handleClose = () => {
    try {
      logger.debug("Closing template preview", {
        templateId: template.id
      });
      onClose();
    } catch (error) {
      logger.error("Error closing template preview", 
        error instanceof Error ? error : new Error(String(error)),
        { templateId: template.id }
      );
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{template.name}</DialogTitle>
          <DialogDescription className="text-base mt-1">
            {template.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {/* Template Details Section */}
          <div className="flex flex-wrap gap-3 items-center mb-6">
            <Badge variant="secondary" className={`${getDifficultyColor(template.difficulty)} capitalize`}>
              {template.difficulty}
            </Badge>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <DraftingCompass className="h-4 w-4 mr-1" />
              <span>{formatNodeTypeCount(nodes)}</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <LayoutDashboard className="h-4 w-4 mr-1" />
              <span className="capitalize">{template.category}</span>
            </div>
          </div>
          
          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Tabs for different views */}
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-3">
              <TabsTrigger value="preview">
                <Image className="h-4 w-4 mr-2" />
                Workflow Preview
              </TabsTrigger>
              <TabsTrigger value="structure">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Components
              </TabsTrigger>
              <TabsTrigger value="documentation">
                <Info className="h-4 w-4 mr-2" />
                Documentation
              </TabsTrigger>
            </TabsList>
            
            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4">
              <h3 className="text-lg font-medium">Workflow Visualization</h3>
              
              <div className="flex justify-center p-4 bg-gray-50 rounded-lg border">
                <img 
                  src={getTemplatePreviewImage(template)} 
                  alt={`${template.name} workflow preview`}
                  className="max-w-full object-contain rounded"
                  style={{ maxHeight: '320px' }}
                />
              </div>
              
              <div className="text-sm text-muted-foreground text-center mt-2">
                This visual representation shows how data flows through the workflow.
              </div>
            </TabsContent>
            
            {/* Structure Tab */}
            <TabsContent value="structure" className="space-y-4">
              <h3 className="text-lg font-medium">Workflow Components</h3>
              
              <div className="space-y-4">
                {/* Node Groups */}
                <div>
                  <h4 className="text-md font-medium mb-2">Nodes ({nodes.length})</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {nodes.map((node: any, index: number) => (
                      <Card key={index} className="p-3">
                        <div className="font-medium">{node.id}</div>
                        <div className="text-sm text-muted-foreground capitalize">Type: {node.type}</div>
                        {node.data?.service && (
                          <div className="text-sm text-muted-foreground">Service: {node.data.service}</div>
                        )}
                        {node.data?.event && (
                          <div className="text-sm text-muted-foreground">Event: {node.data.event}</div>
                        )}
                        {node.data?.action && (
                          <div className="text-sm text-muted-foreground">Action: {node.data.action}</div>
                        )}
                        {node.data?.function && (
                          <div className="text-sm text-muted-foreground">Function: {node.data.function}</div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
                
                {/* Edge Group */}
                <div>
                  <h4 className="text-md font-medium mb-2">Connections ({edges.length})</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {edges.map((edge: any, index: number) => (
                      <Card key={index} className="p-3">
                        <div className="text-sm">
                          <span className="font-medium">{edge.source}</span> → <span className="font-medium">{edge.target}</span>
                        </div>
                        {edge.label && (
                          <div className="text-xs text-muted-foreground">Condition: {edge.label}</div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Code Tab */}
            <TabsContent value="code">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Configuration Details</h3>
                  <p className="text-muted-foreground mb-4">
                    This section shows the detailed configuration for each node in the workflow.
                  </p>
                  
                  <div className="space-y-4">
                    {nodes.map((node: any, index: number) => (
                      <Card key={index} className="p-4">
                        <h4 className="font-medium">{node.id}</h4>
                        <div className="text-sm text-muted-foreground mb-2">Type: {node.type}</div>
                        
                        {node.data?.config && (
                          <div className="mt-2">
                            <h5 className="text-sm font-medium mb-1">Configuration:</h5>
                            <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                              {JSON.stringify(node.data.config, null, 2)}
                            </pre>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Documentation Tab */}
            <TabsContent value="documentation">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Template Documentation</h3>
                
                <div className="space-y-4">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Description</h4>
                    <p>{template.description}</p>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Required Configuration</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {nodes.map((node: any) => {
                        if (!node.data?.config) return null;
                        
                        const configKeys = Object.keys(node.data.config);
                        const templateVars = configKeys.filter(key => {
                          const value = node.data.config[key];
                          return typeof value === 'string' && value.includes('${');
                        });
                        
                        if (templateVars.length === 0) return null;
                        
                        return (
                          <li key={node.id}>
                            <span className="font-medium">{node.id}</span>:
                            <ul className="list-disc pl-5 text-sm text-muted-foreground">
                              {templateVars.map(key => (
                                <li key={key}>{key}</li>
                              ))}
                            </ul>
                          </li>
                        );
                      })}
                    </ul>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Use Case</h4>
                    <p>
                      This template is useful for {template.category.replace(/-/g, ' ')} scenarios where you need to 
                      automate processes related to {template.tags?.slice(0, 3).join(', ')}.
                    </p>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUseTemplateClick}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Configure & Use Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}