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

  // Helper function to ensure templates have all required fields
  const createTemplate = (template: Partial<NodeTemplate>): NodeTemplate => {
    const now = new Date().toISOString();
    return {
      id: template.id || `preset-${Date.now()}`,
      name: template.name || 'Unnamed Template',
      description: template.description || 'No description',
      category: template.category || 'custom',
      nodeType: template.nodeType || 'action',
      icon: template.icon || 'settings',
      configuration: template.configuration || {},
      createdAt: template.createdAt || now,
      updatedAt: template.updatedAt || now,
      isFavorite: template.isFavorite || false,
      isCustom: template.isCustom || true,
      isGroupTemplate: template.isGroupTemplate || false,
      inputs: template.inputs,
      outputs: template.outputs,
      ports: template.ports
    };
  };
  
  // Template presets - each with tailored configuration
  const templateDefinitions = [
    // CRM Automation Templates
    {
      id: 'preset-crm-lead-capture',
      name: 'Lead Capture Form',
      description: 'Captures lead information from web forms and adds them to your CRM system',
      category: 'crm',
      nodeType: 'trigger',
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
      ]
    },
    {
      id: 'preset-crm-lead-qualification',
      name: 'Lead Qualification',
      description: 'Automatically qualify leads based on predefined criteria',
      category: 'crm',
      nodeType: 'action',
      icon: 'list-filter',
      configuration: {
        qualificationRules: [
          { field: 'email', operator: 'contains', value: '@company.com', score: 10 },
          { field: 'jobTitle', operator: 'contains', value: 'Manager', score: 5 },
          { field: 'jobTitle', operator: 'contains', value: 'Director', score: 10 },
          { field: 'company', operator: 'isNotEmpty', score: 3 }
        ],
        minQualifiedScore: 10,
        outputs: ['qualified', 'unqualified']
      },
      inputs: {
        lead: {
          type: 'object',
          required: true
        }
      },
      outputs: {
        qualifiedLead: { type: 'object' },
        unqualifiedLead: { type: 'object' }
      },
      ports: [
        {
          id: 'input-lead',
          type: 'input',
          dataType: 'object',
          required: true
        },
        {
          id: 'output-qualified',
          type: 'output',
          dataType: 'object'
        },
        {
          id: 'output-unqualified',
          type: 'output',
          dataType: 'object'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      isCustom: true
    },
    
    // Email Marketing Templates
    {
      id: 'preset-email-campaign',
      name: 'Email Campaign Scheduler',
      description: 'Schedule and send email campaigns to segmented lists',
      category: 'messaging',
      nodeType: 'action',
      icon: 'mail',
      configuration: {
        emailSubject: '',
        templateId: '',
        segmentId: '',
        scheduledTime: '',
        trackOpens: true,
        trackClicks: true,
        sender: {
          name: '',
          email: ''
        }
      },
      inputs: {
        recipients: { type: 'array' },
        templateData: { type: 'object' }
      },
      outputs: {
        campaignId: { type: 'string' },
        sentCount: { type: 'number' }
      },
      ports: [
        {
          id: 'input-recipients',
          type: 'input',
          dataType: 'array',
          required: true
        },
        {
          id: 'input-template-data',
          type: 'input',
          dataType: 'object',
          required: false
        },
        {
          id: 'output-campaign',
          type: 'output',
          dataType: 'object'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      isCustom: true
    },
    
    // Data Processing Templates
    {
      id: 'preset-data-transform',
      name: 'Data Transformer',
      description: 'Transform, clean, and standardize data fields',
      category: 'data',
      nodeType: 'transformer',
      icon: 'database',
      configuration: {
        transformations: [
          { field: '', transform: 'uppercase', output: '' },
          { field: '', transform: 'lowercase', output: '' },
          { field: '', transform: 'trim', output: '' },
          { field: '', transform: 'replace', find: '', replace: '', output: '' },
          { field: '', transform: 'number', output: '' },
          { field: '', transform: 'boolean', output: '' },
          { field: '', transform: 'date', format: 'YYYY-MM-DD', output: '' }
        ]
      },
      inputs: {
        data: { type: 'object' }
      },
      outputs: {
        transformedData: { type: 'object' }
      },
      ports: [
        {
          id: 'input-data',
          type: 'input',
          dataType: 'object',
          required: true
        },
        {
          id: 'output-transformed',
          type: 'output',
          dataType: 'object'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      isCustom: true
    },
    
    // Form Templates
    {
      id: 'preset-form-validation',
      name: 'Form Validator',
      description: 'Validate form data against predefined rules',
      category: 'utility',
      nodeType: 'condition',
      icon: 'check-square',
      configuration: {
        validationRules: [
          { field: 'email', rule: 'isEmail', message: 'Invalid email format' },
          { field: 'phone', rule: 'matches', pattern: '^[0-9]{10}$', message: 'Phone must be 10 digits' },
          { field: 'name', rule: 'isNotEmpty', message: 'Name is required' }
        ],
        validateAll: true,
        stopOnFirstError: false
      },
      inputs: {
        formData: { type: 'object' }
      },
      outputs: {
        validData: { type: 'object' },
        invalidData: { type: 'object' },
        errors: { type: 'array' }
      },
      ports: [
        {
          id: 'input-form',
          type: 'input',
          dataType: 'object',
          required: true
        },
        {
          id: 'output-valid',
          type: 'output',
          dataType: 'object'
        },
        {
          id: 'output-invalid',
          type: 'output',
          dataType: 'object'
        },
        {
          id: 'output-errors',
          type: 'output',
          dataType: 'array'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      isCustom: true
    },
    
    // Social Media Templates
    {
      id: 'preset-social-post',
      name: 'Social Media Publisher',
      description: 'Schedule and publish content to multiple social media platforms',
      category: 'social',
      nodeType: 'action',
      icon: 'share2',
      configuration: {
        platforms: [
          { name: 'facebook', enabled: true },
          { name: 'twitter', enabled: true },
          { name: 'linkedin', enabled: false },
          { name: 'instagram', enabled: false }
        ],
        scheduledTime: '',
        mediaAttachments: [],
        hashtags: []
      },
      inputs: {
        content: { type: 'string' },
        media: { type: 'array' }
      },
      outputs: {
        postIds: { type: 'object' },
        status: { type: 'string' }
      },
      ports: [
        {
          id: 'input-content',
          type: 'input',
          dataType: 'string',
          required: true
        },
        {
          id: 'input-media',
          type: 'input',
          dataType: 'array',
          required: false
        },
        {
          id: 'output-result',
          type: 'output',
          dataType: 'object'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      isCustom: true
    },
    
    // Notification Templates
    {
      id: 'preset-notification',
      name: 'Multi-channel Notifier',
      description: 'Send notifications through multiple channels (email, SMS, push)',
      category: 'messaging',
      nodeType: 'action',
      icon: 'bell-ring',
      configuration: {
        channels: [
          { type: 'email', enabled: true, template: '' },
          { type: 'sms', enabled: false, template: '' },
          { type: 'push', enabled: false, template: '' },
          { type: 'slack', enabled: false, channel: '' }
        ],
        priority: 'normal',
        retry: { enabled: true, maxAttempts: 3, delay: 300 }
      },
      inputs: {
        recipient: { type: 'object' },
        data: { type: 'object' }
      },
      outputs: {
        deliveryStatus: { type: 'object' }
      },
      ports: [
        {
          id: 'input-recipient',
          type: 'input',
          dataType: 'object',
          required: true
        },
        {
          id: 'input-data',
          type: 'input',
          dataType: 'object',
          required: true
        },
        {
          id: 'output-status',
          type: 'output',
          dataType: 'object'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      isCustom: true
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
        {templates.map(template => (
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