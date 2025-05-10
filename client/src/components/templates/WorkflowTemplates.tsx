import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { 
  Video, 
  RssIcon, 
  Sparkles, 
  Share2, 
  Film,
  Share,
  CalendarCheck,
  FileSearch,
  Mail,
  Database
} from 'lucide-react';

// Define the different template types
const TEMPLATE_TYPES = {
  AI_NEWS_VIDEO: 'AI_NEWS_VIDEO',
  SOCIAL_SCHEDULER: 'SOCIAL_SCHEDULER',
  DATA_SYNC: 'DATA_SYNC',
  EMAIL_CAMPAIGN: 'EMAIL_CAMPAIGN',
} as const;

// Workflow template type
interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  type: keyof typeof TEMPLATE_TYPES;
  icon: React.ReactNode;
  configSteps: {
    title: string;
    description: string;
    fields: {
      name: string;
      type: string;
      label: string;
      placeholder?: string;
      description?: string;
      required?: boolean;
      options?: { label: string; value: string }[];
    }[];
  }[];
}

// Define templates
const templates: WorkflowTemplate[] = [
  {
    id: 'ai-news-video',
    name: 'AI News Video Generator',
    description: 'Automatically create viral short-form videos from AI news articles',
    type: 'AI_NEWS_VIDEO',
    icon: <Video className="h-10 w-10 text-primary" />,
    configSteps: [
      {
        title: 'Content Source',
        description: 'Configure where to find the AI news articles',
        fields: [
          {
            name: 'rssFeedUrl',
            type: 'text',
            label: 'RSS Feed URL',
            placeholder: 'https://example.com/ai-news-feed.xml',
            description: 'Enter the URL of the RSS feed containing AI news articles',
            required: true,
          },
          {
            name: 'checkFrequency',
            type: 'select',
            label: 'Check Frequency',
            description: 'How often to check for new articles',
            required: true,
            options: [
              { label: 'Every hour', value: '1h' },
              { label: 'Every 6 hours', value: '6h' },
              { label: 'Every 12 hours', value: '12h' },
              { label: 'Daily', value: '24h' },
            ],
          }
        ]
      },
      {
        title: 'AI Script Generation',
        description: 'Configure how the AI should generate the video script',
        fields: [
          {
            name: 'scriptLength',
            type: 'select',
            label: 'Script Length',
            description: 'The target length for the video script',
            required: true,
            options: [
              { label: 'Very Short (15-20 seconds)', value: 'very_short' },
              { label: 'Short (30-45 seconds)', value: 'short' },
              { label: 'Medium (60-90 seconds)', value: 'medium' },
            ],
          },
          {
            name: 'scriptStyle',
            type: 'select',
            label: 'Script Style',
            description: 'The tone and style of the script',
            required: true,
            options: [
              { label: 'Informative', value: 'informative' },
              { label: 'Casual/Conversational', value: 'casual' },
              { label: 'Dramatic', value: 'dramatic' },
              { label: 'Humorous', value: 'humorous' },
            ],
          }
        ]
      },
      {
        title: 'Video Creation',
        description: 'Configure Canva video creation settings',
        fields: [
          {
            name: 'canvaTemplate',
            type: 'select',
            label: 'Canva Template',
            description: 'Choose a template for the video',
            required: true,
            options: [
              { label: 'Tech News Brief', value: 'tech_brief' },
              { label: 'Breaking AI News', value: 'breaking_ai' },
              { label: 'Future Tech Update', value: 'future_tech' },
            ],
          },
          {
            name: 'videoRatio',
            type: 'select',
            label: 'Video Ratio',
            description: 'The aspect ratio for the video',
            required: true,
            options: [
              { label: 'Vertical (9:16) - TikTok/Shorts', value: '9:16' },
              { label: 'Square (1:1) - Instagram', value: '1:1' },
              { label: 'Horizontal (16:9) - YouTube', value: '16:9' },
            ],
          }
        ]
      },
      {
        title: 'Publishing',
        description: 'Configure where to publish the videos',
        fields: [
          {
            name: 'publishPlatforms',
            type: 'multiselect',
            label: 'Publishing Platforms',
            description: 'Select platforms to publish the videos to',
            required: true,
            options: [
              { label: 'TikTok', value: 'tiktok' },
              { label: 'YouTube Shorts', value: 'youtube_shorts' },
              { label: 'Instagram Reels', value: 'instagram_reels' },
            ],
          },
          {
            name: 'publishSchedule',
            type: 'select',
            label: 'Publishing Schedule',
            description: 'When to publish the videos',
            required: true,
            options: [
              { label: 'Immediately after creation', value: 'immediate' },
              { label: 'During peak hours (algorithm)', value: 'peak' },
              { label: 'Specific time of day', value: 'specific' },
            ],
          }
        ]
      }
    ]
  },
  {
    id: 'social-scheduler',
    name: 'Advanced Social Media Scheduler',
    description: 'Schedule and optimize social media posts across platforms',
    type: 'SOCIAL_SCHEDULER',
    icon: <CalendarCheck className="h-10 w-10 text-primary" />,
    configSteps: []
  },
  {
    id: 'data-sync',
    name: 'Cross-Platform Data Sync',
    description: 'Keep data synchronized between different services',
    type: 'DATA_SYNC',
    icon: <Database className="h-10 w-10 text-primary" />,
    configSteps: []
  },
  {
    id: 'email-campaign',
    name: 'Automated Email Campaign',
    description: 'Create and schedule data-driven email campaigns',
    type: 'EMAIL_CAMPAIGN',
    icon: <Mail className="h-10 w-10 text-primary" />,
    configSteps: []
  }
];

