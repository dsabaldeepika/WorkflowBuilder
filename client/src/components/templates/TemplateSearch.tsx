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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { WorkflowTemplate } from "@shared/schema";
import { Loader2, Clock, FileBadge, Tag, Search, Eye, Star, Send, Mail, MessageSquare } from "lucide-react";
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { TemplateFavoriteButton } from './TemplateFavoriteButton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'lead-management', label: 'Lead Management' },
  { value: 'lead-nurturing', label: 'Lead Nurturing' },
  { value: 'team-notifications', label: 'Team Notifications' },
  { value: 'ai-automation', label: 'AI Automation' },
  { value: 'data-extraction', label: 'Data Extraction' },
  { value: 'task-management', label: 'Task Management' },
  { value: 'data-synchronization', label: 'Data Synchronization' },
  { value: 'document-automation', label: 'Document Automation' },
  { value: 'email-marketing', label: 'Email Marketing' }
];

const COMPLEXITY_OPTIONS = [
  { value: 'all', label: 'All Complexity' },
  { value: 'simple', label: 'Simple' },
  { value: 'medium', label: 'Medium' },
  { value: 'complex', label: 'Complex' }
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'complexity', label: 'Complexity' },
  { value: 'popular', label: 'Most Popular' }
];

export function TemplateSearch() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [previewTemplate, setPreviewTemplate] = useState<WorkflowTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  
  // Contact form states
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [templateRequestModalOpen, setTemplateRequestModalOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [templateRequestName, setTemplateRequestName] = useState('');
  const [templateRequestEmail, setTemplateRequestEmail] = useState('');
  const [templateRequestDescription, setTemplateRequestDescription] = useState('');

  // Build the query string based on filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (searchTerm.trim()) {
      params.append('search', searchTerm.trim());
    }
    
    if (selectedCategory !== 'all') {
      params.append('category', selectedCategory);
    }
    
    if (selectedComplexity !== 'all') {
      params.append('complexity', selectedComplexity);
    }
    
    params.append('sort', sortBy);
    
    return params.toString();
  };

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
  
  // Fetch templates with filters
  const { data: templates, isLoading, isError } = useQuery<WorkflowTemplate[]>({
    queryKey: ['/api/workflow/templates', searchTerm, selectedCategory, selectedComplexity, sortBy],
    queryFn: async () => {
      const queryStr = buildQueryString();
      const url = `/api/workflow/templates${queryStr ? `?${queryStr}` : ''}`;
      return fetch(url).then(res => res.json());
    }
  });
  
  // Filter templates by favorites if the option is selected
  const filteredTemplates = templates ? (
    showFavoritesOnly 
      ? templates.filter(template => favoriteIds.includes(template.id))
      : templates
  ) : [];

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
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Workflow Templates</h1>
        <p className="text-gray-600 mb-6">
          Browse our collection of pre-built workflow templates to get started quickly.
          Use filters to find the perfect template for your needs.
        </p>
        
        {/* Search and filter section */}
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
          
          <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Complexity" />
            </SelectTrigger>
            <SelectContent>
              {COMPLEXITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant={showFavoritesOnly ? "default" : "outline"} 
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={showFavoritesOnly ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
          >
            <Star className="h-4 w-4 mr-2" fill={showFavoritesOnly ? "currentColor" : "none"} />
            {showFavoritesOnly ? "Showing Favorites" : "Show Favorites"}
          </Button>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading templates...</span>
        </div>
      )}
      
      {/* Error state */}
      {isError && (
        <div className="text-center text-red-500 py-8">
          Failed to load templates. Please try again.
        </div>
      )}
      
      {/* Template grid */}
      {!isLoading && filteredTemplates.length > 0 && (
        <>
          <div className="text-sm text-gray-500 mb-4">
            Found {filteredTemplates.length} {showFavoritesOnly ? 'favorite ' : ''}template{filteredTemplates.length !== 1 ? 's' : ''}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{template.name}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2 h-10">
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
                
                <CardContent className="flex-grow">
                  <div className="flex flex-wrap gap-2 mb-4">
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
                  
                  <div className="flex gap-3 text-xs text-gray-500">
                    <div className="flex items-center">
                      <FileBadge className="h-3.5 w-3.5 mr-1" />
                      <span className="capitalize">{template.category}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{template.estimatedDuration}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-2 border-t">
                  <div className="w-full flex flex-wrap justify-between items-center">
                    <Badge variant="secondary" className={`${getComplexityColor(template.complexity || 'medium')} capitalize`}>
                      {template.complexity || 'medium'} complexity
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handlePreviewTemplate(template)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" variant="default" onClick={() => handleUseTemplate(template)}>
                        Use
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {/* Empty state */}
      {!isLoading && templates && filteredTemplates.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <FileBadge className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {showFavoritesOnly 
              ? "No favorite templates found" 
              : "No templates found"}
          </h3>
          <p className="text-gray-500 mb-4">
            {showFavoritesOnly 
              ? "You haven't favorited any templates yet, or none match your current filters." 
              : "Try adjusting your search or filters to find what you're looking for."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {showFavoritesOnly && (
              <Button
                variant="default"
                onClick={() => setShowFavoritesOnly(false)}
              >
                Show All Templates
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedComplexity('all');
                setSortBy('name');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}
      
      {/* Template Preview Modal */}
      <TemplatePreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        template={previewTemplate}
        onUseTemplate={handleUseTemplate}
      />
      
      {/* Contact Form Modal */}
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription>
              Need help finding the right template? Our support team is here to help.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="Your name" 
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Your email address" 
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                placeholder="How can we help you?" 
                rows={4}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactModalOpen(false)}>Cancel</Button>
            <Button 
              type="submit"
              onClick={() => {
                // In a real app, this would send the data to your backend
                toast({
                  title: "Message sent",
                  description: "Thank you for contacting us. We'll get back to you shortly.",
                });
                setContactModalOpen(false);
                setContactName('');
                setContactEmail('');
                setContactMessage('');
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Template Request Modal */}
      <Dialog open={templateRequestModalOpen} onOpenChange={setTemplateRequestModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Custom Template</DialogTitle>
            <DialogDescription>
              Can't find what you need? Request a custom template for your workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="requestName">Name</Label>
              <Input 
                id="requestName" 
                placeholder="Your name" 
                value={templateRequestName}
                onChange={(e) => setTemplateRequestName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requestEmail">Email</Label>
              <Input 
                id="requestEmail" 
                type="email" 
                placeholder="Your email address" 
                value={templateRequestEmail}
                onChange={(e) => setTemplateRequestEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requestDescription">Template Description</Label>
              <Textarea 
                id="requestDescription" 
                placeholder="Please describe the workflow template you would like us to create" 
                rows={5}
                value={templateRequestDescription}
                onChange={(e) => setTemplateRequestDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateRequestModalOpen(false)}>Cancel</Button>
            <Button 
              type="submit"
              onClick={() => {
                // In a real app, this would send the data to your backend
                toast({
                  title: "Request submitted",
                  description: "Thank you for your request. Our team will review it and get back to you.",
                });
                setTemplateRequestModalOpen(false);
                setTemplateRequestName('');
                setTemplateRequestEmail('');
                setTemplateRequestDescription('');
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}