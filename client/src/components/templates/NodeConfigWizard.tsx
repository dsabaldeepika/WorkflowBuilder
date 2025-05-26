import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Step, Stepper } from '@/components/ui/stepper';
// Note: We created the stepper component but aren't using it in this wizard yet
import { Separator } from "@/components/ui/separator";
import { GoogleSheetsConnector } from "@/components/integration/GoogleSheetsConnector";
import { ConnectionManager } from "@/components/integration/ConnectionManager";
import {
  AlertCircle,
  Check,
  ChevronRight,
  AlertTriangle,
  Database,
  Info,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SiGooglesheets, SiHubspot, SiFacebook, SiSlack } from "react-icons/si";
import { Layers } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Node } from "reactflow";
import { NodeData, isNodeData, NodeConfig } from "@/types/workflow";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { useQuery, useQueries } from "@tanstack/react-query";
import logger from "@/utils/logger";
import { useNodeConfig } from '@/hooks/useNodeConfig';
import { useNodeValidation } from '@/hooks/useNodeValidation';

// To add a new connector, import it here:
// import { HubspotConnector } from "@/components/integration/HubspotConnector";
// import { FacebookConnector } from "@/components/integration/FacebookConnector";
// ...

// Map service names to connector React components
const connectorComponentMap: Record<string, React.ComponentType<any>> = {
  google_sheets: GoogleSheetsConnector,
  // hubspot: HubspotConnector, // Uncomment when implemented
  // facebook: FacebookConnector, // Uncomment when implemented
  // slack: SlackConnector, // Uncomment when implemented
  // Add more mappings as you implement connectors
};

// Map service names to icon components (for display purposes only)
const iconComponentMap: Record<string, React.ComponentType<any>> = {
  google_sheets: SiGooglesheets,
  hubspot: SiHubspot,
  facebook: SiFacebook,
  slack: SiSlack,
  // Add more mappings as needed
};

interface NodeConfigWizardProps {
  nodes: Node<NodeData>[];
  onComplete: (nodes: Node<NodeData>[]) => Promise<void>;
  onCancel: () => void;
}

interface ValidationError {
  nodeId: string;
  field: string;
  message: string;
}

// Helper function to validate node structure with error handling
const isValidNode = (node: Node<NodeData>): boolean => {
  try {
    return isNodeData(node.data);
  } catch (error) {
    logger.error("Error validating node", 
      error instanceof Error ? error : new Error(String(error)),
      { node }
    );
    return false;
  }
};

