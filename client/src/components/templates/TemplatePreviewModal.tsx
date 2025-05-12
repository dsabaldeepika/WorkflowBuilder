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
  if (!template) return null;
  
  // Extract nodes and edges data from the template
  const nodes = template.nodes ? JSON.parse(template.nodes as string) : [];
  const edges = template.edges ? JSON.parse(template.edges as string) : [];
  
  // Get complexity badge color
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get the preview image based on template name or ID
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
  
  const formatNodeTypeCount = (nodes: any[]) => {
    const typeCount: Record<string, number> = {};
    
    nodes.forEach(node => {
      const type = node.type || 'unknown';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    
    return Object.entries(typeCount).map(([type, count]) => (
      `${count} ${type}${count > 1 ? 's' : ''}`
    )).join(', ');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
            <Badge variant="secondary" className={`${getComplexityColor(template.complexity || 'medium')} capitalize`}>
              {template.complexity || 'medium'} complexity
            </Badge>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>{template.estimatedDuration || 'Unknown duration'}</span>
            </div>
            
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => onUseTemplate(template)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Configure & Use Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}