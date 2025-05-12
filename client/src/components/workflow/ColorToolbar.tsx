import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Palette, Check } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { colorThemes, presetColors } from './NodeColorPicker';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { Badge } from '@/components/ui/badge';

export function ColorToolbar() {
  const { nodes, bulkUpdateNodeColors } = useWorkflowStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  
  // Handle node selection and highlighting
  useEffect(() => {
    // When entering selection mode, set up a listener for node clicks and highlight nodes
    if (selectMode) {
      // Set up click handler for node selection
      const handleNodeClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const nodeElement = target.closest('.workflow-node');
        
        if (nodeElement) {
          // Find the node ID
          const nodeId = nodeElement.getAttribute('data-id');
          if (nodeId) {
            toggleNodeSelection(nodeId);
            event.stopPropagation();
            event.preventDefault();
          }
        }
      };
      
      // Add a visual indicator for selection mode
      document.querySelectorAll('.workflow-node').forEach(node => {
        node.classList.add('selection-mode');
      });
      
      document.addEventListener('click', handleNodeClick, true);
      
      return () => {
        document.removeEventListener('click', handleNodeClick, true);
        // Remove selection mode indicator when exiting selection mode
        document.querySelectorAll('.workflow-node').forEach(node => {
          node.classList.remove('selection-mode');
          node.classList.remove('node-selected');
        });
      };
    }
  }, [selectMode]);
  
  // Update node highlights when selected ids change
  useEffect(() => {
    if (selectMode) {
      // Clear all selected indicators first
      document.querySelectorAll('.workflow-node').forEach(node => {
        node.classList.remove('node-selected');
      });
      
      // Add highlight to selected nodes
      selectedIds.forEach(id => {
        const node = document.querySelector(`.workflow-node[data-id="${id}"]`);
        if (node) {
          node.classList.add('node-selected');
        }
      });
    }
  }, [selectMode, selectedIds]);
  
  // Toggle node selection
  const toggleNodeSelection = (nodeId: string) => {
    if (selectedIds.includes(nodeId)) {
      setSelectedIds(selectedIds.filter(id => id !== nodeId));
    } else {
      setSelectedIds([...selectedIds, nodeId]);
    }
  };
  
  // Apply theme to selected nodes
  const applyTheme = (themeName: string) => {
    if (selectedIds.length === 0) return;
    
    const theme = colorThemes[themeName as keyof typeof colorThemes];
    bulkUpdateNodeColors({
      nodeIds: selectedIds,
      color: theme.text,
      backgroundColor: theme.primary,
      borderColor: theme.border,
      theme: themeName as any
    });
  };
  
  // Apply preset color to selected nodes
  const applyPreset = (preset: typeof presetColors[number]) => {
    if (selectedIds.length === 0) return;
    
    bulkUpdateNodeColors({
      nodeIds: selectedIds,
      color: preset.text,
      backgroundColor: preset.color,
      borderColor: preset.borderColor,
      theme: 'custom',
      colorLabel: preset.name
    });
  };
  
  // Toggle selection mode
  const toggleSelectionMode = () => {
    setSelectMode(!selectMode);
    if (selectMode) {
      // If turning off selection mode, clear selections
      setSelectedIds([]);
    }
  };
  
  // Clear all node selections
  const clearSelections = () => {
    setSelectedIds([]);
  };
  
  // Select all nodes
  const selectAllNodes = () => {
    const ids = nodes.map(node => node.id);
    setSelectedIds(ids);
  };
  
  // Show nothing if no nodes in workflow
  if (nodes.length === 0) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-2 mb-3">
      <Button 
        variant={selectMode ? "default" : "outline"} 
        size="sm" 
        className={`h-8 gap-1 ${selectMode ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
        onClick={toggleSelectionMode}
      >
        {selectMode ? 'Exit Selection' : 'Select Nodes'}
      </Button>
      
      {selectMode && (
        <>
          <Badge variant="outline" className="bg-muted mr-1">
            {selectedIds.length} selected
          </Badge>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8"
            onClick={clearSelections}
            disabled={selectedIds.length === 0}
          >
            Clear
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8"
            onClick={selectAllNodes}
          >
            Select All
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1"
                disabled={selectedIds.length === 0}
              >
                <Palette className="h-4 w-4" />
                <span>Apply Colors</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <Tabs defaultValue="themes">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="themes">Themes</TabsTrigger>
                  <TabsTrigger value="presets">Presets</TabsTrigger>
                </TabsList>
                
                <TabsContent value="themes" className="space-y-4">
                  <h4 className="font-medium text-sm">Apply theme to {selectedIds.length} nodes</h4>
                  <RadioGroup defaultValue="default" onValueChange={applyTheme}>
                    {Object.keys(colorThemes).map((themeName) => (
                      <div key={themeName} className="flex items-center space-x-2">
                        <RadioGroupItem value={themeName} id={`bulk-theme-${themeName}`} />
                        <Label htmlFor={`bulk-theme-${themeName}`} className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ 
                              backgroundColor: colorThemes[themeName as keyof typeof colorThemes].primary,
                              border: `1px solid ${colorThemes[themeName as keyof typeof colorThemes].border}`
                            }} 
                          />
                          {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </TabsContent>
                
                <TabsContent value="presets" className="space-y-4">
                  <h4 className="font-medium text-sm">Apply category colors to {selectedIds.length} nodes</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {presetColors.map((preset, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        title={preset.name}
                        className="h-10 p-0.5 aspect-square"
                        onClick={() => applyPreset(preset)}
                      >
                        <div 
                          className="w-full h-full rounded-sm flex items-center justify-center"
                          style={{ 
                            backgroundColor: preset.color,
                            border: `1px solid ${preset.borderColor}`
                          }}
                        >
                          <Check className="h-4 w-4 opacity-80" style={{ color: preset.text }} />
                        </div>
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
}