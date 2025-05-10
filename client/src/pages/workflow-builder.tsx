import { useState } from "react";
import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";
import { NodePickerModal } from "@/components/workflow/NodePickerModal";
import { useWorkflowStore } from "@/store/useWorkflowStore";
import { Link } from "wouter";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkflowBuilder() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const { saveWorkflow } = useWorkflowStore();

  const handleSaveDraft = () => {
    saveWorkflow();
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">New Workflow</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button>Publish</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-700">Workflow Tools</h2>
          </div>
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              <li>
                <a href="#" className="flex items-center px-3 py-2 text-sm rounded-md bg-blue-50 text-primary">
                  <span className="w-5 h-5 mr-2 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M2 12h5" /><path d="M17 12h5" /><path d="M7 12a5 5 0 0 1 5-5" /><path d="M12 17a5 5 0 0 0 5-5" />
                    </svg>
                  </span>
                  <span>Builder</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 text-gray-700">
                  <span className="w-5 h-5 mr-2 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </span>
                  <span>Settings</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 text-gray-700">
                  <span className="w-5 h-5 mr-2 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" />
                    </svg>
                  </span>
                  <span>History</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 text-gray-700">
                  <span className="w-5 h-5 mr-2 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
                    </svg>
                  </span>
                  <span>Run</span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Workflow Canvas */}
        <WorkflowCanvas 
          onAddNodeClick={() => setModalOpen(true)} 
        />
      </div>

      {/* Node Picker Modal */}
      <NodePickerModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setModalOpen(false);
          setSelectedApp(null);
        }} 
        selectedApp={selectedApp}
        onSelectApp={setSelectedApp}
      />
    </div>
  );
}
