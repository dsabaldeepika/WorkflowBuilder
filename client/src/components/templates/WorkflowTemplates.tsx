import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { WorkflowTemplate } from "@shared/schema";
import { Loader2, Search, Eye, Workflow } from "lucide-react";
import { Link } from 'wouter';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { TemplateFavoriteButton } from './TemplateFavoriteButton';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { InlineWorkflowLoading } from '@/components/workflow/InlineWorkflowLoading';

// Categories to filter templates
const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'lead-management', label: 'Lead Management' },
  { value: 'lead-nurturing', label: 'Lead Nurturing' },
  { value: 'team-notifications', label: 'Team Notifications' },
  { value: 'ai-automation', label: 'AI Automation' },
  { value: 'data-synchronization', label: 'Data Synchronization' },
  { value: 'document-automation', label: 'Document Automation' },
  { value: 'task-management', label: 'Task Management' },
  { value: 'email-marketing', label: 'Email Marketing' }
];

export default function WorkflowTemplates() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<WorkflowTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  
  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteTemplates');
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites);
        setFavoriteIds(favorites);
      } catch (e) {
        console.error('Error parsing favorites from localStorage:', e);
        setFavoriteIds([]);
      }
    }
  }, []);

  // Build query string based on filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (searchTerm.trim()) {
      params.append('search', searchTerm.trim());
    }
    
    if (selectedCategory !== 'all') {
      params.append('category', selectedCategory);
    }
    
    return params.toString();
  };

  // Fetch templates with the applied filters
  const { data: templates, isLoading, isError } = useQuery<WorkflowTemplate[]>({
    queryKey: ['/api/workflow/templates', searchTerm, selectedCategory],
    queryFn: async () => {
      const queryStr = buildQueryString();
      const url = `/api/workflow/templates${queryStr ? `?${queryStr}` : ''}`;
      return fetch(url).then(res => res.json());
    }
  });

  // Get complexity badge color based on complexity level
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handlePreviewTemplate = (template: WorkflowTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };
  
  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };
  
  const handleUseTemplate = (template: WorkflowTemplate) => {
    // This will be expanded later to actually use the template
    toast({
      title: "Template selected",
      description: `You selected the "${template.name}" template.`,
    });
    setIsPreviewOpen(false);
    // Navigate to workflow builder with template
    window.location.href = `/create?template=${template.id}`;
  };

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Link href="/templates">
          <Button variant="outline">
            View All Templates
          </Button>
        </Link>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-32">
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                ease: "linear",
                repeat: Infinity
              }}
            >
              <Workflow className="h-12 w-12 text-blue-500" />
            </motion.div>
            <InlineWorkflowLoading 
              size="lg" 
              text="Loading templates" 
              variant="default" 
            />
          </div>
        </div>
      )}
      
      {/* Error state */}
      {isError && (
        <div className="text-center text-red-500 py-8">
          Failed to load templates. Please try again.
        </div>
      )}
      
      {/* Templates Grid */}
      {!isLoading && templates && templates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.slice(0, 6).map((template) => (
            <Card key={template.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </div>
                  <TemplateFavoriteButton 
                    templateId={template.id} 
                    initialFavorited={favoriteIds.includes(template.id)}
                    onFavoriteChange={(templateId, isFavorited) => {
                      const newFavorites = isFavorited 
                        ? [...favoriteIds, templateId]
                        : favoriteIds.filter(id => id !== templateId);
                      setFavoriteIds(newFavorites);
                    }}
                  />
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 pb-4 flex-grow">
                <div className="flex flex-wrap gap-2 mb-2">
                  {template.tags?.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {(template.tags?.length || 0) > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(template.tags?.length || 0) - 3} more
                    </Badge>
                  )}
                </div>
                
                <Badge variant="secondary" className={`${getComplexityColor(template.complexity || 'medium')} text-xs capitalize`}>
                  {template.complexity || 'medium'} complexity
                </Badge>
              </CardContent>
              
              <CardFooter className="pt-0">
                <div className="w-full flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1" 
                    variant="outline"
                    onClick={() => handlePreviewTemplate(template)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1" 
                    variant="default"
                    onClick={() => handleUseTemplate(template)}
                  >
                    Use Template
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && templates && templates.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
      
      {/* "View All Templates" button at the bottom */}
      {!isLoading && templates && templates.length > 6 && (
        <div className="flex justify-center mt-8">
          <Link href="/templates">
            <Button variant="outline">
              View All Templates ({templates.length})
            </Button>
          </Link>
        </div>
      )}
      
      {/* Template Preview Modal */}
      <TemplatePreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        template={previewTemplate}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
}