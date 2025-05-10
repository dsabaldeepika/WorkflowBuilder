import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchableAppList } from "./SearchableAppList";
import { ModuleList } from "./ModuleList";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";
import { App, Module } from "@/types/workflow";
import { useWorkflowStore } from "@/store/useWorkflowStore";
import { v4 as uuid } from "uuid";

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
  const { addNode } = useWorkflowStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleBackToApps = () => {
    onSelectApp(null);
    setSearchQuery("");
  };

  const handleModuleSelect = (module: Module) => {
    // Add a new node to the workflow
    addNode({
      id: uuid(),
      type: "workflowNode",
      position: { x: 250, y: 200 },
      data: { 
        app: selectedApp!, 
        module: module,
      }
    });
    
    // Close the modal and reset selection
    onClose();
    onSelectApp(null);
    setSearchQuery("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        onSelectApp(null);
        setSearchQuery("");
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b border-gray-200 flex justify-between items-center">
          <DialogTitle className="text-lg font-semibold text-gray-800">
            {selectedApp ? `Select ${selectedApp.label} Module` : "Add a Node"}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {selectedApp ? (
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
                      {selectedApp.icon}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedApp.label}</h3>
                </div>
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
