import React, { useCallback, useState, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/store/useWorkflowStore';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Download, Upload, FileUp, Play, CheckSquare, Zap, Trash, Info } from 'lucide-react';

// Function to download workflow as JSON
export function downloadJSONFile(data: any, filename: string = 'workflow.json'): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  URL.revokeObjectURL(url);
}

// Function to read a JSON file
export async function uploadJSONFile(): Promise<any> {
  return new Promise((resolve, reject) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          resolve(json);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    };
    
    fileInput.click();
  });
}

// Component for workflow manipulation controls
export const WorkflowControls: React.FC<{
  nodes: Node<NodeData>[];
  edges: Edge[];
  onSave?: () => void;
  onLoad?: (nodes: Node<NodeData>[], edges: Edge[]) => void;
  onClear?: () => void;
  onValidate?: () => void;
  showInfoPanel?: () => void;
}> = ({ 
  nodes, 
  edges, 
  onSave, 
  onLoad, 
  onClear,
  onValidate,
  showInfoPanel
}) => {
  const [showClearDialog, setShowClearDialog] = useState(false);
  
  // Handle saving workflow
  const handleSave = useCallback(() => {
    if (nodes.length === 0) {
      toast({
        title: 'Nothing to save',
        description: 'Add some nodes to your workflow first.',
        variant: 'destructive',
      });
      return;
    }
    
    const workflowData = {
      nodes,
      edges,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };
    
    downloadJSONFile(workflowData, 'pumpflux-workflow.json');
    
    toast({
      title: 'Workflow Saved',
      description: 'Your workflow has been exported as a JSON file.',
    });
    
    if (onSave) onSave();
  }, [nodes, edges, onSave]);
  
  // Handle loading workflow
  const handleLoad = useCallback(async () => {
    try {
      const data = await uploadJSONFile();
      
      if (!data.nodes || !data.edges) {
        toast({
          title: 'Invalid Workflow File',
          description: 'The file does not contain valid workflow data.',
          variant: 'destructive',
        });
        return;
      }
      
      if (onLoad) {
        onLoad(data.nodes, data.edges);
        
        toast({
          title: 'Workflow Loaded',
          description: `Loaded workflow with ${data.nodes.length} nodes.`,
          variant: 'success',
        });
      }
    } catch (error) {
      toast({
        title: 'Error Loading Workflow',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  }, [onLoad]);
  
  // Handle clearing workflow
  const handleClearConfirm = useCallback(() => {
    if (onClear) onClear();
    setShowClearDialog(false);
    
    toast({
      title: 'Workflow Cleared',
      description: 'All nodes and connections have been removed.',
    });
  }, [onClear]);
  
  // Handle validating workflow
  const handleValidate = useCallback(() => {
    if (onValidate) onValidate();
  }, [onValidate]);
  
  return (
    <>
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="outline" 
                onClick={handleSave}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Export workflow as JSON
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="outline" 
                onClick={handleLoad}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Import workflow from JSON
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setShowClearDialog(true)}
                className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Clear workflow
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {onValidate && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleValidate}
                  className="border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                >
                  <CheckSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Validate connections
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {showInfoPanel && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={showInfoPanel}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Workflow information
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all nodes and connections from your workflow. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearConfirm}
              className="bg-rose-500 hover:bg-rose-600"
            >
              Clear Workflow
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};