// Helper to fetch node type definition by backend node type id (prefer backendId if present)
async function fetchNodeTypeByBackendId(node: Node<NodeData>) {
  const backendId = node.data?.backendId;
  const idToFetch = backendId || node.id;
  
  try {
    logger.api.request("GET", `/api/workflow/node-types/${idToFetch}`);
    const res = await fetch(`/api/workflow/node-types/${encodeURIComponent(idToFetch)}`);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(errorData.message || `Failed to fetch node type for ${idToFetch}`);
      logger.api.error("GET", `/api/workflow/node-types/${idToFetch}`, error);
      throw error;
    }

    const data = await res.json();
    logger.api.response("GET", `/api/workflow/node-types/${idToFetch}`, res.status, data);
    return data;
  } catch (error) {
    logger.error(`Error fetching node type for ${idToFetch}:`, error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

export function NodeConfigWizard({
  nodes,
  onComplete,
  onCancel,
}: NodeConfigWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [configNodes, setConfigNodes] = useState<Node<NodeData>[]>(nodes);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Get node configurations
  const { nodeConfigs, isLoading: isLoadingConfigs } = useNodeConfig({});

  // Get validation helpers
  const { validateNodeConfig } = useNodeValidation({
    onValidationError: (error) => {
      toast({
        title: 'Validation Error',
        description: error,
        variant: 'destructive',
      });
    },
  });

  // Helper to get node type definition
  const getNodeTypeDef = useCallback((nodeId: string) => {
    const node = configNodes.find(n => n.id === nodeId);
    if (!node || !node.data || !node.data.backendId) return null;
    return nodeConfigs.find(config => config.id === node.data.backendId.toString());
  }, [configNodes, nodeConfigs]);

  // Log component mount
  useEffect(() => {
    logger.component.mount("NodeConfigWizard", { nodesCount: nodes.length });
    return () => {
      logger.component.unmount("NodeConfigWizard");
    };
  }, [nodes.length]);

  // Initialize configNodes state and validate nodes on mount
  useEffect(() => {
    const validNodes = nodes.filter(isNodeData);

    if (validNodes.length !== nodes.length) {
      logger.warn("Invalid nodes detected", {
        totalNodes: nodes.length,
        validNodes: validNodes.length,
        invalidNodes: nodes.length - validNodes.length
      });
      toast({
        title: "Invalid Node Configuration",
        description: "Some nodes have invalid configuration. They will be skipped.",
        variant: "destructive",
      });
    }

    // Initialize config object for each valid node
    const nodesWithInitializedConfig = validNodes.map((node: Node<NodeData>) => {
      const nodeConfig = nodeConfigs.find(config => config.id === node.data?.backendId?.toString());
      
      if (!nodeConfig) {
        logger.warn(`No configuration found for node ${node.id}`, {
          nodeId: node.id,
          backendId: node.data?.backendId
        });
        return node;
      }

      const initialConfig = { ...node.data?.config };
      
      // Initialize required fields with default values
      nodeConfig.inputFields.forEach((field) => {
        if (!(field.name in initialConfig)) {
          if (field.defaultValue !== undefined) {
            initialConfig[field.name] = field.defaultValue;
          } else if (field.type === "boolean") {
            initialConfig[field.name] = false;
          } else if (field.type === "number") {
            initialConfig[field.name] = 0;
          } else if (field.validation?.options?.length) {
            initialConfig[field.name] = field.validation.options[0];
          } else {
            initialConfig[field.name] = "";
          }
        }
      });

      logger.debug(`Initialized config for node ${node.id}`, {
        nodeId: node.id,
        nodeType: node.type,
        config: initialConfig
      });

      return {
        ...node,
        data: {
          ...node.data,
          config: initialConfig,
        },
      };
    });

    setConfigNodes(nodesWithInitializedConfig);
  }, [nodes, nodeConfigs, toast]);

  // Reset validation errors when current step changes
  useEffect(() => {
    setValidationErrors([]);
  }, [currentStep]);

  // Validate current node configuration
  const validateCurrentNode = useCallback(() => {
    try {
      const currentNode = configNodes[currentStep];
      logger.debug("Validating current node", {
        nodeId: currentNode?.id,
        step: currentStep
      });

      if (!currentNode || !isValidNode(currentNode)) {
        const error = {
          nodeId: currentNode?.id || "unknown",
          field: "node",
          message: "Invalid node structure"
        };
        setValidationErrors([error]);
        logger.error("Node validation failed", new Error(error.message), {
          node: currentNode,
          error
        });
        return false;
      }

      const nodeTypeDef = getNodeTypeDef(currentNode.id);

      if (!nodeTypeDef) {
        const error = {
          nodeId: currentNode.id,
          field: "service",
          message: "Invalid service configuration"
        };
        setValidationErrors([error]);
        logger.error("Node type definition not found", new Error(error.message), {
          nodeId: currentNode.id
        });
        return false;
      }

      const validationResult = validateNodeConfig(currentNode, nodeTypeDef);
      
      if (!validationResult.isValid) {
        setValidationErrors([{
          nodeId: currentNode.id,
          field: "validation",
          message: validationResult.message || "Validation failed"
        }]);
        return false;
      }

      return true;
    } catch (error) {
      logger.error("Unexpected error during node validation", 
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }, [configNodes, currentStep, validateNodeConfig, getNodeTypeDef]);

  // Handle completion
  const handleComplete = useCallback(async () => {
    try {
      logger.info("Initiating workflow configuration completion", {
        nodesCount: configNodes.length
      });

      setIsSubmitting(true);

      if (validateCurrentNode()) {
        logger.debug("Configuration validation successful, completing setup", {
          nodes: configNodes.map(node => ({
            id: node.id,
            type: node.type,
            configFields: Object.keys(node.data?.config || {})
          }))
        });

        await onComplete(configNodes);

        logger.info("Workflow configuration completed successfully", {
          nodesCount: configNodes.length
        });
      } else {
        logger.warn("Configuration completion validation failed", {
          errors: validationErrors,
          currentNode: configNodes[currentStep]
        });
        toast({
          title: "Validation Error",
          description: "Please fix all errors before completing the configuration.",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error("Error completing configuration", 
        error instanceof Error ? error : new Error(String(error)),
        { currentStep, nodeId: configNodes[currentStep]?.id }
      );
      toast({
        title: "Error",
        description: "Failed to complete configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [configNodes, onComplete, validateCurrentNode, currentStep, validationErrors, toast]);

  // Handle next step
  const handleNext = useCallback(() => {
    if (validateCurrentNode()) {
      if (currentStep === configNodes.length - 1) {
        setShowReview(true);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  }, [currentStep, configNodes.length, validateCurrentNode]);

  // Handle back step
  const handleBack = useCallback(() => {
    if (showReview) {
      setShowReview(false);
    } else {
      setCurrentStep((prev) => Math.max(0, prev - 1));
    }
  }, [showReview]);

  // Handle field change
  const handleFieldChange = useCallback((
    nodeId: string,
    field: string,
    value: any
  ) => {
    setConfigNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                config: {
                  ...node.data?.config,
                  [field]: value,
                },
              },
            }
          : node
      )
    );
  }, []);

  // Loading state
  if (isLoadingConfigs) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Loading Node Configurations
          </h3>
          <p className="text-sm text-gray-500">
            Please wait while we load the node configurations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Wizard content here - implement the UI based on your design */}
      </div>
    </div>
  );
}
