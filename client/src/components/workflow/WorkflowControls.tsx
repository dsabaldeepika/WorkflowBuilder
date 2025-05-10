import React, { useState, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  UploadCloud, 
  DownloadCloud, 
  ChevronDown, 
  Share2, 
  Trash2, 
  FilePlus, 
  CheckCircle2, 
  AlertOctagon 
} from 'lucide-react';
import { NodeData } from '@/store/useWorkflowStore';

interface WorkflowControlsProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onSave?: () => void;
  onLoad?: (nodes: Node<NodeData>[], edges: Edge[]) => void;
  onClear?: () => void;
  onValidate?: () => void;
  showInfoPanel?: () => void;
}

export const WorkflowControls: React.FC<WorkflowControlsProps> = ({
  nodes,
  edges,
  onSave,
  onLoad,
  onClear,
  onValidate,
  showInfoPanel
}) => {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportName, setExportName] = useState('my-workflow');
  const [exportDescription, setExportDescription] = useState('');
  const [exportText, setExportText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Import from text
  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText);
      
      if (!parsed.nodes || !parsed.edges || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
        setImportError('Invalid workflow format. Missing nodes or edges arrays.');
        return;
      }
      
      if (onLoad) {
        onLoad(parsed.nodes, parsed.edges);
      }
      
      setImportText('');
      setImportError(null);
      setShowImportDialog(false);
    } catch (err) {
      setImportError('Failed to parse JSON. Please check the format.');
    }
  };
  
  // Import from file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        if (!parsed.nodes || !parsed.edges || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
          setImportError('Invalid workflow format in file. Missing nodes or edges arrays.');
          return;
        }
        
        if (onLoad) {
          onLoad(parsed.nodes, parsed.edges);
        }
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        setImportError('Failed to parse JSON from file. Please check the format.');
      }
    };
    
    reader.readAsText(file);
  };
  
  // Export workflow
  const handleExport = () => {
    const workflow = {
      name: exportName,
      description: exportDescription,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
    };
    
    setExportText(JSON.stringify(workflow, null, 2));
    setShowExportDialog(true);
  };
  
  // Save to file
  const handleSaveToFile = () => {
    const workflow = {
      name: exportName,
      description: exportDescription,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportName.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowExportDialog(false);
  };
  
  // Validate workflow
  const validateWorkflow = () => {
    if (onValidate) {
      onValidate();
    }
  };
  
  // Clear workflow
  const clearWorkflow = () => {
    if (onClear) {
      onClear();
    }
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-1">
            <Save className="h-4 w-4" />
            <span className="hidden md:inline">Actions</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Workflow Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onSelect={() => onSave && onSave()} disabled={nodes.length === 0}>
            <Save className="mr-2 h-4 w-4" />
            <span>Save</span>
            {nodes.length > 0 && 
              <Badge variant="success" className="ml-auto">
                <CheckCircle2 className="h-3 w-3" />
              </Badge>
            }
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={() => setShowImportDialog(true)}>
            <UploadCloud className="mr-2 h-4 w-4" />
            <span>Import</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={handleExport} disabled={nodes.length === 0}>
            <DownloadCloud className="mr-2 h-4 w-4" />
            <span>Export</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onSelect={validateWorkflow} disabled={nodes.length === 0}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            <span>Validate</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={clearWorkflow} disabled={nodes.length === 0} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Clear All</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Workflow</DialogTitle>
            <DialogDescription>
              Upload a workflow file or paste JSON to import a workflow.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file-upload" className="col-span-4">
                Upload Workflow File
              </Label>
              <div className="col-span-4">
                <Input 
                  id="file-upload"
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="import-json" className="col-span-4">
                Or Paste Workflow JSON
              </Label>
              <div className="col-span-4">
                <Textarea
                  id="import-json"
                  placeholder="Paste JSON here..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={8}
                />
              </div>
            </div>
            
            {importError && (
              <div className="col-span-4 text-destructive text-sm flex items-center gap-1">
                <AlertOctagon className="h-4 w-4" />
                {importError}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!importText.trim()}
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Export Workflow</DialogTitle>
            <DialogDescription>
              Save your workflow as a JSON file or copy to clipboard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="export-name" className="col-span-1">
                Name
              </Label>
              <div className="col-span-3">
                <Input
                  id="export-name"
                  value={exportName}
                  onChange={(e) => setExportName(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="export-description" className="col-span-1">
                Description
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="export-description"
                  value={exportDescription}
                  onChange={(e) => setExportDescription(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="export-json" className="col-span-4">
                Workflow JSON
              </Label>
              <div className="col-span-4">
                <ScrollArea className="h-[200px] w-full rounded-md border">
                  <div className="p-4 font-mono text-sm">
                    {exportText}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => navigator.clipboard.writeText(exportText)}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleSaveToFile}
              >
                <FilePlus className="h-4 w-4 mr-1" />
                Save As File
              </Button>
            </div>
            <Button onClick={() => setShowExportDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper functions for downloading and uploading JSON files
export const downloadJSONFile = (data: any, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const uploadJSONFile = (fileInputRef: React.RefObject<HTMLInputElement>, onFileLoaded: (data: any) => void): void => {
  if (!fileInputRef.current) return;
  
  fileInputRef.current.click();
  fileInputRef.current.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        onFileLoaded(parsed);
        
        // Reset the input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        console.error('Failed to parse JSON from file', err);
      }
    };
    
    reader.readAsText(file);
  };
};

export default WorkflowControls;