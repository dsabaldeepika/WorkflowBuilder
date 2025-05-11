import React, { useState } from "react";
import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";
import { NodePickerModal } from "@/components/workflow/NodePickerModal";
import { AIAssistant } from "@/components/workflow/AIAssistant";
import { TemplateGallery } from "@/components/workflow/TemplateGallery";
import { AgentBuilder } from "@/components/workflow/AgentBuilder";
import { CustomNodeTemplates } from "@/components/workflow/CustomNodeTemplates";
import WorkflowMonitoring from "@/components/workflow/WorkflowMonitoring";
import { useWorkflowStore } from "@/store/useWorkflowStore";
import { Link } from "wouter";
import { 
  ArrowLeft, Save, Play, Cog, History, Repeat, Clock, Settings,
  FileText, Database, Webhook, Power, HelpCircle, Workflow, RefreshCw,
  LayoutGrid, AlertCircle, BookOpen, Gift, Share2, PlusCircle, Sparkles,
  Bot, Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { App } from "@/types/workflow";

export default function WorkflowBuilder() {
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [workflowName, setWorkflowName] = useState("My Workflow");
  const [activeTab, setActiveTab] = useState<string>("builder");
  const [workflowEnabled, setWorkflowEnabled] = useState(false);
  const { 
    saveWorkflow, 
    clearWorkflow, 
    nodes, 
    edges,
    isModalOpen,
    isAIAssistantOpen,
    isTemplateGalleryOpen,
    isAgentBuilderOpen,
    isCustomTemplatesOpen,
    openNodePicker,
    closeNodePicker,
    openAIAssistant,
    closeAIAssistant,
    openTemplateGallery,
    closeTemplateGallery,
    openAgentBuilder,
    closeAgentBuilder,
    openCustomTemplates,
    closeCustomTemplates,
    generateWorkflowFromDescription,
    applyWorkflowTemplate,
    createAgent,
    applyNodeTemplate
  } = useWorkflowStore();

  const handleSaveDraft = async () => {
    try {
      // Saving the workflow - function handles alerts and navigation internally
      await saveWorkflow();
      console.log('Workflow saved successfully');
    } catch (error) {
      console.error('Error in handleSaveDraft:', error);
      // The error alert is already handled in the saveWorkflow function
    }
  };

  const handleClearWorkflow = () => {
    if (confirm("Are you sure you want to clear this workflow? All nodes will be removed.")) {
      clearWorkflow();
    }
  };

  const countNodesByType = () => {
    const triggers = nodes.filter(node => node.data.module.type === 'trigger').length;
    const actions = nodes.filter(node => node.data.module.type === 'action').length;
    return { triggers, actions };
  };

  const { triggers, actions } = countNodesByType();

  const renderSidebarContent = () => {
    switch (activeTab) {
      case 'builder':
        return (
          <div className="p-4">
            <h2 className="text-sm font-medium text-gray-500 mb-2">WORKFLOW STRUCTURE</h2>
            <div className="bg-white rounded-md border border-gray-200 p-3 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Nodes</span>
                <Badge variant="secondary" className="text-xs">{nodes.length}</Badge>
              </div>
              <div className="flex justify-between items-center mb-2 pl-2">
                <span className="text-xs text-gray-500 flex items-center">
                  <Power className="h-3 w-3 mr-1 text-blue-500" />
                  Triggers
                </span>
                <Badge variant="outline" className="text-xs">{triggers}</Badge>
              </div>
              <div className="flex justify-between items-center pl-2">
                <span className="text-xs text-gray-500 flex items-center">
                  <Cog className="h-3 w-3 mr-1 text-green-500" />
                  Actions
                </span>
                <Badge variant="outline" className="text-xs">{actions}</Badge>
              </div>
            </div>
            
            <h2 className="text-sm font-medium text-gray-500 mb-2">ACTIONS</h2>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start text-gray-700 hover:text-primary hover:border-primary"
                onClick={openNodePicker}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Node
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-gray-700 hover:text-blue-600 hover:border-blue-200"
                onClick={openTemplateGallery}
              >
                <FileText className="h-4 w-4 mr-2" />
                Use Template
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-gray-700 hover:text-amber-600 hover:border-amber-200"
                onClick={handleClearWorkflow}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Workflow
              </Button>
            </div>
            
            <Separator className="my-6" />
            
            <h2 className="text-sm font-medium text-gray-500 mb-2">TIPS</h2>
            <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-700 space-y-2">
              <p className="flex items-start">
                <AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                Start with a trigger node to determine when your workflow should run
              </p>
              <p className="flex items-start">
                <AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                Connect nodes by dragging from the output handle to the input handle
              </p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-4">
            <h2 className="text-sm font-medium text-gray-500 mb-3">GENERAL SETTINGS</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workflowName">Workflow Name</Label>
                <Input 
                  id="workflowName" 
                  value={workflowName} 
                  onChange={e => setWorkflowName(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="workflowStatus">Enable Workflow</Label>
                <Switch 
                  id="workflowStatus"
                  checked={workflowEnabled}
                  onCheckedChange={setWorkflowEnabled}
                />
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <h2 className="text-sm font-medium text-gray-500 mb-3">EXECUTION</h2>
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-md text-xs flex items-start">
                <AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                <span>Changes to execution settings require saving the workflow</span>
              </div>
              
              <div className="space-y-2 bg-white border border-gray-200 rounded-md p-3">
                <h3 className="text-sm font-medium mb-1">Error Handling</h3>
                <div className="pl-2 space-y-1">
                  <label className="flex items-center">
                    <input type="radio" name="errorHandling" className="mr-2" defaultChecked />
                    <span className="text-xs">Continue workflow execution on error</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="errorHandling" className="mr-2" />
                    <span className="text-xs">Stop workflow execution on error</span>
                  </label>
                </div>
              </div>
              
              <div className="space-y-2 bg-white border border-gray-200 rounded-md p-3">
                <h3 className="text-sm font-medium mb-1">Timeout</h3>
                <div className="flex items-center">
                  <Input 
                    type="number" 
                    min="1" 
                    max="300"
                    defaultValue="60"
                    className="w-20 mr-2"
                  />
                  <span className="text-xs text-gray-500">seconds</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="p-4">
            <h2 className="text-sm font-medium text-gray-500 mb-3">EXECUTION HISTORY</h2>
            <div className="bg-gray-50 p-6 rounded-md flex flex-col items-center justify-center text-center">
              <History className="h-8 w-8 text-gray-400 mb-2" />
              <h3 className="text-sm font-medium text-gray-700 mb-1">No history yet</h3>
              <p className="text-xs text-gray-500 mb-4">Run your workflow to see execution history</p>
              <Button variant="outline" size="sm">
                <Play className="h-3 w-3 mr-1" />
                Run Now
              </Button>
            </div>
          </div>
        );
      case 'monitoring':
        return (
          <div className="p-0 h-full overflow-auto">
            <WorkflowMonitoring />
          </div>
        );
      case 'run':
        return (
          <div className="p-4">
            <h2 className="text-sm font-medium text-gray-500 mb-3">RUN WORKFLOW</h2>
            
            <div className="bg-white rounded-md border border-gray-200 mb-4 overflow-hidden">
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">Execution Options</h3>
              </div>
              <div className="p-3 space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="runWithData" className="text-sm">Run with sample data</Label>
                  <Switch id="runWithData" />
                </div>
                
                <div className="flex justify-between items-center">
                  <Label htmlFor="debugMode" className="text-sm">Debug mode</Label>
                  <Switch id="debugMode" />
                </div>
              </div>
            </div>
            
            <Button className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Run Now
            </Button>
            
            <Separator className="my-6" />
            
            <h2 className="text-sm font-medium text-gray-500 mb-3">SCHEDULING</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Run once</span>
                <input type="radio" name="schedule" value="once" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Run hourly</span>
                <input type="radio" name="schedule" value="hourly" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Run daily</span>
                <input type="radio" name="schedule" value="daily" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Run weekly</span>
                <input type="radio" name="schedule" value="weekly" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Custom schedule</span>
                <input type="radio" name="schedule" value="custom" />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
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
            <h1 className="text-xl font-bold">{workflowName}</h1>
            {workflowEnabled && (
              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Active</Badge>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={openAgentBuilder} className="gap-2">
              <Bot className="h-4 w-4" />
              AI Agent Builder
            </Button>
            <Button variant="outline" onClick={openAIAssistant} className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Assistant
            </Button>
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="default">
              <Play className="h-4 w-4 mr-2" />
              Publish & Run
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${activeTab === 'monitoring' ? 'w-[580px]' : 'w-64'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col`}>
          <div className="p-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-700">Workflow Tools</h2>
          </div>
          <div className="flex flex-wrap border-b border-gray-200">
            <button 
              className={`px-3 py-2 text-sm font-medium ${activeTab === 'builder' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-800'}`}
              onClick={() => setActiveTab('builder')}
            >
              Builder
            </button>
            <button 
              className={`px-3 py-2 text-sm font-medium ${activeTab === 'settings' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-800'}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
            <button 
              className={`px-3 py-2 text-sm font-medium ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-800'}`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
            <button 
              className={`px-3 py-2 text-sm font-medium ${activeTab === 'monitoring' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-800'}`}
              onClick={() => setActiveTab('monitoring')}
            >
              Monitoring
            </button>
            <button 
              className={`px-3 py-2 text-sm font-medium ${activeTab === 'run' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-800'}`}
              onClick={() => setActiveTab('run')}
            >
              Run
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {renderSidebarContent()}
          </div>
        </aside>

        {/* Workflow Canvas */}
        <WorkflowCanvas />
      </div>

      {/* Node Picker Modal */}
      <NodePickerModal 
        isOpen={isModalOpen} 
        onClose={() => {
          closeNodePicker();
          setSelectedApp(null);
        }} 
        selectedApp={selectedApp}
        onSelectApp={setSelectedApp}
      />
      
      {/* AI Assistant Modal */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={closeAIAssistant}
        onGenerateWorkflow={generateWorkflowFromDescription}
      />
      
      {/* Template Gallery Modal */}
      <TemplateGallery
        isOpen={isTemplateGalleryOpen}
        onClose={closeTemplateGallery}
        onSelectTemplate={(template) => {
          // Get the complete template object with the given ID
          // This is a workaround since TemplateGallery provides template objects 
          // with a different structure from WorkflowTemplate
          const workflowTemplate = {
            id: template.id,
            name: template.title,
            description: template.description,
            category: template.category[0], // Use the first category
            nodes: [], // These would be populated from the actual API
            edges: []  // These would be populated from the actual API
          };
          applyWorkflowTemplate(workflowTemplate);
        }}
      />
      
      {/* Agent Builder Modal */}
      <AgentBuilder
        isOpen={isAgentBuilderOpen}
        onClose={closeAgentBuilder}
        onCreateAgent={createAgent}
      />
      
      {/* Custom Node Templates Modal */}
      <CustomNodeTemplates
        isOpen={isCustomTemplatesOpen}
        onClose={closeCustomTemplates}
        onSelectTemplate={applyNodeTemplate}
      />
    </div>
  );
}
