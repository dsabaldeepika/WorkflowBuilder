import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { WorkflowTemplate } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useWorkflowStore } from "@/store/useWorkflowStore";
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
  Loader2,
  Wand2,
  Database,
  FileText,
  Mail,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { InlineWorkflowLoading } from "@/components/workflow/InlineWorkflowLoading";
import { NodeConfigWizard } from "./NodeConfigWizard";
// Import template preview images
import defaultTemplatePreview from "@/assets/templates/workflow-template-placeholder.svg";
import facebookToHubspotPreview from "@/assets/templates/facebook-lead-to-hubspot.svg";
import customerFollowUpPreview from "@/assets/templates/customer-follow-up.svg";
import pipedriveToGoogleSheetsPreview from "@/assets/templates/pipedrive-to-googlesheets.svg";
import { TemplateIntegrationGuide } from "./TemplateIntegrationGuide";
// Import integration components
import { ConnectionManager } from "@/components/integration/ConnectionManager";
import { GoogleSheetsConnector } from "@/components/integration/GoogleSheetsConnector";
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
  SiGmail,
} from "react-icons/si";
import { Layers } from "lucide-react";
import { SERVICE_REGISTRY } from "./serviceRegistry";
import { Node, Edge } from "reactflow";
import { NodeData } from "@/store/useWorkflowStore";

interface TemplateWorkflowSetupProps {
  templateId: string;
}

interface Credentials {
  [key: string]: string;
}

// Add getServiceIcon function
const getServiceIcon = (serviceName?: string) => {
  if (!serviceName) return <Layers className="h-5 w-5 text-gray-500" />;

  switch (serviceName.toLowerCase()) {
    case "google-sheets":
      return <SiGooglesheets className="h-5 w-5 text-green-600" />;
    case "facebook":
      return <SiFacebook className="h-5 w-5 text-blue-600" />;
    case "slack":
      return <SiSlack className="h-5 w-5 text-purple-600" />;
    case "hubspot":
      return <SiHubspot className="h-5 w-5 text-orange-600" />;
    case "gmail":
      return <SiGmail className="h-5 w-5 text-red-600" />;
    case "openai":
      return <Database className="h-5 w-5 text-green-600" />;
    default:
      return <Layers className="h-5 w-5 text-gray-500" />;
  }
};

