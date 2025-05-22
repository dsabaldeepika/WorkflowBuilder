import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
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
  KeyIcon,
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
import { Node, Edge } from "reactflow";
import { NodeData } from "@/store/useWorkflowStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface TemplateWorkflowSetupProps {
  templateId: string;
}

interface Credentials {
  [key: string]: string;
}

// Add getServiceIcon function
// This function is now generated from all unique service values in seed-nodes.ts
const serviceIconMap: Record<string, JSX.Element> = {
  openai: <Database className="h-5 w-5 text-green-600" />,
  claude: <Database className="h-5 w-5 text-green-600" />,
  gmail: <SiGmail className="h-5 w-5 text-red-600" />,
  webflow: <Layers className="h-5 w-5 text-gray-500" />,
  github: <Layers className="h-5 w-5 text-gray-500" />,
  slack: <SiSlack className="h-5 w-5 text-purple-600" />,
  twitter: <Layers className="h-5 w-5 text-gray-500" />,
  webhook: <Layers className="h-5 w-5 text-gray-500" />,
  http: <Layers className="h-5 w-5 text-gray-500" />,
  database: <Layers className="h-5 w-5 text-gray-500" />,
  aws_s3: <Layers className="h-5 w-5 text-gray-500" />,
  sql_server: <Layers className="h-5 w-5 text-gray-500" />,
  postgresql: <Layers className="h-5 w-5 text-gray-500" />,
  mongodb: <Layers className="h-5 w-5 text-gray-500" />,
  google_drive: <Layers className="h-5 w-5 text-gray-500" />,
  bitbucket: <Layers className="h-5 w-5 text-gray-500" />,
  rss: <Layers className="h-5 w-5 text-gray-500" />,
  azure_blob: <Layers className="h-5 w-5 text-gray-500" />,
  redis: <Layers className="h-5 w-5 text-gray-500" />,
  salesforce: <SiSalesforce className="h-5 w-5 text-blue-500" />,
  clickup: <SiClickup className="h-5 w-5 text-pink-500" />,
  airtable: <SiAirtable className="h-5 w-5 text-yellow-500" />,
  trello: <SiTrello className="h-5 w-5 text-blue-400" />,
  mailchimp: <SiMailchimp className="h-5 w-5 text-yellow-700" />,
  pipedrive: <Layers className="h-5 w-5 text-gray-500" />,
  hubspot: <SiHubspot className="h-5 w-5 text-orange-600" />,
  google_sheets: <SiGooglesheets className="h-5 w-5 text-green-600" />,
  // Add more mappings as needed
};

const getServiceIcon = (serviceName?: string) => {
  if (!serviceName) return <Layers className="h-5 w-5 text-gray-500" />;
  const key = serviceName.replace(/[-_ ]/g, "").toLowerCase();
  // Try direct match, then fallback to original, then fallback to default
  return (
    serviceIconMap[serviceName.toLowerCase()] ||
    serviceIconMap[key] || <Layers className="h-5 w-5 text-gray-500" />
  );
};

type NodeTypeCrudModalProps = {
  nodeIds: string[];
  onClose: () => void;
};

