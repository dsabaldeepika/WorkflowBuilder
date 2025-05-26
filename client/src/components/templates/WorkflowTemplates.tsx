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
import { 
  Loader2, Search, Eye, Workflow, PlusCircle, 
  Info, Briefcase, Tag, BarChart3, Lightbulb,
  Zap, Users, Clock, Star
} from "lucide-react";
import { Link } from 'wouter';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { TemplateFavoriteButton } from './TemplateFavoriteButton';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { InlineWorkflowLoading } from '@/components/workflow/InlineWorkflowLoading';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CreateTemplateModal } from './CreateTemplateModal';
import { Skeleton } from "@/components/ui/skeleton";

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  
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
  const { data: templates, isLoading, isError, refetch } = useQuery<WorkflowTemplate[]>({
    queryKey: ['/api/workflow/templates', searchTerm, selectedCategory],
    queryFn: async () => {
      const queryStr = buildQueryString();
      const url = `/api/workflow/templates${queryStr ? `?${queryStr}` : ''}`;
      return fetch(url).then(res => res.json());
    }
  });

  // Get difficulty badge color based on difficulty level
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
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

  const handleCreateTemplate = async (templateData: any) => {
    try {
      const response = await fetch('/api/workflow/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      toast({
        title: "Success!",
        description: "Template created successfully",
        variant: "default",
      });

      // Refetch templates
      await refetch();
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Workflow Templates
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose from our curated collection of pre-built workflows to automate your business processes
        </p>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="backdrop-blur-sm bg-white/50 rounded-xl shadow-lg p-4 mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 border-gray-200 focus:border-indigo-500 transition-all duration-200"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px] bg-white/80 border-gray-200">
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
        </div>
      </motion.div>
      
      {/* Loading state */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center h-64"
          >
            <div className="flex flex-col items-center space-y-4">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: {
                    duration: 2,
                    ease: "linear",
                    repeat: Infinity
                  },
                  scale: {
                    duration: 1,
                    repeat: Infinity
                  }
                }}
              >
                <Workflow className="h-16 w-16 text-indigo-500" />
              </motion.div>
              <InlineWorkflowLoading 
                size="lg" 
                text="Loading amazing templates" 
                variant="default" 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Error state */}
      {isError && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-red-500 py-8 bg-red-50 rounded-lg shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-2">Oops! Something went wrong</h3>
          <p>We couldn't load the templates. Please try again later.</p>
        </motion.div>
      )}
      
      {/* Templates Grid */}
      {!isLoading && templates && templates.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {templates.slice(0, 6).map((template, idx) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="group h-full hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur-sm border border-gray-200/50 overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-300">
                        {template.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-gray-600">
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
                
                <CardContent className="pt-0 pb-4 flex-grow space-y-4">
                  {/* Template Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>5-10 mins setup</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{template.popularity}+ users</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {template.tags?.slice(0, 3).map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs bg-white/50 border-gray-200/50 px-2 py-1 rounded-full"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {(template.tags?.length || 0) > 3 && (
                      <Badge variant="outline" className="text-xs bg-white/50">
                        +{(template.tags?.length || 0) - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <Badge 
                    variant="secondary" 
                    className={`${getDifficultyColor(template.difficulty || 'medium')} text-xs capitalize flex items-center w-fit gap-1`}
                  >
                    <Zap className="h-3 w-3" />
                    {template.difficulty || 'medium'} difficulty
                  </Badge>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <div className="w-full flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-white hover:bg-gray-50" 
                      variant="outline"
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white" 
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Use Template
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {/* Empty state */}
      {!isLoading && templates && templates.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border border-gray-200/50"
        >
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="bg-white hover:bg-gray-50"
          >
            Clear Filters
          </Button>
        </motion.div>
      )}
      
      {/* View All Templates button */}
      {!isLoading && templates && templates.length > 6 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mt-12"
        >
          <Link href="/templates">
            <Button 
              variant="outline"
              className="bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
            >
              View All Templates ({templates.length})
            </Button>
          </Link>
        </motion.div>
      )}
      
      {/* Template Preview Modal */}
      <TemplatePreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        template={previewTemplate}
        onUseTemplate={handleUseTemplate}
      />

      {/* Enhanced FAB */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full shadow-lg p-5 flex items-center justify-center transition-shadow duration-200 focus:outline-none focus:ring-4 focus:ring-purple-300"
              aria-label="Create New Workflow Template"
              onClick={() => setShowCreateModal(true)}
            >
              <PlusCircle className="h-8 w-8" />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-white p-3 shadow-xl">
            <div className="space-y-1">
              <span className="font-semibold text-gray-900">Create New Workflow Template</span>
              <div className="text-xs text-gray-500">Start building a new business automation workflow from scratch.</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTemplate={handleCreateTemplate}
      />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <Card key={idx} className="flex flex-col h-full">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="pb-4 flex-grow space-y-4">
                <div className="flex flex-wrap gap-2">
                  {[...Array(3)].map((_, tagIdx) => (
                    <Skeleton key={tagIdx} className="h-5 w-16" />
                  ))}
                </div>
                <Skeleton className="h-5 w-24" />
              </CardContent>
              <CardFooter className="pt-0">
                <div className="w-full flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}