export function TemplateWorkflowSetup({
  templateId,
}: TemplateWorkflowSetupProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<Credentials>({});
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [credentialsComplete, setCredentialsComplete] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const { loadWorkflowFromTemplate, saveWorkflow, nodes, edges } =
    useWorkflowStore();

  // Fetch template details with proper error handling
  const {
    data: template,
    isLoading: isTemplateLoading,
    error: templateError,
  } = useQuery<WorkflowTemplate>({
    queryKey: ["/api/workflow/templates", templateId],
    queryFn: async () => {
      if (!templateId) throw new Error("Template ID is required");
      const res = await fetch(`/api/workflow/templates/${templateId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch template: ${res.statusText}`);
      }
      return res.json();
    },
    enabled: !!templateId,
  });

  // Type guard for workflow data
  const isWorkflowData = (data: any): data is { nodes: Node<NodeData>[]; edges: Edge[] } => {
    return (
      data &&
      Array.isArray(data.nodes) &&
      Array.isArray(data.edges) &&
      data.nodes.every((node: any) => 
        node && 
        typeof node === 'object' && 
        'id' in node && 
        'type' in node &&
        'data' in node
      )
    );
  };

  // Utility to ensure all nodes have a string type and initialize essential data properties
  const sanitizeNodes = useCallback((nodes: Node<NodeData>[]): Node<NodeData>[] => {
    return nodes.map((node: Node<NodeData>) => ({
      ...node,
      type: typeof node.type === 'string' ? node.type : '',
      data: {
        // Preserve all existing data properties first
        ...node.data,
        // Ensure essential properties have default values if missing
        service: node.data?.service || '',
        config: node.data?.config && typeof node.data.config === 'object' ? node.data.config : {},
        // Add other essential properties with defaults if necessary, e.g.:
        label: node.data?.label || 'Unnamed Node',
        event: node.data?.event || '',
        action: node.data?.action || '',
      },
    }));
  }, []);

  // Extract workflow data with proper type checking
  const workflowData = template?.workflowData && isWorkflowData(template.workflowData)
    ? template.workflowData
    : { nodes: [], edges: [] };

  const templateNodes = workflowData.nodes;
  const templateEdges = workflowData.edges;
  const safeTemplateNodes = sanitizeNodes(templateNodes);

  // Extract required credentials from the template
  useEffect(() => {
    if (!template) return;

    // Prepare workflow name using template name as a base
    setWorkflowName(`${template.name} Workflow`);
    setWorkflowDescription(template.description || "");

    // Load the workflow data into the store and initialize config for the wizard
    if (templateNodes && templateEdges !== undefined) {
      try {
        const parsedNodes = typeof templateNodes === "string"
          ? JSON.parse(templateNodes)
          : templateNodes;
        
        let parsedEdges: Edge[];
        if (typeof templateEdges === "string") {
          parsedEdges = JSON.parse(templateEdges);
        } else {
          parsedEdges = templateEdges;
        }
        
        // ** Add console log here to inspect backend node structure **
        console.log("Backend template nodes structure:", parsedNodes);

        // Map backend node structure to frontend Node<NodeData> structure
        const frontendNodes: Node<NodeData>[] = parsedNodes.map((backendNode: any) => {
          // Extract core properties
          const nodeId = backendNode.id;
          const nodeType = backendNode.type || 'default'; // Use backend type, fallback to default
          const nodePosition = backendNode.position || { x: 0, y: 0 }; // Default position

          // Extract and infer data properties based on data.name
          const backendData = backendNode.data || {};
          const backendNodeName = backendData.name || '';
          const dataLabel = backendNodeName || nodeId || 'Unnamed Node'; // Use data.name as label, fallback to id

          let dataService = '';
          let dataEvent = '';
          let dataAction = '';
          const dataConfig = backendNode.config || backendData.config || {}; // Preserve existing config if any

          // Infer service, event, and action based on backendNodeName (data.name)
          const lowerCaseName = backendNodeName.toLowerCase();

          if (lowerCaseName.includes('google sheets') || lowerCaseName.includes('sheet')) {
            dataService = 'google-sheets';
            if (lowerCaseName.includes('new row')) dataEvent = 'new_row';
            if (lowerCaseName.includes('write result') || lowerCaseName.includes('write row')) dataAction = 'write_row';
            // Add more Google Sheets events/actions as needed
          } else if (lowerCaseName.includes('claude') || lowerCaseName.includes('openai') || lowerCaseName.includes('completion')) {
            dataService = 'openai'; // Map Claude to OpenAI service in frontend
            if (lowerCaseName.includes('completion')) dataAction = 'completion';
            // Add more OpenAI actions as needed
          } else if (lowerCaseName.includes('slack')) {
             dataService = 'slack';
             if (lowerCaseName.includes('send message')) dataAction = 'send_message';
             // Add more Slack actions as needed
          } else if (lowerCaseName.includes('salesforce')) {
             dataService = 'salesforce';
             // Add Salesforce events/actions as needed based on name
          } else if (lowerCaseName.includes('clickup')) {
             dataService = 'clickup';
             // Add ClickUp events/actions as needed based on name
          }
          // Add more service inferences here based on keywords in data.name

          const nodeData: NodeData = {
            label: dataLabel,
            service: dataService,
            event: dataEvent,
            action: dataAction,
            config: dataConfig,
            // Include any other necessary data properties here
          };

          return {
            id: nodeId,
            type: nodeType,
            position: nodePosition,
            data: nodeData,
            // Include any other necessary top-level node properties here
          };
        });

        const safeParsedNodes = sanitizeNodes(frontendNodes);
        loadWorkflowFromTemplate(safeParsedNodes, parsedEdges);
      } catch (err) {
        console.error("Error loading workflow template:", err);
        toast({
          title: "Error loading template",
          description: "Failed to parse workflow data. Please try again.",
          variant: "destructive",
        });
      }
    }

    // Extract credentials from node configs
    const extractedCredentials: Credentials = {};
    const processNodes = (nodes: Node<NodeData>[]) => {
      nodes.forEach((node: Node<NodeData>) => {
        if (!node.data?.config) return;

        Object.entries(node.data.config).forEach(([key, value]) => {
          if (typeof value === "string" && value.includes("${")) {
            const match = value.match(/\${([^}]+)}/);
            if (match && match[1]) {
              const credentialName = match[1];
              if (!extractedCredentials[credentialName]) {
                extractedCredentials[credentialName] = "";
              }
            }
          }
        });
      });
    };

    processNodes(safeTemplateNodes);
    setCredentials(extractedCredentials);
    setCredentialsComplete(Object.keys(extractedCredentials).length === 0);
  }, [template, templateNodes, templateEdges, loadWorkflowFromTemplate, sanitizeNodes, toast]);

  // Update credentialsComplete status
  useEffect(() => {
    const allFilled = Object.values(credentials).every(
      (val) => val.trim() !== ""
    );
    setCredentialsComplete(Object.keys(credentials).length === 0 || allFilled);
  }, [credentials]);

  // Handle credential input changes
  const handleCredentialChange = useCallback((key: string, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Launch the Node Configuration Wizard
  const handleLaunchWizard = useCallback(() => {
    if (!templateNodes || templateNodes.length === 0) {
      toast({
        title: "No nodes to configure",
        description: "This template does not contain any workflow nodes.",
        variant: "destructive",
      });
      return;
    }
    setShowWizard(true);
  }, [templateNodes, toast]);

  // Handle wizard completion
  const handleWizardComplete = useCallback((configuredNodes: Node<NodeData>[]) => {
    loadWorkflowFromTemplate(configuredNodes, edges);
    setShowWizard(false);
    toast({
      title: "Nodes configured successfully",
      description: "Your workflow is ready to be activated.",
    });
    handleSaveWorkflow(configuredNodes);
  }, [loadWorkflowFromTemplate, edges, toast]);

  // Handle wizard cancellation
  const handleWizardCancel = useCallback(() => {
    setShowWizard(false);
  }, []);

  // Handle workflow saving
  const handleSaveWorkflow = useCallback(async (configuredNodes?: Node<NodeData>[]) => {
    if (!template) return;

    setIsLoading(true);

    try {
      const nodesWithCredentials = (configuredNodes || nodes).map((node) => {
        if (!node.data?.config) return node;

        const updatedConfig = { ...node.data.config };
        Object.entries(updatedConfig).forEach(([key, value]) => {
          if (typeof value === "string" && value.includes("${")) {
            Object.entries(credentials).forEach(([credKey, credValue]) => {
              const placeholder = `\${${credKey}}`;
              if (value.includes(placeholder)) {
                updatedConfig[key] = value.replace(placeholder, credValue);
              }
            });
          }
        });

        return {
          ...node,
          data: {
            ...node.data,
            config: updatedConfig,
          },
        };
      });

      await saveWorkflow({
        name: workflowName,
        description: workflowDescription,
        nodes: nodesWithCredentials,
        edges: edges,
      });

      toast({
        title: "Workflow activated successfully",
        description: "Your new workflow is ready to use.",
      });

      navigate("/workflows");
    } catch (error) {
      console.error("Error saving workflow:", error);
      toast({
        title: "Failed to activate workflow",
        description: "There was an error creating your workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [template, nodes, edges, credentials, workflowName, workflowDescription, saveWorkflow, toast, navigate]);

  // Calculate progress percentage
  const calculateProgress = useCallback(() => {
    let progress = 30; // Start with 30% for viewing the template

    if (workflowName.trim().length > 0) {
      progress += 20;
    }

    if (credentialsComplete) {
      progress += 50;
    } else if (Object.keys(credentials).length > 0) {
      const filledCount = Object.values(credentials).filter(
        (v) => v.trim() !== ""
      ).length;
      const totalCount = Object.keys(credentials).length;
      if (totalCount > 0) {
        progress += Math.floor((filledCount / totalCount) * 40);
      }
    } else {
      progress += 50;
    }

    return Math.min(progress, 100);
  }, [workflowName, credentialsComplete, credentials]);

  // Render loading state
  if (isTemplateLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render error state
  if (templateError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Template</AlertTitle>
          <AlertDescription>
            {templateError instanceof Error ? templateError.message : "Failed to load template"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render the template setup UI
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      {showWizard && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-auto">
          <NodeConfigWizard
            nodes={safeTemplateNodes}
            onComplete={handleWizardComplete}
            onCancel={handleWizardCancel}
          />
        </div>
      )}

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto py-10 px-4">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/templates")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Button>
          </div>

          {template && (
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold mb-4">{template.name}</h1>
              <p className="text-lg text-white/90">{template.description}</p>
            </div>
          )}
        </div>
      </div>

      {template && (
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  Setup Progress
                </h2>
                <Badge
                  className={
                    credentialsComplete
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }
                >
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Component Details
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Technical details of each workflow component
                    </p>

                    <div className="space-y-4">
                      {safeTemplateNodes.map((node, index) => (
                        <div
                          key={node.id}
                          className="border rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {getServiceIcon(node.data.service)}
                            <h3 className="font-semibold text-gray-800">
                              {node.data.label}
                            </h3>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex">
                              <span className="font-medium w-32 text-gray-700">
                                Type:
                              </span>
                              <span className="text-gray-600">{node.type}</span>
                            </div>
                            {node.data.service && (
                              <div className="flex">
                                <span className="font-medium w-32 text-gray-700">
                                  Service:
                                </span>
                                <span className="text-gray-600">
                                  {node.data.service}
                                </span>
                              </div>
                            )}
                            {node.data.event && (
                              <div className="flex">
                                <span className="font-medium w-32 text-gray-700">
                                  Event:
                                </span>
                                <span className="text-gray-600">
                                  {node.data.event}
                                </span>
                              </div>
                            )}
                            {node.data.action && (
                              <div className="flex">
                                <span className="font-medium w-32 text-gray-700">
                                  Action:
                                </span>
                                <span className="text-gray-600">
                                  {node.data.action}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Setup Your Workflow
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="workflow-name" className="text-gray-700">
                          Workflow Name
                        </Label>
                        <Input
                          id="workflow-name"
                          value={workflowName}
                          onChange={(e) => setWorkflowName(e.target.value)}
                          placeholder="Enter workflow name"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="workflow-description" className="text-gray-700">
                          Description (optional)
                        </Label>
                        <Input
                          id="workflow-description"
                          value={workflowDescription}
                          onChange={(e) => setWorkflowDescription(e.target.value)}
                          placeholder="Enter workflow description"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <Button
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md"
                      disabled={isLoading}
                      onClick={handleLaunchWizard}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Configure Workflow Nodes
                        </>
                      )}
                    </Button>
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
