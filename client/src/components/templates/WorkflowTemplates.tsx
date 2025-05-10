/**
 * WorkflowTemplates Component
 * 
 * A reusable component that displays a collection of predefined workflow templates.
 * Each template contains:
 * - Visual representation (card with icon)
 * - Detailed step-by-step configuration process
 * - Input validation
 * - Comprehensive documentation
 * 
 * The component follows these design principles:
 * 1. Modularity: Each template is self-contained with its configuration
 * 2. Reusability: Templates follow a consistent structure for easy addition/modification
 * 3. Progressive disclosure: Complex options are revealed step-by-step
 * 4. Contextual help: Each option has detailed explanations
 * 
 * Developer Notes:
 * - To add a new template: Add an entry to the templates array following the WorkflowTemplate interface
 * - Each template should have unique 'id' and consistent 'type' values
 * - Add template-specific configuration steps in the configSteps array
 * - For multi-step templates, each step should focus on one logical group of settings
 */

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Film, 
  RssIcon, 
  Sparkles, 
  Share2, 
  Video, 
  Mail, 
  Database, 
  CalendarCheck,
  Info,
  HelpCircle,
  CheckCircle2,
  Code
} from 'lucide-react';
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
  Database,
  Info,
  HelpCircle,
  CheckCircle2,
  Code,
  ServerCrash,
  PlusCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define the different template types
const TEMPLATE_TYPES = {
  AI_NEWS_VIDEO: 'AI_NEWS_VIDEO',
  SOCIAL_SCHEDULER: 'SOCIAL_SCHEDULER',
  DATA_SYNC: 'DATA_SYNC',
  EMAIL_CAMPAIGN: 'EMAIL_CAMPAIGN',
} as const;

/**
 * Workflow Template Interface
 * 
 * This defines the structure for all workflow templates in the system.
 * Templates are designed to be fully functional when properly configured with all required parameters.
 */
interface WorkflowTemplate {
  // Unique identifier for the template
  id: string;
  
  // Display name shown in the UI
  name: string;
  
  // Short description for card display
  description: string;
  
  // Template category from TEMPLATE_TYPES
  type: keyof typeof TEMPLATE_TYPES;
  
  // Icon component for visual representation
  icon: React.ReactNode;
  
  // Detailed HTML documentation including usage instructions
  documentation: string;
  
  // Technical requirements for this template (APIs, permissions, etc)
  requirements?: string[];
  
  // Optional sample input/output to demonstrate the workflow
  examples?: Array<{
    name: string;
    description: string;
    inputData?: Record<string, any>;
    outputPreview?: string;
  }>;
  
