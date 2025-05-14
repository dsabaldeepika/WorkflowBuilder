import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { GradientBackground } from '@/components/ui/gradient-background';
import { queryClient } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowRight, 
  Check,
  Clock, 
  Copy, 
  Filter, 
  Search, 
  Tag, 
  ThumbsUp, 
  Users, 
  Zap 
} from 'lucide-react';
import { Link } from 'wouter';

// Interface definitions
interface WorkflowTemplate {
  id: string | number;
  name: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  popularity: number; // Number of imports
  imageUrl?: string;
  createdBy?: string;
  workflowData: any; // The actual workflow JSON data
}

interface Category {
  name: string;
  displayName: string;
  description: string;
  count: number;
  icon: React.ReactNode;
}

const InspirationGallery = () => {
  const { toast } = useToast();
  // Parse URL parameters for initial filter state
  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get('category');
  const initialSearch = params.get('search');
  
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Fetch templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery<WorkflowTemplate[]>({
    queryKey: ['/api/workflow-templates'],
  });

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/workflow-template-categories']
  });

  // Create mutation for importing a template
  const importMutation = useMutation({
    mutationFn: async (templateId: string | number) => {
      const response = await fetch(`/api/workflow-templates/${templateId}/import`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        // Get detailed error message from response if available
        const errorData = await response.json().catch(() => ({ message: 'Failed to import template' }));
        console.error('Template import error:', errorData);
        throw new Error(errorData.message || 'Failed to import template');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Template imported successfully',
        description: 'You can now edit and customize your workflow',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      // Redirect to the workflow editor
      window.location.href = `/workflow-editor/${data.id}`;
    },
    onError: (error: Error) => {
      console.error('Import template error:', error);
      toast({
        title: 'Import failed',
        description: error.message || 'Could not import template. Please make sure you are logged in.',
        variant: 'destructive',
      });
    },
  });

  // Filter templates based on search, category, and tags
  const filteredTemplates = templates.filter(template => {
    // Filter by search query
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by selected category
    const matchesCategory = !selectedCategory || template.category === selectedCategory;

    // Filter by selected tags
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => template.tags.includes(tag));

    return matchesSearch && matchesCategory && matchesTags;
  });

  // Get all unique tags from templates
  const allTags = Array.from(new Set(templates.flatMap(template => template.tags)));

  // Handle template preview
  const handlePreview = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setPreviewDialogOpen(true);
  };

  // Handle template import
  const handleImport = (templateId: string | number) => {
    importMutation.mutate(templateId);
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <GradientBackground>
      <div className="container mx-auto py-8">
        {/* Header section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Workflow Inspiration Gallery</h1>
          <p className="text-lg text-muted-foreground mt-1">
            Discover curated real-world use cases and import templates with a single click
          </p>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search templates..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={selectedTags.length > 0 ? "default" : "outline"} 
              onClick={() => setSelectedTags([])}
              className="flex gap-2"
            >
              <Filter className="h-4 w-4" />
              {selectedTags.length > 0 ? `Filters: ${selectedTags.length}` : 'Filters'}
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          {isLoadingCategories ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card 
                className={`cursor-pointer hover:border-primary hover:shadow-md transition-all ${!selectedCategory ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                  <Zap className={`h-8 w-8 mb-2 ${!selectedCategory ? 'text-primary' : 'text-muted-foreground'}`} />
                  <h3 className="font-medium">All Categories</h3>
                  <p className="text-xs text-muted-foreground mt-1">{templates.length} templates</p>
                </CardContent>
              </Card>
              
              {categories.map((category) => (
                <Card
                  key={category.name}
                  className={`cursor-pointer hover:border-primary hover:shadow-md transition-all ${selectedCategory === category.name ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => setSelectedCategory(category.name === selectedCategory ? null : category.name)}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                    {category.icon}
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{category.count} templates</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Popular Tags</h2>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1 text-sm"
                  onClick={() => toggleTag(tag)}
                >
                  {selectedTags.includes(tag) && <Check className="mr-1 h-3 w-3" />}
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {selectedCategory ? 
                // Look up the display name from categories if available
                `${categories.find(cat => cat.name === selectedCategory)?.displayName || selectedCategory} Templates` 
                : 'All Templates'
              }
              {filteredTemplates.length > 0 && ` (${filteredTemplates.length})`}
            </h2>
            
            <div className="text-sm text-muted-foreground">
              {filteredTemplates.length === 0 && searchQuery && 'No templates found'}
            </div>
          </div>

          {isLoadingTemplates ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-20 mr-2" />
                    <Skeleton className="h-9 w-20" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden flex flex-col hover:shadow-md transition-all">
                  {template.imageUrl && (
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={template.imageUrl} 
                        alt={template.name} 
                        className="w-full h-full object-cover object-center" 
                      />
                      <div className="absolute bottom-0 right-0 bg-background/90 backdrop-blur-sm px-2 py-1 text-xs font-medium rounded-tl-md flex items-center">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {template.popularity} users
                      </div>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base font-medium">{template.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {template.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex flex-wrap gap-1 mt-1 mb-3">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    {template.createdBy && (
                      <div className="text-xs text-muted-foreground flex items-center mt-3">
                        <Users className="h-3 w-3 mr-1" /> Created by {template.createdBy}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => handlePreview(template)}>
                      Preview
                    </Button>
                    <div className="flex gap-2">
                      <Link href={`/templates/${template.id}`}>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        onClick={() => handleImport(template.id)}
                        disabled={importMutation.isPending}
                      >
                        {importMutation.isPending && importMutation.variables === template.id ? (
                          <div className="flex items-center">
                            <span className="mr-2">Importing</span>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : (
                          <>
                            Use Template <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No templates found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We couldn't find any templates matching your current filters. Try adjusting your search criteria or browse all templates.
                </p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setSelectedTags([]);
                }}>
                  Clear All Filters
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Preview Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="max-w-4xl">
            {selectedTemplate && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedTemplate.name}</DialogTitle>
                  <DialogDescription>{selectedTemplate.description}</DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{selectedTemplate.category}</Badge>
                    {selectedTemplate.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>

                  {selectedTemplate.imageUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden border">
                      <img 
                        src={selectedTemplate.imageUrl} 
                        alt={selectedTemplate.name} 
                        className="w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Template Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Difficulty:</span>
                          <span className="font-medium">{selectedTemplate.difficulty}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Used by:</span>
                          <span className="font-medium">{selectedTemplate.popularity} users</span>
                        </div>
                        {selectedTemplate.createdBy && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Created by:</span>
                            <span className="font-medium">{selectedTemplate.createdBy}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">What You'll Get</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span>Pre-configured workflow nodes and connections</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span>Fully customizable settings and values</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span>Ready to use after configuring your accounts</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 mb-4">
                    <h3 className="text-sm font-medium mb-2">Workflow Preview</h3>
                    {/* This would be a simplified view of the workflow structure */}
                    <div className="h-40 bg-muted rounded flex items-center justify-center">
                      <p className="text-muted-foreground">Workflow visualization preview</p>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      handleImport(selectedTemplate.id);
                      setPreviewDialogOpen(false);
                    }}
                    disabled={importMutation.isPending}
                  >
                    {importMutation.isPending ? 'Importing...' : 'Use This Template'}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </GradientBackground>
  );
};

export default InspirationGallery;