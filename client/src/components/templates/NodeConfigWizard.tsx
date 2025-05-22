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
import { NodeData } from "@/store/useWorkflowStore";
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

// Add more imports for other connectors as you create them, e.g.:
// import { GmailConnector } from "@/components/integration/GmailConnector";
// import { SlackConnector } from "@/components/integration/SlackConnector";
// ...

// Map service names to connector React components
const connectorComponentMap: Record<string, React.ComponentType<any>> = {
  google_sheets: GoogleSheetsConnector,
  // gmail: GmailConnector,
  // slack: SlackConnector,
  // Add more mappings as you implement connectors
};

// Map service names to icon components (from backend nodeTypeDef.icon if available, else fallback)
const iconComponentMap: Record<string, React.ComponentType<any>> = {
  google_sheets: SiGooglesheets,
  hubspot: SiHubspot,
  facebook: SiFacebook,
  slack: SiSlack,
  // Add more mappings as needed
};

interface NodeConfigWizardProps {
  nodes: Node<NodeData>[];
  onComplete: (nodes: Node<NodeData>[]) => void;
  onCancel: () => void;
}

interface ValidationError {
  nodeId: string;
  field: string;
  message: string;
}

// Helper function to validate node structure
const isValidNode = (node: Node<NodeData>): boolean => {
  return (
    node &&
    typeof node === "object" &&
    "id" in node &&
    "type" in node &&
    "data" in node &&
    typeof node.data === "object" &&
    node.data !== null &&
    "label" in node.data
  );
};

// Helper to fetch node type definition by backend node type id (prefer backendId if present)
async function fetchNodeTypeByBackendId(node: Node<NodeData>) {
  // Prefer backendId if present in node.data
  const backendId = node.data?.backendId;
  const idToFetch = backendId || node.id;
  const res = await fetch(`/api/node-types/${encodeURIComponent(idToFetch)}`);
  if (!res.ok) throw new Error(`Failed to fetch node type for ${idToFetch}`);
  return res.json();
}

