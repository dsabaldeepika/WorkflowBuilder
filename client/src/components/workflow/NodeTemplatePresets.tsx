import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DownloadCloud, 
  Mail, 
  UserPlus, 
  Database, 
  MessageSquare,
  Share2,
  FileText,
  ListFilter,
  AlertTriangle,
  RefreshCw,
  Calendar,
  CheckSquare,
  Send,
  BellRing,
  SlidersHorizontal
} from 'lucide-react';
import { NodeCategory, NodeTemplate, NodeType } from '@/types/workflow';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useToast } from '@/hooks/use-toast';

interface NodeTemplatePresetProps {
  onSelectTemplate: (template: NodeTemplate) => void;
}

export function NodeTemplatePresets({ onSelectTemplate }: NodeTemplatePresetProps) {
  const { toast } = useToast();
  const { addCustomTemplate } = useWorkflowStore();
  console.log("NodeTemplatePresets component loaded");
  
  // Common preset categories
  const presetCategories = [
    { id: 'crm', name: 'CRM Automation', icon: UserPlus },
    { id: 'email', name: 'Email Marketing', icon: Mail },
    { id: 'social', name: 'Social Media', icon: Share2 },
    { id: 'data', name: 'Data Processing', icon: Database },
    { id: 'messaging', name: 'Notifications', icon: MessageSquare },
    { id: 'forms', name: 'Form Handlers', icon: FileText }
  ];

  // Create predefined templates
  const templates: NodeTemplate[] = [
    {
      id: 'preset-crm-lead-capture',
      name: 'Lead Capture Form',
      description: 'Captures lead information from web forms and adds them to your CRM system',
      category: 'crm' as NodeCategory,
      nodeType: 'trigger' as NodeType,
      icon: 'user-plus',
      configuration: {
        formFields: ['name', 'email', 'phone', 'company', 'jobTitle', 'source'],
        leadSource: 'website',
        notificationEmail: ''
      },
      inputs: {},
      outputs: {
        lead: {
          fields: ['name', 'email', 'phone', 'company', 'jobTitle', 'source'],
          sample: {
            name: 'John Doe',
            email: 'email@example.com'
          }
        }
      },
      ports: [
        {
          id: 'output-lead',
          type: 'output',
          dataType: 'object'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      isCustom: true,
      isGroupTemplate: false
    },
    {
      id: 'preset-email-campaign',
      name: 'Email Campaign Scheduler',
      description: 'Schedule and send email campaigns to segmented lists',
      category: 'messaging' as NodeCategory,
      nodeType: 'action' as NodeType,
      icon: 'mail',
      configuration: {
        emailSubject: '',
        templateId: '',
        segmentId: '',
        scheduledTime: '',
        trackOpens: true,
        trackClicks: true
      },
      inputs: {},
      outputs: {},
      ports: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      isCustom: true,
      isGroupTemplate: false
    },
    {
      id: 'preset-social-post',
      name: 'Social Media Publisher',
      description: 'Schedule and publish content to multiple social media platforms',
      category: 'social' as NodeCategory,
      nodeType: 'action' as NodeType,
      icon: 'share2',
      configuration: {},
      inputs: {},
      outputs: {},
      ports: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      isCustom: true,
      isGroupTemplate: false
    }
  ];
  
  // Import a preset template
  const importTemplate = (template: NodeTemplate) => {
    // Generate a unique ID for the new template
    const newTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isGroupTemplate: false
    };
    
    addCustomTemplate(newTemplate);
    onSelectTemplate(newTemplate);
    
    toast({
      title: 'Template Added',
      description: `${template.name} has been added to your custom templates`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-4">
        {presetCategories.map(category => (
          <Badge 
            key={category.id} 
            variant="outline" 
            className="cursor-pointer hover:bg-secondary flex items-center gap-1 py-1 px-3"
          >
            <category.icon className="h-3 w-3 mr-1" />
            {category.name}
          </Badge>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <Badge variant="outline">{template.category}</Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <SlidersHorizontal className="h-3 w-3" />
                  <span>Type: {template.nodeType}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Complexity: Medium</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1"
                onClick={() => importTemplate(template)}
              >
                <DownloadCloud className="h-4 w-4" />
                Import Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}