// Define a schema for the form validation
const templateFormSchema = z.object({
  workflowName: z.string().min(3, { message: "Workflow name must be at least 3 characters." }),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

export default function WorkflowTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      workflowName: '',
    },
  });

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep(0);
    form.reset({
      workflowName: `${template.name} Workflow`,
    });
  };

  const handleNext = () => {
    if (selectedTemplate && currentStep < selectedTemplate.configSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: TemplateFormValues) => {
    try {
      // Here you would integrate with your workflow creation system
      console.log('Creating workflow from template:', {
        template: selectedTemplate,
        name: data.workflowName,
        // Add other form data here
      });
      
      toast({
        title: 'Workflow Created',
        description: `${data.workflowName} has been created successfully.`,
      });
      
      // Redirect to workflow edit page or close modal
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create workflow. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Dialog key={template.id}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden">
              <div className="absolute top-0 right-0 p-3 bg-primary/10 rounded-bl-xl">
                {template.icon}
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mt-2">
                  {template.type === 'AI_NEWS_VIDEO' && (
                    <>
                      <div className="flex items-center bg-primary/5 text-sm px-2 py-1 rounded">
                        <RssIcon className="h-3 w-3 mr-1" /> RSS Source
                      </div>
                      <div className="flex items-center bg-primary/5 text-sm px-2 py-1 rounded">
                        <Sparkles className="h-3 w-3 mr-1" /> AI Script
                      </div>
                      <div className="flex items-center bg-primary/5 text-sm px-2 py-1 rounded">
                        <Film className="h-3 w-3 mr-1" /> Canva Video
                      </div>
                      <div className="flex items-center bg-primary/5 text-sm px-2 py-1 rounded">
                        <Share2 className="h-3 w-3 mr-1" /> Auto Publish
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleSelectTemplate(template)}>
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          </DialogTrigger>
          
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{template.name}</DialogTitle>
              <DialogDescription>
                {template.description}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {currentStep === 0 ? (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="workflowName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workflow Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter workflow name" {...field} />
                          </FormControl>
                          <FormDescription>
                            Give your workflow a descriptive name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  selectedTemplate && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        {selectedTemplate.configSteps[currentStep - 1].title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {selectedTemplate.configSteps[currentStep - 1].description}
                      </p>
                      
                      {selectedTemplate.configSteps[currentStep - 1].fields.map((field) => (
                        <div key={field.name} className="space-y-2">
                          <Label htmlFor={field.name}>{field.label}</Label>
                          {field.type === 'text' && (
                            <Input
                              id={field.name}
                              placeholder={field.placeholder}
                              required={field.required}
                            />
                          )}
                          {field.type === 'select' && (
                            <select
                              id={field.name}
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              required={field.required}
                            >
                              <option value="">Select an option</option>
                              {field.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          )}
                          {field.description && (
                            <p className="text-xs text-muted-foreground">{field.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                )}
                
                <DialogFooter className="flex justify-between">
                  {currentStep > 0 && (
                    <Button type="button" variant="outline" onClick={handleBack}>
                      Back
                    </Button>
                  )}
                  
                  <div className="flex-1"></div>
                  
                  {selectedTemplate && currentStep < selectedTemplate.configSteps.length ? (
                    <Button type="button" onClick={handleNext}>
                      Next Step
                    </Button>
                  ) : (
                    <Button type="submit">Create Workflow</Button>
                  )}
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}