export function NodeConfigWizard({
  nodes,
  onComplete,
  onCancel,
}: NodeConfigWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [configNodes, setConfigNodes] = useState<Node<NodeData>[]>(nodes);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Get unique node ids from nodes
  const uniqueNodeIds = Array.from(
    new Set(nodes.map((node) => node.id).filter(Boolean))
  );

  // Fetch node type definitions for each unique node (prefer backendId)
  const nodeTypeQueries = useQueries({
    queries: uniqueNodeIds.map((id) => {
      const node = nodes.find((n) => n.id === id);
      return {
        queryKey: ["/api/node-types", id, node?.data?.backendId],
        queryFn: () =>
          node ? fetchNodeTypeByBackendId(node) : Promise.reject("Node not found"),
        staleTime: 5 * 60 * 1000,
      };
    }),
  });

  // Map of node id to node type definition
  const nodeTypeDefs: Record<string, any> = {};
  nodeTypeQueries.forEach((q, idx) => {
    if (q.data && uniqueNodeIds[idx]) {
      nodeTypeDefs[uniqueNodeIds[idx]!] = q.data;
    }
  });

  // Helper to find node type definition by node id
  const getNodeTypeDef = (nodeId: string | undefined) => {
    if (!nodeId) return undefined;
    return nodeTypeDefs[nodeId];
  };

  // Loading and error states for node type queries
  const isNodeTypesLoading = nodeTypeQueries.some((q) => q.isLoading);
  const nodeTypesError = nodeTypeQueries.find((q) => q.error)?.error;

  // Initialize configNodes state and validate nodes on mount
  useEffect(() => {
    if (!nodeTypesError) return;
    const validNodes = nodes.filter(isValidNode);

    if (validNodes.length !== nodes.length) {
      toast({
        title: "Invalid Node Configuration",
        description:
          "Some nodes have invalid configuration. They will be skipped.",
        variant: "destructive",
      });
    }

    // Initialize config object for each valid node based on nodeTypes from backend
    const nodesWithInitializedConfig = validNodes.map(
      (node: Node<NodeData>) => {
        const nodeTypeDef = getNodeTypeDef(node.id);
        const initialConfig: any = { ...node.data?.config };
        if (nodeTypeDef?.inputFields) {
          nodeTypeDef.inputFields.forEach((field: any) => {
            if (!(field.name in initialConfig)) {
              if (field.type === "boolean") {
                initialConfig[field.name] = false;
              } else if (field.type === "number") {
                initialConfig[field.name] = 0;
              } else if (field.options && field.options.length > 0) {
                initialConfig[field.name] = field.options[0].value;
              } else {
                initialConfig[field.name] = "";
              }
            }
          });
        }
        return {
          ...node,
          data: {
            ...node.data,
            config: initialConfig,
          },
        };
      }
    );
    setConfigNodes(nodesWithInitializedConfig);
  }, [nodes, nodeTypesError, toast]);

  // Reset validation errors when current step changes
  useEffect(() => {
    setValidationErrors([]);
  }, [currentStep]);

  // Validate current node configuration
  const validateCurrentNode = useCallback(() => {
    const currentNode = configNodes[currentStep];
    if (!currentNode || !isValidNode(currentNode)) {
      setValidationErrors([
        {
          nodeId: currentNode?.id || "unknown",
          field: "node",
          message: "Invalid node structure",
        },
      ]);
      return false;
    }

    const errors: ValidationError[] = [];
    const nodeTypeDef = getNodeTypeDef(currentNode.id);

    if (!nodeTypeDef) {
      errors.push({
        nodeId: currentNode.id,
        field: "service",
        message: "Invalid service configuration",
      });
      setValidationErrors(errors);
      return false;
    }

    // Validate required fields
    if (nodeTypeDef.requiredFields) {
      nodeTypeDef.requiredFields.forEach((field: any) => {
        const value = currentNode.data.config?.[field];
        if (!value || (typeof value === "string" && value.trim() === "")) {
          errors.push({
            nodeId: currentNode.id,
            field,
            message: `${field} is required`,
          });
        }
      });
    }

    // Validate field types and constraints
    if (nodeTypeDef.fieldValidations) {
      Object.entries(nodeTypeDef.fieldValidations).forEach(
        ([field, validation]) => {
          const value = currentNode.data.config?.[field];
          const v = validation as any;
          if (value !== undefined) {
            if (v.type === "number") {
              const numValue = Number(value);
              if (isNaN(numValue)) {
                errors.push({
                  nodeId: currentNode.id,
                  field,
                  message: `${field} must be a number`,
                });
              } else {
                if (v.min !== undefined && numValue < v.min) {
                  errors.push({
                    nodeId: currentNode.id,
                    field,
                    message: `${field} must be at least ${v.min}`,
                  });
                }
                if (v.max !== undefined && numValue > v.max) {
                  errors.push({
                    nodeId: currentNode.id,
                    field,
                    message: `${field} must be at most ${v.max}`,
                  });
                }
              }
            } else if (v.type === "string") {
              if (v.minLength && value.length < v.minLength) {
                errors.push({
                  nodeId: currentNode.id,
                  field,
                  message: `${field} must be at least ${v.minLength} characters`,
                });
              }
              if (v.maxLength && value.length > v.maxLength) {
                errors.push({
                  nodeId: currentNode.id,
                  field,
                  message: `${field} must be at most ${v.maxLength} characters`,
                });
              }
              if (v.pattern && !v.pattern.test(value)) {
                errors.push({
                  nodeId: currentNode.id,
                  field,
                  message: v.message || `${field} has invalid format`,
                });
              }
            }
          }
        }
      );
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [configNodes, currentStep]);

  // Handle configuration changes
  const handleConfigChange = useCallback(
    (field: string, value: any) => {
      setConfigNodes((prev) =>
        prev.map((node, index) => {
          if (index === currentStep) {
            return {
              ...node,
              data: {
                ...node.data,
                config: {
                  ...node.data.config,
                  [field]: value,
                },
              },
            };
          }
          return node;
        })
      );
    },
    [currentStep]
  );

  // Handle next step
  const handleNext = useCallback(() => {
    if (validateCurrentNode()) {
      if (currentStep < configNodes.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleComplete();
      }
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before proceeding.",
        variant: "destructive",
      });
    }
  }, [currentStep, configNodes.length, validateCurrentNode, toast]);

  // Handle previous step
  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  // Handle completion
  const handleComplete = useCallback(async () => {
    setIsSubmitting(true);
    try {
      if (validateCurrentNode()) {
        onComplete(configNodes);
      } else {
        toast({
          title: "Validation Error",
          description:
            "Please fix all errors before completing the configuration.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error completing configuration:", error);
      toast({
        title: "Error",
        description: "Failed to complete configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [configNodes, onComplete, toast, validateCurrentNode]);

  // Helper to render the connector for a node if available
  const renderConnector = (service: string, nodeTypeDef: any, config: any) => {
    // Prefer backend-provided connect_url or connectorComponent
    if (nodeTypeDef?.connect_url) {
      return (
        <a
          href={nodeTypeDef.connect_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-md hover:from-indigo-600 hover:to-purple-600 transition-colors text-sm font-semibold text-center mb-2"
        >
          Connect to {nodeTypeDef.name || service}
        </a>
      );
    }
    // If a custom connector component exists, render it
    const Connector = connectorComponentMap[service];
    if (Connector) {
      return <Connector config={config} />;
    }
    // Fallback: show nothing
    return null;
  };

  // Helper to render the icon (backend-driven: URL, SVG, or fallback)
  const renderIcon = (nodeTypeDef: any) => {
    if (!nodeTypeDef) return <Layers className="h-6 w-6 text-gray-600" />;
    if (nodeTypeDef.icon && typeof nodeTypeDef.icon === "string") {
      // If icon is a URL or SVG string
      if (nodeTypeDef.icon.startsWith("http") || nodeTypeDef.icon.startsWith("/")) {
        return (
          <img
            src={nodeTypeDef.icon}
            alt={nodeTypeDef.name || "icon"}
            className="h-6 w-6 object-contain"
          />
        );
      }
      // If icon is an SVG string
      if (nodeTypeDef.icon.startsWith("<svg")) {
        return (
          <span
            className="h-6 w-6 inline-block"
            dangerouslySetInnerHTML={{ __html: nodeTypeDef.icon }}
          />
        );
      }
    }
    // Fallback to iconComponentMap or default
    if (iconComponentMap[nodeTypeDef.service]) {
      return React.createElement(iconComponentMap[nodeTypeDef.service], {
        className: "h-6 w-6 text-gray-600",
      });
    }
    return <Layers className="h-6 w-6 text-gray-600" />;
  };

  // Get current node
  const currentNode = configNodes[currentStep];
  // Use backend node type definition
  const nodeTypeDef = getNodeTypeDef(currentNode?.id);

  // Loading and error states for node types
  if (isNodeTypesLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
          Loading node types...
        </div>
      </div>
    );
  }
  if (nodeTypesError) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center text-red-600">
          Failed to load node types: {String(nodeTypesError)}
        </div>
      </div>
    );
  }
  if (!currentNode || !nodeTypeDef) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Invalid node configuration. Unknown or missing node type:{" "}
              {currentNode?.data?.name}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-end">
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render the wizard
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Configure {currentNode.data.label}
          </h2>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Service Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              {renderIcon(nodeTypeDef)}
              <div>
                <h3 className="font-medium text-gray-900">
                  {nodeTypeDef.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {nodeTypeDef.description}
                </p>
                {/* Render connector if available and relevant */}
                {renderConnector(
                  nodeTypeDef.service,
                  nodeTypeDef,
                  currentNode.data.config
                )}
              </div>
            </div>
          </div>

          {/* Configuration Fields */}
          <div className="space-y-4">
            {nodeTypeDef.inputFields?.map((field: any) => {
              const error = validationErrors.find(
                (e) => e.nodeId === currentNode.id && e.field === field.name
              );

              return (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name} className="text-gray-700">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>

                  {field.type === "select" ? (
                    <Select
                      value={currentNode.data.config?.[field.name] || ""}
                      onValueChange={(value) =>
                        handleConfigChange(field.name, value)
                      }
                    >
                      <SelectTrigger
                        id={field.name}
                        className={error ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option: any) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      value={currentNode.data.config?.[field.name] || ""}
                      onChange={(e) =>
                        handleConfigChange(field.name, e.target.value)
                      }
                      placeholder={field.placeholder}
                      className={error ? "border-red-500" : ""}
                    />
                  ) : field.type === "boolean" ? (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={field.name}
                        checked={!!currentNode.data.config?.[field.name]}
                        onCheckedChange={(checked: boolean) =>
                          handleConfigChange(field.name, checked)
                        }
                      />
                      <Label
                        htmlFor={field.name}
                        className="text-sm text-gray-600"
                      >
                        {field.placeholder}
                      </Label>
                    </div>
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type || "text"}
                      value={currentNode.data.config?.[field.name] || ""}
                      onChange={(e) =>
                        handleConfigChange(
                          field.name,
                          field.type === "number"
                            ? Number(e.target.value)
                            : e.target.value
                        )
                      }
                      placeholder={field.placeholder}
                      className={error ? "border-red-500" : ""}
                    />
                  )}

                  {error && (
                    <p className="text-sm text-red-500">{error.message}</p>
                  )}
                  {field.help && (
                    <p className="text-sm text-gray-500">{field.help}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              onClick={handlePrevious}
              variant="outline"
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <div className="flex gap-2">
              <Button onClick={onCancel} variant="outline">
                Cancel
              </Button>
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </>
                ) : currentStep === configNodes.length - 1 ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Complete
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
