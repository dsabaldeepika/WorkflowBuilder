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
                  <CardHeader className="pb-2 relative">
                    <div className="absolute top-0 right-0 -mt-3 -mr-3">
                      {template.difficulty === 'beginner' ? (
                        <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-400 flex items-center shadow-sm">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                          Beginner Friendly
                        </div>
                      ) : template.difficulty === 'intermediate' ? (
                        <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-400 flex items-center shadow-sm">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></div>
                          Intermediate
                        </div>
                      ) : (
                        <div className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-purple-400 flex items-center shadow-sm">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-1"></div>
                          Advanced
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-start">
                      <CardTitle className="text-lg font-bold bg-gradient-to-r from-primary via-purple-500 to-primary/70 bg-clip-text text-transparent">
                        {template.name}
                      </CardTitle>
                      
                      <div className="w-full h-1 mt-1.5 mb-2 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full"></div>
                      
                      <CardDescription className="mt-1">
                        <p className="line-clamp-2">{template.description}</p>
                        <div className="mt-3 flex items-center">
                          <div className="relative w-16 h-16 mr-3 flex-shrink-0">
                            <div className="absolute inset-0 bg-primary/10 rounded-full flex items-center justify-center">
                              <Clock className="h-6 w-6 text-primary" />
                            </div>
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="16" fill="none" className="stroke-primary/20" strokeWidth="2" />
                              <circle cx="18" cy="18" r="16" fill="none" className="stroke-primary" strokeWidth="2" 
                                strokeDasharray="100" 
                                strokeDashoffset={template.difficulty === 'beginner' ? 25 : template.difficulty === 'intermediate' ? 50 : 75} 
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Time Saved:</p>
                            <p className="font-bold text-lg text-primary">
                              {template.difficulty === 'beginner' ? '1-2 hours' : template.difficulty === 'intermediate' ? '3-5 hours' : '8+ hours'}
                            </p>
                          </div>
                        </div>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex flex-wrap gap-1 mt-1 mb-2">
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
                    
                    <div className="mt-3 space-y-3">
                      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/20 
                        text-emerald-800 dark:text-emerald-300 p-3 rounded-md text-xs flex items-start shadow-sm border border-emerald-200 dark:border-emerald-900/50">
                        <div className="bg-white dark:bg-emerald-900/50 p-1 rounded-full mr-2 flex-shrink-0 shadow-sm">
                          <Check className="h-3 w-3 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-semibold mb-0.5">Instant Productivity Boost</p>
                          <p>Pre-built workflow saves {template.difficulty === 'beginner' ? '1-2 hours' : template.difficulty === 'intermediate' ? '3-5 hours' : '8+ hours'} of setup time and eliminates configuration errors</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 p-2 border border-blue-100 dark:border-blue-900/50">
                          <p className="text-[11px] font-medium text-blue-800 dark:text-blue-300 flex items-center">
                            <ThumbsUp className="h-3 w-3 mr-1 text-blue-500" /> Popular Choice
                          </p>
                          <p className="text-xs font-bold">{template.popularity} users</p>
                        </div>
                        
                        <div className="rounded-md bg-purple-50 dark:bg-purple-950/30 p-2 border border-purple-100 dark:border-purple-900/50">
                          <p className="text-[11px] font-medium text-purple-800 dark:text-purple-300 flex items-center">
                            <Tag className="h-3 w-3 mr-1 text-purple-500" /> Template Type
                          </p>
                          <p className="text-xs font-bold capitalize">{template.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-dashed pt-2 mt-2 text-xs">
                        {template.createdBy && (
                          <div className="text-muted-foreground flex items-center">
                            <Users className="h-3 w-3 mr-1" /> By {template.createdBy}
                          </div>
                        )}
                        <div className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-800/50 font-medium flex items-center">
                          <div className="w-1 h-1 bg-yellow-500 rounded-full mr-1"></div>
                          Premium
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-3 pt-2">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-muted/50 to-transparent"></div>
                    
                    <Link href={`/templates/${template.id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full group relative overflow-hidden border-primary/20 hover:border-primary transition-colors">
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 group-hover:via-primary/10 transition-colors"></span>
                        <span className="relative flex items-center justify-center font-medium">
                          View Template Details
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </Button>
                    </Link>
                    
                    <Button 
                      size="sm" 
                      onClick={() => handleImport(template.id)}
                      disabled={importMutation.isPending}
                      className="w-full relative group overflow-hidden bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 transition-all"
                    >
                      <span className="absolute inset-0 w-0 group-hover:w-full h-full bg-white/10 transition-all duration-300"></span>
                      {importMutation.isPending && importMutation.variables === template.id ? (
                        <div className="flex items-center">
                          <span className="mr-2">Importing...</span>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        <span className="flex items-center font-semibold">
                          Use This Template <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                    
                    <div className="text-center text-[10px] text-muted-foreground">
                      One-click import • Fully customizable • No coding required
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


      </div>
    </GradientBackground>
  );
};

export default InspirationGallery;