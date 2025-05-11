import React, { useState } from 'react';
import { Bot, Sparkles, Zap, BookOpen, Lightbulb, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface AiAssistPanelProps {
  onGenerateWorkflow: (prompt: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function AiAssistPanel({ onGenerateWorkflow, isOpen, onClose }: AiAssistPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: 'Empty prompt',
        description: 'Please describe what you want to build',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate AI generating a workflow
    setTimeout(() => {
      onGenerateWorkflow(prompt);
      setIsGenerating(false);
      toast({
        title: 'Workflow Generated',
        description: 'Your custom workflow has been created based on your description',
      });
    }, 2000);
  };
  
  const examples = [
    {
      id: 'example1',
      title: 'Lead Generation',
      description: 'Capture leads from Facebook, enrich with Clearbit, and add to HubSpot',
      icon: <Zap className="h-5 w-5 text-blue-500" />,
    },
    {
      id: 'example2',
      title: 'Customer Support',
      description: 'Create Zendesk tickets from Gmail and notify team in Slack',
      icon: <BookOpen className="h-5 w-5 text-purple-500" />,
    },
    {
      id: 'example3',
      title: 'Data Sync',
      description: 'Keep Salesforce and HubSpot contacts in sync automatically',
      icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
    },
  ];
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="w-full max-w-3xl bg-background rounded-xl shadow-xl border border-primary/20"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Merlin AI Assistant</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Describe your workflow</h3>
              <div className="relative">
                <Input
                  className="w-full p-4 pr-24 text-base rounded-lg border-primary/20 bg-primary/5 focus:border-primary min-h-[80px]"
                  placeholder="e.g., When a new lead comes in from my website form, enrich their data and add them to my CRM"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
                <Button 
                  className="absolute right-2 top-2" 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Creating...' : 'Generate'}
                  {!isGenerating && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Popular examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {examples.map(example => (
                  <Card 
                    key={example.id}
                    className={`border hover:border-primary/50 cursor-pointer transition-all ${
                      selectedTemplate === example.id ? 'ring-2 ring-primary border-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedTemplate(example.id);
                      setPrompt(example.description);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3 items-start">
                        <div className="mt-1">{example.icon}</div>
                        <div>
                          <h4 className="font-medium">{example.title}</h4>
                          <p className="text-sm text-muted-foreground">{example.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Bot className="h-4 w-4" />
                <span>Powered by AI to build workflows in seconds</span>
              </div>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}