import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, MessageSquare, Bot, Lightbulb } from 'lucide-react';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateWorkflow: (description: string) => void;
}

export function AIAssistant({ isOpen, onClose, onGenerateWorkflow }: AIAssistantProps) {
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Create a workflow that sends a Slack message when a new lead is added to Salesforce",
    "Build a workflow to automatically save Gmail attachments to Google Drive",
    "Create a workflow that posts new Shopify orders to a Slack channel",
    "Send a daily report of website traffic from Google Analytics to my email",
    "Create a workflow to notify me when a specific keyword is mentioned on Twitter"
  ]);

  const handleSubmit = () => {
    if (!workflowDescription.trim()) return;
    
    setIsGenerating(true);
    // Simulate API call to generate workflow
    setTimeout(() => {
      onGenerateWorkflow(workflowDescription);
      setIsGenerating(false);
      onClose();
    }, 1500);
  };

  const useSuggestion = (suggestion: string) => {
    setWorkflowDescription(suggestion);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Workflow Assistant
          </DialogTitle>
          <DialogDescription>
            Describe what you want your workflow to do, and our AI will help you create it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-2">
          <Textarea
            placeholder="E.g. 'Create a workflow that sends me an email when a new file is added to Dropbox'"
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
            className="min-h-[100px]"
          />
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Suggestions
            </h4>
            <div className="space-y-2">
              {suggestions.map((suggestion, i) => (
                <div 
                  key={i}
                  className="text-sm p-2 border rounded-md cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  onClick={() => useSuggestion(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={!workflowDescription.trim() || isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Bot className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Workflow
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}