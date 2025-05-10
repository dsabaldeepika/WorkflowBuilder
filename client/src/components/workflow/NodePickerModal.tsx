import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SearchableAppList } from "./SearchableAppList";
import { ModuleList } from "./ModuleList";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, Check, Clock, RefreshCw } from "lucide-react";
import { App, Module } from "@/types/workflow";
import { useWorkflowStore } from "@/store/useWorkflowStore";
import { v4 as uuid } from "uuid";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface NodePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApp: App | null;
  onSelectApp: (app: App | null) => void;
}

export function NodePickerModal({ 
  isOpen, 
  onClose, 
  selectedApp, 
  onSelectApp 
}: NodePickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [scheduleFrequency, setScheduleFrequency] = useState("once");
  const [customInterval, setCustomInterval] = useState("15");
  const [intervalUnit, setIntervalUnit] = useState("minutes");
  const { addNode } = useWorkflowStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleBackToApps = () => {
    setSelectedModule(null);
    onSelectApp(null);
    setSearchQuery("");
  };

  const handleBackToModules = () => {
    setSelectedModule(null);
  };

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
    // If it's not a trigger, we can skip the scheduling step
    if (module.type !== 'trigger') {
      addNodeToWorkflow(module);
    }
  };

  const addNodeToWorkflow = (module: Module) => {
    // Add a new node to the workflow
    addNode({
      id: uuid(),
      type: "workflowNode",
      position: { x: 250, y: 200 },
      data: { 
        app: selectedApp!, 
        module: module,
        config: {
          scheduleFrequency: module.type === 'trigger' ? scheduleFrequency : null,
          customInterval: module.type === 'trigger' && scheduleFrequency === 'custom' ? customInterval : null,
          intervalUnit: module.type === 'trigger' && scheduleFrequency === 'custom' ? intervalUnit : null,
        }
      }
    });
    
    // Close the modal and reset selection
    onClose();
    resetModalState();
  };

  const resetModalState = () => {
    onSelectApp(null);
    setSelectedModule(null);
    setSearchQuery("");
    setScheduleFrequency("once");
    setCustomInterval("15");
    setIntervalUnit("minutes");
  };

  const renderSchedulingOptions = () => {
    return (
      <div className="p-6 space-y-6">
        <h3 className="text-lg font-medium">Configure Trigger Schedule</h3>
        <div className="bg-blue-50 p-4 rounded-md mb-4 flex items-start">
          <div className="mr-2 mt-1 text-blue-500">
            <Clock size={18} />
          </div>
          <p className="text-sm text-blue-700">
            Choose how often this trigger should run. You can change this later in the workflow settings.
          </p>
        </div>
        
        <RadioGroup 
          defaultValue="once" 
          value={scheduleFrequency} 
          onValueChange={setScheduleFrequency}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="once" id="once" />
            <Label htmlFor="once" className="cursor-pointer">Run once</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hourly" id="hourly" />
            <Label htmlFor="hourly" className="cursor-pointer">Run hourly</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="daily" id="daily" />
            <Label htmlFor="daily" className="cursor-pointer">Run daily</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="weekly" id="weekly" />
            <Label htmlFor="weekly" className="cursor-pointer">Run weekly</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id="custom" />
            <Label htmlFor="custom" className="cursor-pointer">Custom interval</Label>
          </div>
          
          {scheduleFrequency === 'custom' && (
            <div className="ml-6 flex items-center space-x-2 pt-2">
              <span className="text-sm font-medium">Every</span>
              <Select 
                value={customInterval} 
                onValueChange={setCustomInterval}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="15" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 30, 45, 60].map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={intervalUnit} 
                onValueChange={setIntervalUnit}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="minutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">minutes</SelectItem>
                  <SelectItem value="hours">hours</SelectItem>
                  <SelectItem value="days">days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </RadioGroup>
        
        <div className="pt-4 flex justify-end space-x-2 border-t mt-4">
          <Button variant="outline" onClick={handleBackToModules}>
            Back
          </Button>
          <Button 
            onClick={() => addNodeToWorkflow(selectedModule!)}
            className="bg-primary text-white"
          >
            <Check className="mr-2 h-4 w-4" />
            Add to Workflow
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetModalState();
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <DialogTitle className="text-lg font-semibold text-gray-800">
              {selectedModule 
                ? `Configure ${selectedModule.label}`
                : selectedApp 
                  ? `Select ${selectedApp.label} Module` 
                  : "Add a Node"}
            </DialogTitle>
            {selectedApp && !selectedModule && (
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Choose an action or trigger from {selectedApp.label}
              </DialogDescription>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {selectedApp && selectedModule ? (
            // Show scheduling options for triggers
            selectedModule.type === 'trigger' ? renderSchedulingOptions() : null
          ) : selectedApp ? (
            <>
              <div className="sticky top-0 bg-white p-4 border-b border-gray-200 z-10">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToApps}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to apps
                </Button>
                <div className="flex items-center">
                  <div className={`w-8 h-8 bg-${selectedApp.iconBg}-100 text-${selectedApp.iconColor}-600 rounded-md flex items-center justify-center mr-3`}>
                    <span className="flex items-center justify-center">
                      {React.createElement(selectedApp.icon, { size: 20 })}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800">{selectedApp.label}</h3>
                    <Badge variant="outline" className="mt-1 text-xs bg-purple-50 border-purple-200">
                      <Check className="h-3 w-3 mr-1 text-purple-500" /> Verified
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="py-2 px-4 bg-gray-50 border-b border-gray-200">
                <h4 className="font-semibold text-sm uppercase text-gray-500">
                  {selectedApp.id === "google-sheets" ? "ROWS" : "MODULES"}
                </h4>
              </div>
              
              <ModuleList 
                modules={selectedApp.modules}
                onSelectModule={handleModuleSelect}
              />
            </>
          ) : (
            <SearchableAppList 
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onClearSearch={clearSearch}
              onSelectApp={onSelectApp}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
