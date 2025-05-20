import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Lightbulb,
  FilePlus,
  Link as LinkIcon,
  Zap,
  Settings,
  Save,
  Play,
} from "lucide-react";
import { useWorkflowStore } from "@/store/useWorkflowStore";
import { NodeType } from "@/types/workflow";
import type { Node, Edge } from "reactflow";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type SuggestionPriority = "high" | "medium" | "low";

export interface Suggestion {
  id: string;
  title: string;
  text: string;
  actionLabel: string;
  priority: SuggestionPriority;
  action: () => void;
}

interface WorkflowSuggestionsProps {
  className?: string;
  nodes: Node[];
  edges: Edge[];
  onAddNode: (nodeType: string) => void;
  onConnect: (sourceId: string, targetId: string) => void;
  onDismiss: (suggestionId: string) => void;
}

export function WorkflowSuggestions({
  className,
  nodes,
  edges,
  onAddNode,
  onConnect,
  onDismiss,
}: WorkflowSuggestionsProps) {
  const { addNode } = useWorkflowStore();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  // Debug: log props and state for troubleshooting
  console.log("[WorkflowSuggestions] nodes:", nodes, "edges:", edges);
  console.log(
    "[WorkflowSuggestions] suggestions:",
    suggestions,
    "currentIndex:",
    currentIndex,
    "visible:",
    visible
  );

  // Helper function to simulate connectNodes method
  const connectNodes = (connParams: {
    id: string;
    source: string;
    target: string;
  }) => {
    onConnect(connParams.source, connParams.target);
  };

  // Helper function to simulate getSelectedNode method
  const getSelectedNode = () => {
    const selectedNodeId = useWorkflowStore.getState().selectedNodeId;
    if (!selectedNodeId) return null;
    return nodes.find((node) => node.id === selectedNodeId) || null;
  };

  // Analyze workflow and generate contextual suggestions
  useEffect(() => {
    const newSuggestions: Suggestion[] = [];

    // Suggestion 1: If there are no nodes, suggest adding a trigger
    if (nodes.length === 0) {
      newSuggestions.push({
        id: "add-trigger",
        title: "Start Your Workflow",
        text: "Every workflow needs a starting point. Add a trigger node to begin your automation process.",
        actionLabel: "Add Trigger",
        priority: "high",
        action: () => {
          onAddNode("trigger");
        },
      });
    }

    // Suggestion 2: If there's only a trigger node, suggest adding an action
    if (nodes.length === 1 && nodes.some((node) => node.type === "trigger")) {
      newSuggestions.push({
        id: "add-action",
        title: "Add an Action",
        text: "Now that you have a trigger, add an action to perform when the trigger activates.",
        actionLabel: "Add Action",
        priority: "high",
        action: () => {
          onAddNode("action");
        },
      });
    }

    // Suggestion 3: If there are disconnected nodes, suggest connecting them
    if (nodes.length >= 2) {
      const connectedNodeIds = new Set<string>();
      edges.forEach((edge) => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      });

      const disconnectedNodes = nodes.filter(
        (node) => !connectedNodeIds.has(node.id)
      );

      if (disconnectedNodes.length > 0) {
        newSuggestions.push({
          id: "connect-nodes",
          title: "Connect Your Nodes",
          text: "Your workflow has disconnected nodes. Connect them to establish the process flow.",
          actionLabel: "Connect Nodes",
          priority: "medium",
          action: () => {
            // Find a trigger node and an action node to connect
            const triggerNode = nodes.find((node) => node.type === "trigger");
            const actionNode = nodes.find(
              (node) =>
                node.type === "action" &&
                !edges.some(
                  (edge) =>
                    edge.source === triggerNode?.id && edge.target === node.id
                )
            );

            if (triggerNode && actionNode) {
              onConnect(triggerNode.id, actionNode.id);
            }
          },
        });
      }
    }

    // Suggestion 4: If there are nodes but no trigger, suggest adding one
    if (nodes.length > 0 && !nodes.some((node) => node.type === "trigger")) {
      newSuggestions.push({
        id: "missing-trigger",
        title: "Add a Trigger",
        text: "Your workflow is missing a trigger node. Every workflow needs a trigger to start the automation.",
        actionLabel: "Add Trigger",
        priority: "high",
        action: () => {
          onAddNode("trigger");
        },
      });
    }

    // Suggestion 5: If there's a complex workflow (many nodes), suggest optimizing
    if (nodes.length >= 5) {
      newSuggestions.push({
        id: "optimize-workflow",
        title: "Optimize Your Workflow",
        text: "Your workflow is getting complex. Consider organizing nodes and adding comments for clarity.",
        actionLabel: "Auto-Arrange",
        priority: "low",
        action: () => {
          // Auto-arrange nodes in a more organized layout
          const arrangedNodes = [...nodes].map((node, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            return {
              ...node,
              position: {
                x: 150 + col * 300,
                y: 150 + row * 200,
              },
            };
          });

          useWorkflowStore.setState({ nodes: arrangedNodes });
        },
      });
    }

    // Suggestion 6: If workflow has nodes but isn't saved, suggest saving
    if (nodes.length > 1) {
      newSuggestions.push({
        id: "save-workflow",
        title: "Save Your Work",
        text: "Your workflow has multiple components. Remember to save it to prevent losing your work.",
        actionLabel: "Save Workflow",
        priority: "medium",
        action: () => {
          // Trigger save workflow action
          console.log("Save workflow triggered from suggestion");
          // This would typically open the save dialog or trigger direct save
        },
      });
    }

    // Suggestion 7: Configure node if a node is selected but not configured
    const selectedNode = getSelectedNode();
    if (
      selectedNode &&
      Object.keys(selectedNode.data.configuration || {}).length === 0
    ) {
      newSuggestions.push({
        id: "configure-node",
        title: "Configure Selected Node",
        text: `Your "${selectedNode.data.label}" node needs configuration before it can work properly.`,
        actionLabel: "Configure",
        priority: "medium",
        action: () => {
          // This would typically open the node configuration panel
          console.log("Configure node triggered from suggestion");
        },
      });
    }

    // Suggestion 8: Test workflow if it has a complete flow
    if (
      nodes.length >= 2 &&
      edges.length >= 1 &&
      nodes.some((node) => node.type === "trigger")
    ) {
      const hasValidFlow = edges.some((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        return sourceNode?.type === "trigger";
      });

      if (hasValidFlow) {
        newSuggestions.push({
          id: "test-workflow",
          title: "Test Your Workflow",
          text: "Your workflow looks ready for testing. Run a test to verify it works as expected.",
          actionLabel: "Test Now",
          priority: "low",
          action: () => {
            // This would trigger the workflow test functionality
            console.log("Test workflow triggered from suggestion");
          },
        });
      }
    }

    if (newSuggestions.length > 0) {
      setSuggestions(newSuggestions);
      setVisible(true);
      setCurrentIndex(0); // Reset to first suggestion
    } else {
      setVisible(false);
    }
  }, [nodes, edges, addNode, connectNodes, getSelectedNode]);

  // Handle suggestion navigation
  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(suggestions.length - 1, prev + 1));
  };

  // Handle closing the suggestion
  const closeSuggestion = () => {
    if (suggestions.length > 0) {
      const currentSuggestion = suggestions[currentIndex];
      onDismiss(currentSuggestion.id);
    }
    setVisible(false);
  };

  // If no suggestions or not visible, don't render
  if (!visible || suggestions.length === 0) return null;

  const currentSuggestion = suggestions[currentIndex];

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 w-80 bg-card rounded-lg shadow-lg border overflow-hidden z-50 transition-all duration-300 transform",
        className,
        {
          "translate-y-0 opacity-100": visible,
          "translate-y-10 opacity-0": !visible,
          "border-l-4 border-l-amber-500":
            currentSuggestion.priority === "high",
          "border-l-4 border-l-blue-500":
            currentSuggestion.priority === "medium",
          "border-l-4 border-l-slate-400": currentSuggestion.priority === "low",
        }
      )}
    >
      <div className="flex items-center justify-between p-3 bg-muted/30">
        <div className="flex items-center space-x-2">
          <div
            className={cn("p-1 rounded-full", {
              "text-amber-500": currentSuggestion.priority === "high",
              "text-blue-500": currentSuggestion.priority === "medium",
              "text-slate-500": currentSuggestion.priority === "low",
            })}
          >
            <Lightbulb size={18} />
          </div>
          <h3 className="font-medium text-sm">{currentSuggestion.title}</h3>
        </div>
        <button
          onClick={closeSuggestion}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-4">
          {currentSuggestion.text}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                    className={cn(
                      "p-1 rounded hover:bg-muted transition-colors",
                      { "opacity-30 cursor-not-allowed": currentIndex === 0 }
                    )}
                  >
                    <ChevronLeft size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Previous suggestion</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <span className="text-xs text-muted-foreground">
              {currentIndex + 1} / {suggestions.length}
            </span>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={goToNext}
                    disabled={currentIndex === suggestions.length - 1}
                    className={cn(
                      "p-1 rounded hover:bg-muted transition-colors",
                      {
                        "opacity-30 cursor-not-allowed":
                          currentIndex === suggestions.length - 1,
                      }
                    )}
                  >
                    <ChevronRight size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Next suggestion</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button
            size="sm"
            onClick={() => currentSuggestion.action()}
            className="flex items-center space-x-1"
          >
            {getSuggestionIcon(currentSuggestion.id)}
            <span>{currentSuggestion.actionLabel}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to get appropriate icon for suggestion action
function getSuggestionIcon(suggestionId: string) {
  switch (suggestionId) {
    case "add-trigger":
    case "missing-trigger":
    case "add-action":
      return <FilePlus size={14} />;
    case "connect-nodes":
      return <LinkIcon size={14} />;
    case "optimize-workflow":
      return <Zap size={14} />;
    case "configure-node":
      return <Settings size={14} />;
    case "save-workflow":
      return <Save size={14} />;
    case "test-workflow":
      return <Play size={14} />;
    default:
      return <Lightbulb size={14} />;
  }
}
