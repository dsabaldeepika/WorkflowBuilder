import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Clock, Star, Zap, X, FileText, ShoppingCart, Mail, 
  Bell, Calendar, Database, ArrowRight, UploadCloud
} from 'lucide-react';

// Template categories
const CATEGORIES = ['All', 'Popular', 'Marketing', 'Sales', 'IT', 'HR', 'Finance', 'Customer Support'];

// Template difficulty levels
const DIFFICULTY = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

// Template interface
interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  category: string[];
  difficulty: string;
  estimatedTime: string;
  rating: number;
  usageCount: number;
  icon1: React.ComponentType<any>;
  icon2: React.ComponentType<any>;
  featured?: boolean;
}

// Dummy templates data
const TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'new-lead-notification',
    title: 'New Lead Notification',
    description: 'Send Slack notification when a new lead is created in your CRM',
    category: ['Sales', 'Marketing'],
    difficulty: DIFFICULTY.BEGINNER,
    estimatedTime: '5 min',
    rating: 4.8,
    usageCount: 12540,
    icon1: Database,
    icon2: Bell,
    featured: true,
  },
  {
    id: 'document-approval',
    title: 'Document Approval Workflow',
    description: 'Create an approval process for documents in Google Drive',
    category: ['IT'],
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedTime: '10 min',
    rating: 4.6,
    usageCount: 8920,
    icon1: FileText,
    icon2: ArrowRight,
  },
  {
    id: 'order-fulfillment',
    title: 'Order Fulfillment',
    description: 'Automated workflow for processing new orders in your e-commerce platform',
    category: ['Sales'],
    difficulty: DIFFICULTY.INTERMEDIATE,
    estimatedTime: '15 min',
    rating: 4.7,
    usageCount: 10340,
    icon1: ShoppingCart,
    icon2: Mail,
    featured: true,
  },
  {
    id: 'weekly-report',
    title: 'Weekly Analytics Report',
    description: 'Send automated weekly reports with your analytics data',
    category: ['Marketing'],
    difficulty: DIFFICULTY.BEGINNER,
    estimatedTime: '5 min',
    rating: 4.5,
    usageCount: 9560,
    icon1: Calendar,
    icon2: Mail,
  },
  {
    id: 'data-backup',
    title: 'Automated Data Backup',
    description: 'Regularly backup important data to secure storage',
    category: ['IT'],
    difficulty: DIFFICULTY.ADVANCED,
    estimatedTime: '20 min',
    rating: 4.9,
    usageCount: 7820,
    icon1: Database,
    icon2: UploadCloud,
  },
];

interface TemplateCardProps {
  template: WorkflowTemplate;
  onSelect: (template: WorkflowTemplate) => void;
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <div 
      className="border rounded-md p-4 hover:border-primary hover:shadow-sm transition-all cursor-pointer bg-white"
      onClick={() => onSelect(template)}
    >
      {template.featured && (
        <Badge variant="secondary" className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
          <Star className="h-3 w-3 mr-1 fill-current" />
          Featured
        </Badge>
      )}
      
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center mr-2">
          <template.icon1 size={16} />
        </div>
        <div className="w-8 h-8 rounded-md bg-green-100 text-green-600 flex items-center justify-center">
          <template.icon2 size={16} />
        </div>
        <div className="text-xs text-gray-500 flex items-center mx-2">
          <ArrowRight size={12} />
        </div>
      </div>
      
      <h3 className="font-medium text-sm mb-1">{template.title}</h3>
      <p className="text-xs text-gray-500 mb-3">{template.description}</p>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {template.estimatedTime}
        </span>
        <span className="flex items-center">
          <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
          {template.rating}
        </span>
        <span className="flex items-center">
          <Zap className="h-3 w-3 mr-1" />
          {template.usageCount.toLocaleString()} uses
        </span>
      </div>
    </div>
  );
}

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: WorkflowTemplate) => void;
}

export function TemplateGallery({ isOpen, onClose, onSelectTemplate }: TemplateGalleryProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTemplates = TEMPLATES.filter(template => {
    // Filter by category
    if (activeCategory !== 'All' && !template.category.includes(activeCategory)) {
      return false;
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        template.title.toLowerCase().includes(query) || 
        template.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Workflow Templates</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
          <DialogDescription>
            Choose a pre-built workflow template to get started quickly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-4 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search templates..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="All" className="flex-1 flex flex-col" onValueChange={setActiveCategory}>
          <TabsList className="grid grid-cols-8">
            {CATEGORIES.map(category => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <ScrollArea className="flex-1 mt-4">
            <div className="grid grid-cols-3 gap-4 p-1">
              {filteredTemplates.map(template => (
                <TemplateCard 
                  key={template.id} 
                  template={template}
                  onSelect={onSelectTemplate}
                />
              ))}
              
              {filteredTemplates.length === 0 && (
                <div className="col-span-3 py-8 text-center text-gray-500">
                  <p>No templates found for your search criteria.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}