  // Configuration steps that guide the user through setup
  configSteps: {
    title: string;
    description: string;
    fields: {
      name: string;
      type: string;
      label: string;
      placeholder?: string;
      description?: string;
      help?: string; // Detailed help text
      required?: boolean;
      options?: { label: string; value: string }[];
      validation?: any; // Zod schema for validation
      default?: any;
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
    
    // Comprehensive documentation for the template
    documentation: `
      <h2 class="text-xl font-bold mb-4">AI News Video Generator</h2>
      
      <p class="mb-3">This powerful workflow automates the creation and distribution of engaging short-form videos based on AI news articles.</p>
      
      <h3 class="text-lg font-semibold mt-4 mb-2">How It Works</h3>
      <ol class="list-decimal pl-5 mb-4 space-y-2">
        <li><strong>Content Source:</strong> The workflow monitors your specified RSS feed for new AI news articles.</li>
        <li><strong>AI Script Generation:</strong> When a new article is found, an AI model processes the content and generates an engaging, concise video script.</li>
        <li><strong>Canva Video Creation:</strong> The script is sent to Canva's API along with your configured template settings to create a visually appealing video.</li>
        <li><strong>Video Optimization:</strong> The workflow analyzes current trends and keywords to optimize the video title, description, and tags for maximum reach.</li>
        <li><strong>Social Media Publishing:</strong> Finally, the completed video is automatically published to your selected platforms.</li>
      </ol>
      
      <h3 class="text-lg font-semibold mt-4 mb-2">Key Benefits</h3>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li>Save time by automating the entire video creation and publishing process</li>
        <li>Maintain consistent posting schedule without manual intervention</li>
        <li>Leverage AI to create engaging content optimized for each platform</li>
        <li>Stay ahead of competitors by quickly covering the latest AI news</li>
        <li>Build your audience with regular, high-quality content</li>
      </ul>
      
      <h3 class="text-lg font-semibold mt-4 mb-2">Tips for Best Results</h3>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li>Use RSS feeds from reputable AI news sources</li>
        <li>Select a publishing schedule that aligns with your audience's most active times</li>
        <li>Test different script styles to see what resonates best with your audience</li>
        <li>Review and refine the AI-generated scripts initially to ensure quality</li>
        <li>Monitor performance metrics to optimize your workflow settings over time</li>
      </ul>
    `,
    
    // Technical requirements 
    requirements: [
      'OpenAI API key for script generation',
      'Canva Developer API access',
      'Social media platform API credentials',
      'RSS feed URL for AI news content'
    ],
    
    // Examples of use cases
    examples: [
      {
        name: 'Daily AI News Recap',
        description: 'Create a daily 30-second summary video of the top AI news stories, optimized for TikTok and YouTube Shorts',
        inputData: {
          rssFeedUrl: 'https://aiblog.example.com/feed.xml',
          checkFrequency: '24h',
          scriptLength: 'short',
          scriptStyle: 'informative',
          canvaTemplate: 'tech_brief',
          videoRatio: '9:16',
          publishPlatforms: ['tiktok', 'youtube_shorts'],
          publishSchedule: 'peak'
        },
        outputPreview: 'A 30-second vertical video summarizing key AI developments, with dynamic text overlays and background music.'
      },
      {
        name: 'Breaking AI News Alerts',
        description: 'Create immediate video alerts for major AI breakthroughs that can be shared across all major platforms',
        inputData: {
          rssFeedUrl: 'https://aibreakthrough.example.com/feed.xml',
          checkFrequency: '1h',
          scriptLength: 'very_short',
          scriptStyle: 'dramatic',
          canvaTemplate: 'breaking_ai',
          videoRatio: '1:1',
          publishPlatforms: ['tiktok', 'youtube_shorts', 'instagram_reels'],
          publishSchedule: 'immediate'
        },
        outputPreview: 'A 15-second square video with attention-grabbing visuals announcing major AI breakthroughs.'
      }
    ],
    
    // Configuration steps
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
            help: 'Use feeds from reputable AI news sources for best results. The feed should include full article text or sufficient content for the AI to generate meaningful scripts.',
            required: true,
            validation: z.string().url({ message: "Please enter a valid URL" }),
          },
          {
            name: 'checkFrequency',
            type: 'select',
            label: 'Check Frequency',
            description: 'How often to check for new articles',
            help: 'Balance between staying current and avoiding duplicate content. For high-frequency news sources, check more often; for weekly publications, daily checks are sufficient.',
            required: true,
            options: [
              { label: 'Every hour', value: '1h' },
              { label: 'Every 6 hours', value: '6h' },
              { label: 'Every 12 hours', value: '12h' },
              { label: 'Daily', value: '24h' },
            ],
            default: '6h'
          },
          {
            name: 'contentFilter',
            type: 'text',
            label: 'Content Keywords Filter (Optional)',
            placeholder: 'GPT, Machine Learning, Neural Networks',
            description: 'Only process articles containing these keywords (comma-separated)',
            help: 'Use this to narrow down article selection to specific AI topics you want to focus on. Leave blank to process all articles from the feed.',
            required: false,
          }
        ]
      },
      {
        title: 'AI Script Generation',
        description: 'Configure how the AI should generate the video script',
        fields: [
          {
            name: 'openAIModel',
            type: 'select',
            label: 'OpenAI Model',
            description: 'Select the AI model to use for script generation',
            help: 'GPT-4o provides the best quality scripts but is more expensive. GPT-3.5 Turbo is faster and more cost-effective for frequent content generation.',
            required: true,
            options: [
              { label: 'GPT-4o (Recommended)', value: 'gpt-4o' },
              { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
            ],
            default: 'gpt-4o'
          },
          {
            name: 'scriptLength',
            type: 'select',
            label: 'Script Length',
            description: 'The target length for the video script',
            help: 'Short videos typically perform better on social platforms. Very short videos (15-20 seconds) are ideal for TikTok and Instagram Reels.',
            required: true,
            options: [
              { label: 'Very Short (15-20 seconds)', value: 'very_short' },
              { label: 'Short (30-45 seconds)', value: 'short' },
              { label: 'Medium (60-90 seconds)', value: 'medium' },
            ],
            default: 'short'
          },
          {
            name: 'scriptStyle',
            type: 'select',
            label: 'Script Style',
            description: 'The tone and style of the script',
            help: 'Match the style to your audience and brand. Informative works well for technical content, while casual/conversational often drives better engagement.',
            required: true,
            options: [
              { label: 'Informative', value: 'informative' },
              { label: 'Casual/Conversational', value: 'casual' },
              { label: 'Dramatic', value: 'dramatic' },
              { label: 'Humorous', value: 'humorous' },
            ],
            default: 'casual'
          },
          {
            name: 'includeQuotes',
            type: 'checkbox',
            label: 'Include direct quotes from article',
            description: 'Extract and include direct quotes from the article in the script',
            help: 'Direct quotes add credibility and authenticity to your videos. When enabled, the AI will attempt to include relevant quotes from key figures mentioned in the article.',
            default: true
          }
        ]
      },
      {
        title: 'Video Creation',
        description: 'Configure Canva video creation settings',
        fields: [
          {
            name: 'canvaApiKey',
            type: 'password',
            label: 'Canva API Key',
            description: 'Your Canva Developer API key',
            help: 'Obtain this from the Canva Developer Portal. The API key requires permissions for "Create" and "Brand Kit" to access your templates and brand assets.',
            required: true,
            validation: z.string().min(20, { message: "Please enter a valid Canva API key" }),
          },
          {
            name: 'canvaTemplate',
            type: 'select',
            label: 'Canva Template',
            description: 'Choose a template for the video',
            help: 'These templates are designed specifically for AI news content. Each has a different visual style and animation patterns.',
            required: true,
            options: [
              { label: 'Tech News Brief', value: 'tech_brief' },
              { label: 'Breaking AI News', value: 'breaking_ai' },
              { label: 'Future Tech Update', value: 'future_tech' },
            ],
            default: 'tech_brief'
          },
          {
            name: 'videoRatio',
            type: 'select',
            label: 'Video Ratio',
            description: 'The aspect ratio for the video',
            help: 'Match the ratio to your primary platform. Vertical (9:16) is best for TikTok and Stories, square (1:1) works well across most platforms, and horizontal (16:9) is optimal for YouTube.',
            required: true,
            options: [
              { label: 'Vertical (9:16) - TikTok/Shorts', value: '9:16' },
              { label: 'Square (1:1) - Instagram', value: '1:1' },
              { label: 'Horizontal (16:9) - YouTube', value: '16:9' },
            ],
            default: '9:16'
          },
          {
            name: 'brandColors',
            type: 'text',
            label: 'Brand Colors (Optional)',
            placeholder: '#FF5733, #33A8FF',
            description: 'Comma-separated list of brand colors (HEX format)',
            help: 'These colors will be used in the video template to match your brand identity. Provide 1-3 colors for best results.',
            required: false,
          },
          {
            name: 'logoUrl',
            type: 'text',
            label: 'Logo URL (Optional)',
            placeholder: 'https://example.com/logo.png',
            description: 'URL to your brand logo for inclusion in the video',
            help: 'For best results, use a transparent PNG file with dimensions of at least 500x500 pixels.',
            required: false,
            validation: z.string().url().optional().or(z.literal('')),
          }
        ]
      },
      {
        title: 'Optimization & Publishing',
        description: 'Configure video optimization and publishing settings',
        fields: [
          {
            name: 'generateTags',
            type: 'checkbox',
            label: 'Auto-generate optimal tags and keywords',
            description: 'Use AI to generate trending tags related to the content',
            help: 'Leverages trending hashtags and SEO-optimized keywords specific to each platform to maximize reach and discoverability.',
            default: true
          },
          {
            name: 'optimizeThumbnail',
            type: 'checkbox',
            label: 'Generate optimized thumbnail',
            description: 'Create a custom thumbnail for maximum click-through',
            help: 'Uses AI to analyze high-performing thumbnails in the AI niche and generates a similar style with text overlay for your video.',
            default: true
          },
          {
            name: 'publishPlatforms',
            type: 'multiselect',
            label: 'Publishing Platforms',
            description: 'Select platforms to publish the videos to',
            help: 'You\'ll need to configure API access for each platform separately in the Connections section of your dashboard.',
            required: true,
            options: [
              { label: 'TikTok', value: 'tiktok' },
              { label: 'YouTube Shorts', value: 'youtube_shorts' },
              { label: 'Instagram Reels', value: 'instagram_reels' },
            ],
            default: ['tiktok', 'youtube_shorts']
          },
          {
            name: 'publishSchedule',
            type: 'select',
            label: 'Publishing Schedule',
            description: 'When to publish the videos',
            help: 'Peak hours are determined algorithmically based on your audience activity and platform analytics. Specific time allows you to set your own publishing time.',
            required: true,
            options: [
              { label: 'Immediately after creation', value: 'immediate' },
              { label: 'During peak hours (algorithm)', value: 'peak' },
              { label: 'Specific time of day', value: 'specific' },
            ],
            default: 'peak'
          },
          {
            name: 'specificTime',
            type: 'time',
            label: 'Specific Publish Time',
            description: 'If using specific time, select when to publish',
            help: 'This is in your local timezone. For global audiences, consider testing different times to find the optimal publishing window.',
            required: false,
            conditional: {
              field: 'publishSchedule',
              value: 'specific'
            }
          }
        ]
      },
      {
        title: 'Monitoring & Alerts',
        description: 'Set up performance monitoring and notification preferences',
        fields: [
          {
            name: 'enableAlerts',
            type: 'checkbox',
            label: 'Enable email notifications',
            description: 'Receive alerts about workflow execution and performance',
            help: 'You\'ll receive notifications when videos are published, if errors occur, and weekly performance summaries.',
            default: true
          },
          {
            name: 'alertEmail',
            type: 'email',
            label: 'Notification Email',
            placeholder: 'your@email.com',
            description: 'Email address to receive notifications',
            help: 'You can add multiple email addresses separated by commas.',
            required: false,
            conditional: {
              field: 'enableAlerts',
              value: true
            },
            validation: z.string().email().optional().or(z.literal(''))
          },
          {
            name: 'trackAnalytics',
            type: 'checkbox',
            label: 'Track video performance analytics',
            description: 'Gather engagement metrics across platforms',
            help: 'Collects views, likes, shares, comments, and audience retention metrics to help optimize future videos.',
            default: true
          },
          {
            name: 'autoOptimize',
            type: 'checkbox',
            label: 'Auto-optimize based on performance',
            description: 'Automatically adjust settings based on video performance',
            help: 'Uses machine learning to analyze performance patterns and adjust future video parameters for better results.',
            default: false
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
    documentation: `
      <h2 class="text-xl font-bold mb-4">Advanced Social Media Scheduler</h2>
      
      <p class="mb-3">This workflow template helps you plan, schedule, and optimize your social media content across multiple platforms, ensuring consistent posting and maximum engagement.</p>
      
      <h3 class="text-lg font-semibold mt-4 mb-2">Key Features</h3>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li>Multi-platform scheduling with platform-specific optimizations</li>
        <li>Content recycling and variations for evergreen posts</li>
        <li>AI-powered hashtag recommendations and post optimization</li>
        <li>Performance analytics and automatic best time determination</li>
        <li>Content approval workflows for team collaboration</li>
      </ul>
      
      <h3 class="text-lg font-semibold mt-4 mb-2">Integration Capabilities</h3>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li>Twitter/X, LinkedIn, Facebook, Instagram, TikTok</li>
        <li>Content management systems and content libraries</li>
        <li>Analytics platforms for performance tracking</li>
        <li>Team collaboration tools for content approval</li>
      </ul>
    `,
    requirements: [
      'Social media platform API credentials',
      'Content source (CMS, Google Sheets, etc.)',
      'Optional: OpenAI API key for content optimization'
    ],
    configSteps: []
  },
  {
    id: 'data-sync',
    name: 'Cross-Platform Data Sync',
    description: 'Keep data synchronized between different services',
    type: 'DATA_SYNC',
    icon: <Database className="h-10 w-10 text-primary" />,
    documentation: `
      <h2 class="text-xl font-bold mb-4">Cross-Platform Data Sync</h2>
      
      <p class="mb-3">This workflow template establishes bidirectional or unidirectional data synchronization between different platforms and services, ensuring your data stays consistent across your technology stack.</p>
      
      <h3 class="text-lg font-semibold mt-4 mb-2">Key Features</h3>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li>Real-time or scheduled data synchronization</li>
        <li>Field mapping and data transformation</li>
        <li>Conflict resolution and error handling</li>
        <li>Selective sync with filtering capabilities</li>
        <li>Detailed logging and sync history</li>
      </ul>
      
      <h3 class="text-lg font-semibold mt-4 mb-2">Common Use Cases</h3>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li>CRM and marketing platform synchronization</li>
        <li>E-commerce inventory management across marketplaces</li>
        <li>Customer data synchronization between systems</li>
        <li>Project management tool integration</li>
        <li>Finance and accounting system synchronization</li>
      </ul>
    `,
    requirements: [
      'API credentials for all platforms being synchronized',
      'Database access for sync state management',
      'Schema definitions for data mapping'
    ],
    configSteps: []
  },
  {
    id: 'email-campaign',
    name: 'Automated Email Campaign',
    description: 'Create and schedule data-driven email campaigns',
    type: 'EMAIL_CAMPAIGN',
    icon: <Mail className="h-10 w-10 text-primary" />,
    documentation: `
      <h2 class="text-xl font-bold mb-4">Automated Email Campaign</h2>
      
      <p class="mb-3">This workflow template enables you to create, schedule, and optimize email campaigns based on user data and behavior triggers, driving engagement and conversions.</p>
      
      <h3 class="text-lg font-semibold mt-4 mb-2">Key Features</h3>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li>Behavior-triggered email sequences</li>
        <li>Dynamic content personalization</li>
        <li>A/B testing with automatic winner selection</li>
        <li>Send time optimization for each recipient</li>
        <li>Performance analytics and campaign optimization</li>
      </ul>
      
      <h3 class="text-lg font-semibold mt-4 mb-2">Campaign Types</h3>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li>Welcome series for new subscribers</li>
        <li>Abandoned cart recovery sequences</li>
        <li>Re-engagement campaigns for inactive users</li>
        <li>Product recommendation emails based on browsing history</li>
        <li>Event-triggered communications (birthdays, anniversaries, etc.)</li>
      </ul>
    `,
    requirements: [
      'Email service provider API credentials (SendGrid, Mailchimp, etc.)',
      'Customer data source connection',
      'HTML email templates',
      'Optional: OpenAI API for content generation'
    ],
    configSteps: []
  }
];

// Define a schema for the form validation
const templateFormSchema = z.object({
  workflowName: z.string().min(3, { message: "Workflow name must be at least 3 characters." }),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

/**
 * WorkflowTemplates Component
 * 
 * This reusable component renders a grid of template cards, each representing a workflow template
 * that can be configured and deployed. Templates follow a consistent, structured approach with
 * comprehensive documentation and step-by-step configuration.
 */
export default function WorkflowTemplates() {
  // Template state management
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [documentationTemplate, setDocumentationTemplate] = useState<WorkflowTemplate | null>(null);
  const { toast } = useToast();

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      workflowName: '',
    },
  });

  /**
   * Handle template selection for configuration
   * Initializes the configuration wizard for the selected template
   */
  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep(0);
    form.reset({
      workflowName: `${template.name} Workflow`,
    });
  };

  /**
   * Show comprehensive documentation for a template
   * Opens a dialog with detailed usage instructions and technical details
   */
  const handleShowDocumentation = (template: WorkflowTemplate, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the configuration dialog
    setDocumentationTemplate(template);
    setShowDocumentation(true);
  };

  /**
   * Navigate to the next step in configuration wizard
   */
  const handleNext = () => {
    if (selectedTemplate && currentStep < selectedTemplate.configSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Navigate to the previous step in configuration wizard
   */
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
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Dialog key={template.id}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden relative">
                {/* Template Icon */}
                <div className="absolute top-0 right-0 p-3 bg-primary/10 rounded-bl-xl">
                  {template.icon}
                </div>
                
                {/* Info Button */}
                <div 
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => handleShowDocumentation(template, e)}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0 rounded-full bg-blue-100 border-blue-200 hover:bg-blue-200 transition-colors"
                      >
                        <Info className="h-4 w-4 text-blue-600" />
                        <span className="sr-only">Documentation</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>View documentation and usage instructions</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Template tags based on type */}
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
                  
                  {/* Requirements list */}
                  {template.requirements && template.requirements.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {template.requirements.slice(0, 2).map((req, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle2 className="h-3 w-3 mr-1 mt-0.5 text-green-500" />
                            <span>{req}</span>
                          </li>
                        ))}
                        {template.requirements.length > 2 && (
                          <li className="text-xs text-muted-foreground">
                            + {template.requirements.length - 2} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleSelectTemplate(template)}>
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            </DialogTrigger>
            
            {/* Configuration Dialog */}
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
                      
                      {/* Requirements section */}
                      {template.requirements && template.requirements.length > 0 && (
                        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
                          <h3 className="font-medium text-amber-800 flex items-center mb-2">
                            <HelpCircle className="h-4 w-4 mr-2" />
                            Before you begin
                          </h3>
                          <p className="text-sm text-amber-700 mb-2">
                            This template requires the following to function properly:
                          </p>
                          <ul className="text-sm space-y-1 text-amber-700">
                            {template.requirements.map((req, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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
                            <div className="flex items-center justify-between">
                              <Label htmlFor={field.name}>{field.label}</Label>
                              
                              {/* Field help tooltip */}
                              {field.help && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-sm">
                                    <p>{field.help}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            
                            {field.type === 'text' && (
                              <Input
                                id={field.name}
                                placeholder={field.placeholder}
                                required={field.required}
                                defaultValue={field.default}
                              />
                            )}
                            {field.type === 'password' && (
                              <Input
                                id={field.name}
                                type="password"
                                placeholder={field.placeholder}
                                required={field.required}
                              />
                            )}
                            {field.type === 'select' && (
                              <select
                                id={field.name}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                required={field.required}
                                defaultValue={field.default}
                              >
                                <option value="">Select an option</option>
                                {field.options?.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            )}
                            {field.type === 'checkbox' && (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={field.name}
                                  className="rounded border-gray-300 text-primary focus:ring-primary"
                                  defaultChecked={field.default}
                                />
                                <Label htmlFor={field.name} className="text-sm font-normal">
                                  {field.description}
                                </Label>
                              </div>
                            )}
                            {field.description && field.type !== 'checkbox' && (
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
      
      {/* Documentation Dialog */}
      <Dialog open={showDocumentation} onOpenChange={setShowDocumentation}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {documentationTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center">
                  <div className="mr-2 p-2 bg-primary/10 rounded-full">
                    {documentationTemplate.icon}
                  </div>
                  <DialogTitle>{documentationTemplate.name}</DialogTitle>
                </div>
                <DialogDescription>
                  {documentationTemplate.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Documentation HTML */}
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: documentationTemplate.documentation }}
                />
                
                {/* Requirements */}
                {documentationTemplate.requirements && documentationTemplate.requirements.length > 0 && (
                  <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-md">
                    <h3 className="text-base font-semibold mb-2">Technical Requirements</h3>
                    <ul className="space-y-2">
                      {documentationTemplate.requirements.map((req, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <Code className="h-5 w-5 mr-2 mt-0.5 text-slate-500" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Example use cases */}
                {documentationTemplate.examples && documentationTemplate.examples.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-base font-semibold mb-3">Example Use Cases</h3>
                    <div className="space-y-4">
                      {documentationTemplate.examples.map((example, index) => (
                        <div key={index} className="p-4 border rounded-md bg-slate-50">
                          <h4 className="font-medium text-sm">{example.name}</h4>
                          <p className="text-sm mb-2 text-muted-foreground">{example.description}</p>
                          
                          {example.outputPreview && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <strong>Output:</strong> {example.outputPreview}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  onClick={() => {
                    setShowDocumentation(false);
                    handleSelectTemplate(documentationTemplate);
                  }}
                >
                  Use This Template
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}