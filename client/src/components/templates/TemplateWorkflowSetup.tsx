import React, { useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
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

export function TemplateWorkflowSetup({
  templateId,
}: TemplateWorkflowSetupProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [credentialsComplete, setCredentialsComplete] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const { loadWorkflowFromTemplate, saveWorkflow, nodes, edges } =
    useWorkflowStore();

  // Fetch template details
  const {
    data: template,
    isLoading: isTemplateLoading,
    error,
  } = useQuery<WorkflowTemplate>({
    queryKey: ["/api/workflow/templates", templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const res = await fetch(`/api/workflow/templates/${templateId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch template: ${res.statusText}`);
      }
      return res.json();
    },
    enabled: !!templateId,
  });

  // Always initialize these variables, even if template is null
  const workflowData = template?.workflowData && isWorkflowData(template.workflowData)
    ? template.workflowData
    : { nodes: [], edges: [] };

  const templateNodes = workflowData.nodes;
  const templateEdges = workflowData.edges;

  // Utility to ensure all nodes have a string type
  function sanitizeNodes(nodes: Node<NodeData>[]): Node<NodeData>[] {
    return nodes.map((node: Node<NodeData>) => ({
      ...node,
      type: typeof node.type === 'string' ? node.type : '',
    }));
  }

  const safeTemplateNodes: Node<NodeData>[] = sanitizeNodes(templateNodes as Node<NodeData>[]);

  // Extract required credentials from the template and automatically launch node configuration
  useEffect(() => {
    if (template) {
      // Prepare workflow name using template name as a base
      setWorkflowName(`${template.name} Workflow`);
      setWorkflowDescription(template.description || "");

      // Load the workflow data into the store (for the canvas preview)
      if (templateNodes && templateEdges) {
        try {
          const parsedNodes =
            typeof templateNodes === "string"
              ? JSON.parse(templateNodes)
              : templateNodes;
          const parsedEdges =
            typeof templateEdges === "string"
              ? JSON.parse(templateEdges)
              : templateEdges;
          // Ensure all nodes have a defined string type
          const safeParsedNodes = sanitizeNodes(parsedNodes as Node<NodeData>[]);
          loadWorkflowFromTemplate(safeParsedNodes, parsedEdges);

          // Remove the automatic wizard popup
          // The wizard will now only show when the user clicks the "Configure Workflow Nodes" button
        } catch (err) {
          console.error("Error loading workflow template:", err);
        }
      }

      // Extract required credentials from node configs
      const extractedCredentials: Record<string, string> = {};

      // Process nodes to find all credential placeholders
      const processNodes = (nodes: Node<NodeData>[]) => {
        return nodes.map((node: Node<NodeData>) => {
          // Ensure node.type is always a string
          if (!node.type) node.type = '';
          if (!node.data?.config) return node;

          // Check if config contains credential placeholders
          Object.entries(node.data.config).forEach(([key, value]) => {
            if (typeof value === "string" && value.includes("${")) {
              // Extract credential name from placeholder pattern ${CREDENTIAL_NAME}
              const match = value.match(/\${([^}]+)}/);
              if (match && match[1]) {
                const credentialName = match[1];
                // Add to credentials if not already present
                if (!extractedCredentials[credentialName]) {
                  extractedCredentials[credentialName] = "";
                }
              }
            }
          });

          return node;
        });
      };

      // Ensure all nodes have a defined type
      const updatedNodes = processNodes(safeTemplateNodes);

      // Set the extracted credentials
      setCredentials(extractedCredentials);

      // Check if credentials are complete (no credentials needed = complete)
      setCredentialsComplete(Object.keys(extractedCredentials).length === 0);
    }
  }, [template, loadWorkflowFromTemplate, templateNodes, templateEdges]);

  // Update credentialsComplete status whenever credentials change
  useEffect(() => {
    const allFilled = Object.values(credentials).every(
      (val) => val.trim() !== ""
    );
    setCredentialsComplete(Object.keys(credentials).length === 0 || allFilled);
  }, [credentials]);

  // Handle credential input changes
  const handleCredentialChange = (key: string, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Launch the Node Configuration Wizard
  const handleLaunchWizard = () => {
    if (!templateNodes || templateNodes.length === 0) {
      toast({
        title: "No nodes to configure",
        description: "This template does not contain any workflow nodes.",
        variant: "destructive",
      });
      return;
    }
    setShowWizard(true);
    console.log("Wizard should now be visible with nodes:", templateNodes);
  };

  // Handle wizard completion
  const handleWizardComplete = (configuredNodes: any[]) => {
    // Save the updated nodes to the store
    loadWorkflowFromTemplate(configuredNodes, edges);

    setShowWizard(false);

    // Show success toast
    toast({
      title: "Nodes configured successfully",
      description: "Your workflow is ready to be activated.",
    });

    // Automatically proceed to save the workflow
    handleSaveWorkflow(configuredNodes);
  };

  // Handle wizard cancellation
  const handleWizardCancel = () => {
    setShowWizard(false);
  };

  // Handle workflow saving
  const handleSaveWorkflow = async (configuredNodes?: any[]) => {
    if (!template) return;

    setIsLoading(true);

    try {
      // Save the workflow
      // Prepare nodes with credential values
      const nodesWithCredentials = (configuredNodes || nodes).map((node) => {
        if (!node.data?.config) return node;

        // Replace credential placeholders with actual values
        const updatedConfig = { ...node.data.config };
        Object.entries(updatedConfig).forEach(([key, value]) => {
          if (typeof value === "string" && value.includes("${")) {
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
            config: updatedConfig,
          },
        };
      });

      const savedWorkflow = await saveWorkflow({
        name: workflowName,
        description: workflowDescription,
        nodes: nodesWithCredentials,
        edges: edges,
      });

      toast({
        title: "Workflow activated successfully",
        description: "Your new workflow is ready to use.",
      });

      // Navigate to the workflow builder
      navigate("/workflows");
    } catch (error) {
      console.error("Error saving workflow:", error);
      toast({
        title: "Failed to activate workflow",
        description:
          "There was an error creating your workflow. Please try again.",
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
      const filledCount = Object.values(credentials).filter(
        (v) => v.trim() !== ""
      ).length;
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

  // Ensure the template includes nodes and edges
  const renderTemplateDetails = (template: WorkflowTemplate) => {
    const service = SERVICE_REGISTRY[template.category];

    if (!service) {
      return <p>No relevant information available for this template.</p>;
    }

    return (
      <div>
        <h2 className="text-xl font-bold">{template.name}</h2>
        <p>{template.description}</p>
        <div className="icon-container">
          <service.icon size={48} />
        </div>
        <ul>
          {service.requiredFields.map((field) => (
            <li key={field}>{field}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Type guard for workflowData
  function isWorkflowData(data: any): data is { nodes: Node<NodeData>[]; edges: Edge[] } {
    return (
      data &&
      Array.isArray(data.nodes) &&
      Array.isArray(data.edges)
    );
  }

  // Render the template details in the component
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      {/* Show wizard overlay when active */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-auto">
          <NodeConfigWizard
            nodes={sanitizeNodes(safeTemplateNodes)}
            onComplete={handleWizardComplete}
            onCancel={handleWizardCancel}
          />
        </div>
      )}

      {/* Hero header with template info */}
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

          {/* Loading, Error, or Template Not Found States */}
          {isTemplateLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  ease: "linear",
                  repeat: Infinity,
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
              <h2 className="text-xl font-semibold text-white mb-2">
                Failed to load template
              </h2>
              <p className="text-blue-100 mb-4">
                We encountered an error while loading the template details.
                Please try again.
              </p>
              <Button
                onClick={() => navigate("/templates")}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/20"
              >
                Return to Templates
              </Button>
            </div>
          ) : !template ? (
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-lg text-center max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-white mb-2">
                Template not found
              </h2>
              <p className="text-blue-100 mb-4">
                We couldn't find the template you're looking for. Please select
                another template.
              </p>
              <Button
                onClick={() => navigate("/templates")}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/20"
              >
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
                  <Badge
                    key={i}
                    className="bg-white/20 hover:bg-white/30 text-white border-none"
                  >
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
                  {credentialsComplete
                    ? "Ready to Launch"
                    : "Configuration Needed"}
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
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Workflow Visualization
                      </h2>
                      <p className="text-gray-600 mb-6">
                        See how data flows between services in this automation
                      </p>

                      <div className="bg-white rounded-lg border border-gray-100 shadow-inner p-6 flex flex-col justify-center items-center">
                        <img
                          src={
                            template.imageUrl ||
                            getTemplatePreviewImage(template)
                          }
                          alt={`${template.name} workflow preview`}
                          className="max-w-full object-contain rounded mb-6"
                          style={{ maxHeight: "320px" }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = defaultTemplatePreview;
                          }}
                        />
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                              <span className="text-sm text-gray-600">
                                Trigger
                              </span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                              <span className="text-sm text-gray-600">
                                Action
                              </span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                              <span className="text-sm text-gray-600">
                                Logic
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600">
                            <span className="font-semibold">
                              {templateNodes.length} nodes
                            </span>{" "}
                            ·{" "}
                            <span className="font-semibold">
                              {templateEdges.length} connections
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border-t border-gray-100">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        How It Works
                      </h3>
                      <div className="space-y-6">
                        {templateNodes.map((node: any, index: number) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">
                                {node.data?.label || node.id}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {node.data?.service &&
                                  `Service: ${node.data.service}`}
                                {node.data?.event &&
                                  ` • Event: ${node.data.event}`}
                                {node.data?.action &&
                                  ` • Action: ${node.data.action}`}
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Component Details
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Technical details of each workflow component
                    </p>

                    <Accordion type="single" collapsible className="w-full">
                      {templateNodes.map((node: any, index: number) => (
                        <AccordionItem
                          key={index}
                          value={`node-${index}`}
                          className="border-b border-gray-100"
                        >
                          <AccordionTrigger className="py-4 text-gray-800 hover:text-indigo-600 hover:no-underline">
                            {node.data?.label || node.id}
                          </AccordionTrigger>
                          <AccordionContent className="bg-gray-50 p-4 rounded-lg">
                            <div className="space-y-3 text-sm">
                              <div className="flex">
                                <span className="font-medium w-32 text-gray-700">
                                  Type:
                                </span>
                                <span className="text-gray-600">
                                  {node.type}
                                </span>
                              </div>
                              {node.data?.service && (
                                <div className="flex">
                                  <span className="font-medium w-32 text-gray-700">
                                    Service:
                                  </span>
                                  <span className="text-gray-600">
                                    {node.data.service}
                                  </span>
                                </div>
                              )}
                              {node.data?.event && (
                                <div className="flex">
                                  <span className="font-medium w-32 text-gray-700">
                                    Event:
                                  </span>
                                  <span className="text-gray-600">
                                    {node.data.event}
                                  </span>
                                </div>
                              )}
                              {node.data?.action && (
                                <div className="flex">
                                  <span className="font-medium w-32 text-gray-700">
                                    Action:
                                  </span>
                                  <span className="text-gray-600">
                                    {node.data.action}
                                  </span>
                                </div>
                              )}

                              {node.data?.config &&
                                Object.keys(node.data.config).length > 0 && (
                                  <div>
                                    <span className="font-medium text-gray-700 block mb-2">
                                      Configuration:
                                    </span>
                                    <div className="bg-white p-3 border border-gray-200 rounded-md">
                                      <ul className="space-y-2">
                                        {Object.entries(node.data.config).map(
                                          ([key, value], i) => (
                                            <li
                                              key={i}
                                              className="flex flex-wrap"
                                            >
                                              <span className="font-medium text-gray-700 mr-2">
                                                {key}:
                                              </span>
                                              {typeof value === "string" &&
                                              value.includes("${") ? (
                                                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                                                  Requires credential
                                                </Badge>
                                              ) : (
                                                <code className="text-xs bg-gray-100 p-1 rounded text-gray-700">
                                                  {typeof value === "object"
                                                    ? JSON.stringify(value)
                                                    : String(value)}
                                                </code>
                                              )}
                                            </li>
                                          )
                                        )}
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
                            className="mt-1 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
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
                            className="mt-1 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
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
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
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

                  {/* Quick help section */}
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md overflow-hidden text-white">
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3">Need Help?</h3>
                      <p className="mb-4 text-blue-100">
                        Confused about where to find your credentials or how to configure this workflow?
                      </p>
                      <div className="space-y-3">
                        <TemplateIntegrationGuide template={template} variant="blue" />
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
