import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { NodeColorPicker, colorThemes, presetColors } from './NodeColorPicker';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { Trash2, Copy, Palette, Settings, Play, Pause, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NodeContextMenuProps {
  nodeId: string;
  children: React.ReactNode;
}

export function NodeContextMenu({ nodeId, children }: NodeContextMenuProps) {
  const { toast } = useToast();
  const { 
    nodes, 
    removeNode, 
    updateNodeColor,
    setNodeState,
    updateNode
  } = useWorkflowStore();
  
  // Get node data
  const node = nodes.find(node => node.id === nodeId);
  
  // Handle node deletion
  const handleDelete = () => {
    removeNode(nodeId);
    toast({
      title: 'Node Deleted',
      description: 'The node has been removed from the workflow.'
    });
  };
  
  // Handle node duplication
  const handleDuplicate = () => {
    if (!node) return;
    
    const newNodeId = `${node.type || 'node'}-${Date.now()}`;
    const newNode = {
      ...node,
      id: newNodeId,
      position: {
        x: node.position.x + 20,
        y: node.position.y + 20
      }
    };
    
    useWorkflowStore.getState().addNode(newNode);
    toast({
      title: 'Node Duplicated',
      description: 'A copy of the node has been created.'
    });
  };
  
  // Handle node color change
  const handleColorChange = (colorData: {
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    theme?: 'default' | 'light' | 'dark' | 'colorful' | 'minimal' | 'custom';
    colorLabel?: string;
  }) => {
    updateNodeColor(nodeId, colorData);
  };
  
  // Apply a preset color theme
  const applyPresetTheme = (themeName: string) => {
    const theme = colorThemes[themeName as keyof typeof colorThemes];
    updateNodeColor(nodeId, {
      color: theme.text,
      backgroundColor: theme.primary,
      borderColor: theme.border,
      theme: themeName as any,
    });
    
    toast({
      title: 'Theme Applied',
      description: `Applied the ${themeName} theme to the node.`
    });
  };
  
  // Apply a preset category color
  const applyPresetColor = (preset: typeof presetColors[number]) => {
    updateNodeColor(nodeId, {
      color: preset.text,
      backgroundColor: preset.color,
      borderColor: preset.borderColor,
      theme: 'custom',
      colorLabel: preset.name
    });
    
    toast({
      title: 'Color Applied',
      description: `Applied "${preset.name}" color scheme to the node.`
    });
  };
  
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={() => updateNode(nodeId, { 
          state: node?.data.state === 'running' ? 'idle' : 'running'
        })}>
          {node?.data.state === 'running' ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              <span>Pause Node</span>
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              <span>Run Node</span>
            </>
          )}
        </ContextMenuItem>
        
        <ContextMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit Configuration</span>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            <span>Change Color</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-60">
            <div className="px-2 py-1.5">
              <NodeColorPicker
                color={node?.data.color}
                backgroundColor={node?.data.backgroundColor}
                borderColor={node?.data.borderColor}
                theme={node?.data.theme}
                colorLabel={node?.data.colorLabel}
                onChange={handleColorChange}
              />
            </div>
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        <ContextMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Duplicate</span>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}