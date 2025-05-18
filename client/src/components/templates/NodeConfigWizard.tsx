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
import { SERVICE_REGISTRY } from "./serviceRegistry";
import { Label } from "@/components/ui/label";

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
    typeof node === 'object' &&
    'id' in node &&
    'type' in node &&
    'data' in node &&
    typeof node.data === 'object' &&
    node.data !== null &&
    'label' in node.data
  );
};

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

  // Initialize configNodes state and validate nodes on mount
  useEffect(() => {
    const validNodes = nodes.filter(isValidNode);

    if (validNodes.length !== nodes.length) {
      toast({
        title: "Invalid Node Configuration",
        description: "Some nodes have invalid configuration. They will be skipped.",
        variant: "destructive",
      });
    }

    // Initialize config object for each valid node based on SERVICE_REGISTRY
    const nodesWithInitializedConfig = validNodes.map((node: Node<NodeData>) => {
      const serviceDefinition = node.data?.service ? SERVICE_REGISTRY[node.data.service] : undefined;
      const initialConfig: any = { ...node.data?.config }; // Start with existing config values

      if (serviceDefinition?.fields) {
        serviceDefinition.fields.forEach(field => {
          if (!(field.name in initialConfig)) {
            // Initialize field with a default value if not present
            if (field.type === 'boolean') {
              initialConfig[field.name] = false;
            } else if (field.type === 'number') {
              initialConfig[field.name] = 0; // Or field.min if available
            } else if (field.options && field.options.length > 0) {
                initialConfig[field.name] = field.options[0].value; // Default to first option
            } else {
              initialConfig[field.name] = ''; // Default to empty string for text/textarea/select without options
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
    });

    setConfigNodes(nodesWithInitializedConfig);

  }, [nodes, toast]);

  // Reset validation errors when current step changes
  useEffect(() => {
    setValidationErrors([]);
  }, [currentStep]);

  // Validate current node configuration
  const validateCurrentNode = useCallback(() => {
    const currentNode = configNodes[currentStep];
    if (!currentNode || !isValidNode(currentNode)) {
      setValidationErrors([{
        nodeId: currentNode?.id || 'unknown',
        field: 'node',
        message: 'Invalid node structure'
      }]);
      return false;
    }

    const errors: ValidationError[] = [];
    const service = currentNode.data.service ? SERVICE_REGISTRY[currentNode.data.service] : null;

    if (!service) {
      errors.push({
        nodeId: currentNode.id,
        field: "service",
        message: "Invalid service configuration",
      });
      setValidationErrors(errors);
      return false;
    }

    // Validate required fields
    if (service.requiredFields) {
      service.requiredFields.forEach((field) => {
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
    if (service.fieldValidations) {
      Object.entries(service.fieldValidations).forEach(([field, validation]) => {
        const value = currentNode.data.config?.[field];
        if (value !== undefined) {
          if (validation.type === "number") {
            const numValue = Number(value);
            if (isNaN(numValue)) {
              errors.push({
                nodeId: currentNode.id,
                field,
                message: `${field} must be a number`,
              });
            } else {
              if (validation.min !== undefined && numValue < validation.min) {
                errors.push({
                  nodeId: currentNode.id,
                  field,
                  message: `${field} must be at least ${validation.min}`,
                });
              }
              if (validation.max !== undefined && numValue > validation.max) {
                errors.push({
                  nodeId: currentNode.id,
                  field,
                  message: `${field} must be at most ${validation.max}`,
                });
              }
            }
          } else if (validation.type === "string") {
            if (validation.minLength && value.length < validation.minLength) {
              errors.push({
                nodeId: currentNode.id,
                field,
                message: `${field} must be at least ${validation.minLength} characters`,
              });
            }
            if (validation.maxLength && value.length > validation.maxLength) {
              errors.push({
                nodeId: currentNode.id,
                field,
                message: `${field} must be at most ${validation.maxLength} characters`,
              });
            }
            if (validation.pattern && !validation.pattern.test(value)) {
              errors.push({
                nodeId: currentNode.id,
                field,
                message: validation.message || `${field} has invalid format`,
              });
            }
          }
        }
      });
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
          description: "Please fix all errors before completing the configuration.",
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

  // Get current node
  const currentNode = configNodes[currentStep];
  const service = currentNode?.data?.service ? SERVICE_REGISTRY[currentNode.data.service] : null;

  // Render loading state
  if (!currentNode || !service) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Invalid node configuration. Please try again.
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
              {service.icon && <service.icon className="h-6 w-6 text-gray-600" />}
            <div>
                <h3 className="font-medium text-gray-900">{service.name}</h3>
                <p className="text-sm text-gray-600">{service.description}</p>
              </div>
            </div>
          </div>

          {/* Configuration Fields */}
          <div className="space-y-4">
            {service.fields?.map((field) => {
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
                        {field.options?.map((option) => (
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
                        onCheckedChange={(checked) =>
                          handleConfigChange(field.name, checked)
                        }
                      />
                      <Label htmlFor={field.name} className="text-sm text-gray-600">
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