export function NodeTypeCrudModal({
  nodeIds,
  onClose,
}: NodeTypeCrudModalProps) {
  const [selectedNodeId, setSelectedNodeId] = React.useState<string>(
    nodeIds[0] || ""
  );
  const [nodeTypeData, setNodeTypeData] = React.useState<Record<
    string,
    any
  > | null>(null);
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Fetch node type by id
  const fetchNodeType = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/node-types/${id}`);
      if (!res.ok) throw new Error("Failed to fetch node type");
      const data = await res.json();
      setNodeTypeData(data);
      setFormData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setNodeTypeData(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (selectedNodeId) fetchNodeType(selectedNodeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeId]);

  // CRUD handlers
  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/node-types`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create node type");
      await fetchNodeType(selectedNodeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/node-types/${selectedNodeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update node type");
      await fetchNodeType(selectedNodeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/node-types/${selectedNodeId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete node type");
      setNodeTypeData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Form change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Node Type CRUD</DialogTitle>
          <DialogDescription>
            Select a node and perform CRUD operations on its node type.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4">
          <Label>Select Node ID:</Label>
          <select
            value={selectedNodeId}
            onChange={(e) => setSelectedNodeId(e.target.value)}
            className="w-full border rounded p-2 mt-1"
          >
            {nodeIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}
        {nodeTypeData && (
          <div style={{ marginTop: 16 }}>
            {Object.keys(nodeTypeData).map((key) => (
              <div key={key} style={{ marginBottom: 8 }}>
                <Label>{key}</Label>
                <Input
                  name={key}
                  value={formData[key] ?? ""}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>
        )}
        <DialogFooter className="mt-4">
          <Button onClick={handleCreate} disabled={loading}>
            Create
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            Update
          </Button>
          <Button onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
  const [expandedNodes, setExpandedNodes] = useState<{
    [nodeId: string]: boolean;
  }>({});
  const [showCrudModal, setShowCrudModal] = useState(false);

  const { loadWorkflowFromTemplate, saveWorkflow, nodes, edges } =
    useWorkflowStore();

  // Fetch template details
  const {
    data: template,
    isLoading: isTemplateLoading,
    error: templateError,
  } = useTemplate(templateId);

  // Fetch node types from backend
  const {
    data: nodeTypes,
    isLoading: isNodeTypesLoading,
    error: nodeTypesError,
  } = useQuery({
    queryKey: ["/api/node-types"],
    queryFn: async () => {
      const res = await fetch("/api/node-types");
      if (!res.ok) throw new Error("Failed to fetch node types");
      return res.json();
    },
  });

  // Type guard for workflow data
  const isWorkflowData = (
    data: any
  ): data is { nodes: Node<NodeData>[]; edges: Edge[] } => {
    return (
      data &&
      Array.isArray(data.nodes) &&
      Array.isArray(data.edges) &&
      data.nodes.every(
        (node: any) =>
          node &&
          typeof node === "object" &&
          "id" in node &&
          "type" in node &&
          "data" in node
      )
    );
  };

  // Utility to ensure all nodes have a string type and initialize essential data properties
  const sanitizeNodes = useCallback(
    (nodes: Node<NodeData>[]): Node<NodeData>[] => {
      return nodes.map((node: Node<NodeData>) => ({
        ...node,
        type: typeof node.type === "string" ? node.type : "",
        data: {
          // Preserve all existing data properties first
          ...node.data,
          // Ensure essential properties have default values if missing
          service: node.data?.service || "",
          config:
            node.data?.config && typeof node.data.config === "object"
              ? node.data.config
              : {},
          // Add other essential properties with defaults if necessary, e.g.:
          label: node.data?.label || "Unnamed Node",
          event: node.data?.event || "",
          action: node.data?.action || "",
        },
      }));
    },
    []
  );

  // Extract workflow data with proper type checking
  const workflowData =
    template?.workflowData && isWorkflowData(template.workflowData)
      ? template.workflowData
      : { nodes: [], edges: [] };

  const templateNodes = workflowData.nodes;
  const templateEdges = workflowData.edges;
  const safeTemplateNodes = sanitizeNodes(templateNodes);

  // Fetch node type definitions for each node by node_id
  const nodeTypeQueries = useQueries({
    queries: safeTemplateNodes.map((node) => ({
      queryKey: ["/api/node-types/by-node-id", node.id],
      queryFn: async () => {
        const res = await fetch(
          `/api/node-types/by-node-id/${encodeURIComponent(node.id)}`
        );
        if (!res.ok)
          throw new Error(`Failed to fetch node type for node_id ${node.id}`);
        return res.json();
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });

  // Map of node id to node type definition
  const nodeTypeDefs: Record<string, any> = {};
  nodeTypeQueries.forEach((q, idx) => {
    if (q.data && safeTemplateNodes[idx]) {
      nodeTypeDefs[safeTemplateNodes[idx].id] = q.data;
    }
  });

  // Helper to find node type definition by node id
  const getNodeTypeDef = (nodeId: string | undefined) => {
    if (!nodeId) return undefined;
    return nodeTypeDefs[nodeId];
  };

  // Extract required credentials from the template
  useEffect(() => {
    if (!template) return;

    // Prepare workflow name using template name as a base
    setWorkflowName(`${template.name} Workflow`);
    setWorkflowDescription(template.description || "");

    // Load the workflow data into the store and initialize config for the wizard
    if (templateNodes && templateEdges !== undefined) {
      try {
        const parsedNodes =
          typeof templateNodes === "string"
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
        const frontendNodes: Node<NodeData>[] = parsedNodes.map(
          (backendNode: any) => {
            // Extract core properties
            const nodeId = backendNode.id;
            const nodeType = backendNode.type || "default"; // Use backend type, fallback to default
            const nodePosition = backendNode.position || { x: 0, y: 0 }; // Default position

            // Extract and infer data properties based on data.name
            const backendData = backendNode.data || {};
            // Use label from backendData if present, else fallback to name, then id, then 'Unnamed Node'
            const dataLabel =
              backendData.label || backendData.name || nodeId || "Unnamed Node";

            let dataService = "";
            let dataEvent = "";
            let dataAction = "";
            const dataConfig = backendNode.config || backendData.config || {}; // Preserve existing config if any

            // Infer service, event, and action based on backendNodeName (data.name)
            const lowerCaseName = backendData.name?.toLowerCase() || "";

            if (
              lowerCaseName.includes("google sheets") ||
              lowerCaseName.includes("sheet")
            ) {
              dataService = "google-sheets";
              if (lowerCaseName.includes("new row")) dataEvent = "new_row";
              if (
                lowerCaseName.includes("write result") ||
                lowerCaseName.includes("write row")
              )
                dataAction = "write_row";
              // Add more Google Sheets events/actions as needed
            } else if (
              lowerCaseName.includes("claude") ||
              lowerCaseName.includes("openai") ||
              lowerCaseName.includes("completion")
            ) {
              dataService = "openai"; // Map Claude to OpenAI service in frontend
              if (lowerCaseName.includes("completion"))
                dataAction = "completion";
              // Add more OpenAI actions as needed
            } else if (lowerCaseName.includes("slack")) {
              dataService = "slack";
              if (lowerCaseName.includes("send message"))
                dataAction = "send_message";
              // Add more Slack actions as needed
            } else if (lowerCaseName.includes("salesforce")) {
              dataService = "salesforce";
              // Add Salesforce events/actions as needed based on name
            } else if (lowerCaseName.includes("clickup")) {
              dataService = "clickup";
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
          }
        );

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
  }, [
    template,
    templateNodes,
    templateEdges,
    loadWorkflowFromTemplate,
    sanitizeNodes,
    toast,
  ]);

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
  const handleWizardComplete = useCallback(
    (configuredNodes: Node<NodeData>[]) => {
      loadWorkflowFromTemplate(configuredNodes, edges);
      setShowWizard(false);
      toast({
        title: "Nodes configured successfully",
        description: "Your workflow is ready to be activated.",
      });
      handleSaveWorkflow(configuredNodes);
    },
    [loadWorkflowFromTemplate, edges, toast]
  );

  // Handle wizard cancellation
  const handleWizardCancel = useCallback(() => {
    setShowWizard(false);
  }, []);

  // Handle workflow saving
  const handleSaveWorkflow = useCallback(
    async (configuredNodes?: Node<NodeData>[]) => {
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
          description:
            "There was an error creating your workflow. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      template,
      nodes,
      edges,
      credentials,
      workflowName,
      workflowDescription,
      saveWorkflow,
      toast,
      navigate,
    ]
  );

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
            {templateError instanceof Error
              ? templateError.message
              : "Failed to load template"}
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
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold">{template.name}</h1>
                <TemplateIntegrationGuide
                  template={template}
                  variant="gradient"
                />
              </div>
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

                    <div className="space-y-8">
                      {safeTemplateNodes.map((node, index) => {
                        const config =
                          node.data.config &&
                          typeof node.data.config === "object"
                            ? node.data.config
                            : {};
                        const configEntries = Object.entries(config).filter(
                          ([key]) =>
                            typeof config[key] !== "object" &&
                            key !== "input_fields" &&
                            key !== "connection_type" &&
                            key !== "credential_field" &&
                            key !== "requires_connection" &&
                            key !== "schedule"
                        );
                        const isExpanded = expandedNodes[node.id] || false;
                        // Tooltip content for the icon
                        const nodeTypeDef = getNodeTypeDef(node.data.service);
                        const tooltipContent = (
                          <div className="max-w-xs">
                            <div className="font-bold text-base mb-1">
                              {nodeTypeDef?.name || node.data.service}
                            </div>
                            {node.data.action && (
                              <div className="text-xs mb-1">
                                <span className="font-semibold">Action:</span>{" "}
                                {node.data.action}
                              </div>
                            )}
                            {node.data.event && (
                              <div className="text-xs mb-1">
                                <span className="font-semibold">Event:</span>{" "}
                                {node.data.event}
                              </div>
                            )}
                            {nodeTypeDef?.description && (
                              <div className="text-xs mb-1">
                                {nodeTypeDef.description}
                              </div>
                            )}
                            {config.help_link && (
                              <a
                                href={config.help_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 underline"
                              >
                                API Docs
                              </a>
                            )}
                          </div>
                        );
                        return (
                          <motion.div
                            key={node.id}
                            className="border rounded-3xl p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100 shadow-2xl hover:shadow-3xl transition-shadow duration-300 flex flex-col gap-4 relative group items-center animate-fadeIn"
                            whileHover={{ scale: 1.025 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            style={{
                              borderColor: node.data.color || "#a5b4fc",
                            }}
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex flex-col items-center justify-center mb-2 cursor-pointer">
                                    <div
                                      className="rounded-full bg-gradient-to-br from-indigo-200 via-purple-200 to-blue-200 p-6 mb-2 shadow-lg border-4 border-white hover:border-indigo-400 transition-all"
                                      style={{
                                        boxShadow:
                                          "0 8px 32px 0 rgba(99,102,241,0.15)",
                                      }}
                                    >
                                      <span
                                        className="block"
                                        style={{ fontSize: 64 }}
                                      >
                                        {getServiceIcon(node.data.service)}
                                      </span>
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  {tooltipContent}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {/* Badges for type, service, action, event, color */}
                            <div className="flex flex-wrap gap-3 mb-2 justify-center">
                              {node.data.type && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 text-xs text-gray-700 border border-gray-300 cursor-help flex items-center gap-1 shadow-sm">
                                        <Cog className="h-4 w-4 inline" />
                                        {node.type}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>Node Type</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {node.data.service && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-200 to-blue-100 text-xs text-blue-900 border border-blue-300 cursor-help flex items-center gap-1 shadow-sm">
                                        <Database className="h-4 w-4 inline" />
                                        {node.data.service}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>Service</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {node.data.action && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-200 to-purple-100 text-xs text-purple-900 border border-purple-300 cursor-help flex items-center gap-1 shadow-sm">
                                        <Wand2 className="h-4 w-4 inline" />
                                        {node.data.action}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>Action</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {node.data.event && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-green-200 to-green-100 text-xs text-green-900 border border-green-300 cursor-help flex items-center gap-1 shadow-sm">
                                        <Calendar className="h-4 w-4 inline" />
                                        {node.data.event}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>Event</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {node.data.color && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span
                                        className="px-3 py-1 rounded-full border-2"
                                        style={{
                                          background: node.data.color,
                                          color: "#fff",
                                          borderColor: node.data.color,
                                        }}
                                      >
                                        {node.data.color}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>Node Color</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <Separator className="my-2 bg-gradient-to-r from-indigo-200 via-purple-200 to-blue-200 h-1 rounded-full" />
                            {/* Config section with special handling for connect_url/help_link and credentials */}
                            <div className="mb-2 w-full">
                              <div className="font-bold text-sm text-indigo-700 mb-2 tracking-wide">
                                Configuration
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm text-gray-800">
                                {configEntries.map(([key, value]) => {
                                  // Render connect_url/help_link as buttons
                                  if (
                                    key === "connect_url" &&
                                    typeof value === "string"
                                  ) {
                                    return (
                                      <a
                                        key={key}
                                        href={value}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-md hover:from-indigo-600 hover:to-purple-600 transition-colors text-sm font-semibold text-center"
                                      >
                                        🔗 Connect
                                      </a>
                                    );
                                  }
                                  if (
                                    key === "help_link" &&
                                    typeof value === "string"
                                  ) {
                                    return (
                                      <a
                                        key={key}
                                        href={value}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block px-4 py-2 bg-gradient-to-r from-gray-500 to-blue-500 text-white rounded-lg shadow-md hover:from-gray-600 hover:to-blue-600 transition-colors text-sm font-semibold text-center"
                                      >
                                        📖 API Docs
                                      </a>
                                    );
                                  }
                                  // Render credential placeholders as input fields
                                  if (
                                    typeof value === "string" &&
                                    (/^\$\{.+\}$/.test(value) ||
                                      /^\{\{.+\}\}$/.test(value))
                                  ) {
                                    return (
                                      <div
                                        key={key}
                                        className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 rounded-lg px-3 py-2 shadow-sm animate-pulse"
                                      >
                                        <span className="font-semibold capitalize text-yellow-900">
                                          <KeyIcon className="h-5 w-5 inline mr-1 text-yellow-500" />
                                          {key}:
                                        </span>
                                        <Input
                                          className="w-40 text-sm border-2 border-yellow-400 focus:border-yellow-600 focus:ring-yellow-200 bg-yellow-100 placeholder-yellow-400 rounded-lg"
                                          placeholder={key
                                            .replace(/_/g, " ")
                                            .replace(/\b\w/g, (l) =>
                                              l.toUpperCase()
                                            )}
                                          type="text"
                                          // onChange={...} // You can wire this up to state if you want to collect input
                                        />
                                        <span
                                          title="Credential or template value required"
                                          className="text-yellow-500"
                                        >
                                          <KeyIcon className="h-4 w-4" />
                                        </span>
                                      </div>
                                    );
                                  }
                                  // Default: show as label/value
                                  return (
                                    <div
                                      key={key}
                                      className="flex items-center gap-2 bg-white/80 rounded-lg px-3 py-2 shadow-sm border border-gray-200"
                                    >
                                      <span className="font-semibold capitalize text-gray-800">
                                        {key}:
                                      </span>
                                      <span
                                        className="truncate"
                                        title={String(value)}
                                      >
                                        {String(value)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <button
                              className="text-xs text-indigo-600 hover:underline mt-2 self-start focus:outline-none"
                              onClick={() =>
                                setExpandedNodes((prev) => ({
                                  ...prev,
                                  [node.id]: !isExpanded,
                                }))
                              }
                              aria-expanded={isExpanded}
                            >
                              {isExpanded
                                ? "Hide Advanced Details"
                                : "Show Advanced Details"}
                            </button>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 border border-gray-200 text-xs text-gray-600 shadow-inner animate-fadeIn"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                >
                                  <div className="flex flex-wrap gap-6">
                                    <div>
                                      <span className="font-semibold">ID:</span>{" "}
                                      {node.id}
                                    </div>
                                    {node.position && (
                                      <div>
                                        <span className="font-semibold">
                                          Position:
                                        </span>{" "}
                                        {node.position.x}, {node.position.y}
                                      </div>
                                    )}
                                    {node.data.icon && (
                                      <div>
                                        <span className="font-semibold">
                                          Icon:
                                        </span>{" "}
                                        {node.data.icon}
                                      </div>
                                    )}
                                    {node.data.nodeType && (
                                      <div>
                                        <span className="font-semibold">
                                          Node Type:
                                        </span>{" "}
                                        {node.data.nodeType}
                                      </div>
                                    )}
                                    {node.data.category && (
                                      <div>
                                        <span className="font-semibold">
                                          Category:
                                        </span>{" "}
                                        {node.data.category}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
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
                        <Label
                          htmlFor="workflow-name"
                          className="text-gray-700"
                        >
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
                        <Label
                          htmlFor="workflow-description"
                          className="text-gray-700"
                        >
                          Description (optional)
                        </Label>
                        <Input
                          id="workflow-description"
                          value={workflowDescription}
                          onChange={(e) =>
                            setWorkflowDescription(e.target.value)
                          }
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
                      onClick={() => setShowCrudModal(true)}
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
                    {showCrudModal && (
                      <NodeTypeCrudModal
                        nodeIds={safeTemplateNodes.map((n) => n.id)}
                        onClose={() => setShowCrudModal(false)}
                      />
                    )}
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
