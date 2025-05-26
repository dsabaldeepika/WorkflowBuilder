import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Button } from "@/components/ui/button";
import { WorkflowTemplate } from "@shared/schema";
import { 
  Loader2, 
  Clock, 
  FileBadge, 
  Tag, 
  Search, 
  Star, 
  Zap, 
  ExternalLink, 
  ChevronRight, 
  Filter, 
  Sparkles,
  LayoutGrid,
  PlusCircle,
  List,
  Calendar,
  Info,
  Check,
  AlertCircle
} from "lucide-react";
import { TemplateFavoriteButton } from './TemplateFavoriteButton';
import { TemplateIntegrationGuide } from './TemplateIntegrationGuide';
import { useToast } from '@/hooks/use-toast';
import { ContactFormDialog } from '@/components/dialogs/ContactFormDialog';
import { TemplateRequestDialog } from '@/components/dialogs/TemplateRequestDialog';
import logger from '@/utils/logger';

// Import template preview images
import defaultTemplatePreview from "@/assets/templates/workflow-template-placeholder.svg";
import facebookToHubspotPreview from "@/assets/templates/facebook-lead-to-hubspot.svg";
import customerFollowUpPreview from "@/assets/templates/customer-follow-up.svg";
import pipedriveToGoogleSheetsPreview from "@/assets/templates/pipedrive-to-googlesheets-updated.svg";
import anthropicToSheetsPreview from "@/assets/templates/anthropic-to-sheets.svg";

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
  { value: 'all', label: 'All Difficulty' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
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
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Log component mount
  useEffect(() => {
    logger.component.mount("TemplateSearch", {
      initialFilters: {
        searchTerm,
        selectedCategory,
        selectedComplexity,
        sortBy,
        showFavoritesOnly
      }
    });
    return () => {
      logger.component.unmount("TemplateSearch");
    };
  }, []);

  // Handle favorite toggle with error handling
  const handleFavoriteToggle = async (templateId: number, initialFavorited: boolean) => {
    try {
      logger.debug("Attempting to toggle template favorite", {
        templateId,
        initialFavorited,
        currentFavorites: favoriteIds
      });

      const newFavorites = initialFavorited
        ? [...favoriteIds, templateId]
        : favoriteIds.filter(id => id !== templateId);
      
      // Save to localStorage with error handling
      try {
        localStorage.setItem('favoriteTemplates', JSON.stringify(newFavorites));
        logger.debug("Successfully saved favorites to localStorage", {
          templateId,
          newFavoriteCount: newFavorites.length
        });
      } catch (storageError) {
        logger.error("Failed to save favorites to localStorage", 
          storageError instanceof Error ? storageError : new Error(String(storageError)),
          { templateId, newFavorites }
        );
        toast({
          title: "Error",
          description: "Failed to save favorite status. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setFavoriteIds(newFavorites);
      
      logger.info("Template favorite status updated", {
        templateId,
        initialFavorited,
        newFavoriteCount: newFavorites.length
      });
    } catch (error) {
      logger.error("Unexpected error toggling template favorite", 
        error instanceof Error ? error : new Error(String(error)),
        { templateId, initialFavorited }
      );
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load favorites from localStorage with error handling
  useEffect(() => {
    try {
      logger.debug("Attempting to load favorites from localStorage");
      const savedFavorites = localStorage.getItem('favoriteTemplates');
      
      if (savedFavorites) {
        try {
          const favorites = JSON.parse(savedFavorites);
          if (!Array.isArray(favorites)) {
            throw new Error('Invalid favorites data format');
          }
          
          logger.info("Successfully loaded favorites from localStorage", {
            favoriteCount: favorites.length
          });
          setFavoriteIds(favorites);
        } catch (parseError) {
          logger.error("Failed to parse favorites from localStorage", 
            parseError instanceof Error ? parseError : new Error(String(parseError)),
            { savedFavorites }
          );
          // Reset favorites if data is corrupted
          localStorage.removeItem('favoriteTemplates');
          setFavoriteIds([]);
        }
      } else {
        logger.debug("No saved favorites found in localStorage");
      }
    } catch (error) {
      logger.error("Unexpected error loading favorites", 
        error instanceof Error ? error : new Error(String(error))
      );
      toast({
        title: "Error",
        description: "Failed to load favorite templates. Please try again.",
        variant: "destructive",
      });
    }
  }, []);

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
    
    const queryString = params.toString();
    logger.debug("Built query string", { queryString, filters: { searchTerm, selectedCategory, selectedComplexity, sortBy } });
    return queryString;
  };

  // Fetch templates with filters
  const { data: templates, isLoading, isError, error, refetch } = useQuery<WorkflowTemplate[]>({
    queryKey: ['/api/workflow/templates', searchTerm, selectedCategory, selectedComplexity, sortBy],
    queryFn: async () => {
      try {
        const queryStr = buildQueryString();
        const url = `/api/workflow/templates${queryStr ? `?${queryStr}` : ''}`;
        
        logger.api.request("GET", url);
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const error = new Error(errorData.message || 'Failed to fetch templates');
          logger.api.error("GET", url, error);
          throw error;
        }
        
        const data = await response.json();
        
        // Validate the response data
        if (!Array.isArray(data)) {
          const error = new Error('Invalid template data received');
          logger.api.error("GET", url, error);
          throw error;
        }
        
        logger.api.response("GET", url, response.status, { templateCount: data.length });
        return data;
      } catch (error) {
        logger.error("Error fetching templates", error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  // Monitor and log filter changes
  useEffect(() => {
    try {
      logger.state.change(
        "TemplateSearch",
        "FILTERS_CHANGED",
        {
          searchTerm: "",
          selectedCategory: "all",
          selectedComplexity: "all",
          sortBy: "name",
          showFavoritesOnly: false
        },
        {
          searchTerm,
          selectedCategory,
          selectedComplexity,
          sortBy,
          showFavoritesOnly
        }
      );
    } catch (error) {
      logger.error("Error logging filter changes", 
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }, [searchTerm, selectedCategory, selectedComplexity, sortBy, showFavoritesOnly]);

  // Filter templates with error handling
  const getFilteredTemplates = useCallback(() => {
    try {
      if (!templates) return [];

      logger.debug("Filtering templates", {
        totalTemplates: templates.length,
        filters: {
          showFavoritesOnly,
          searchTerm,
          selectedCategory,
          selectedComplexity
        }
      });

      let filtered = [...templates];

      // Apply filters
      if (showFavoritesOnly) {
        filtered = filtered.filter(template => favoriteIds.includes(template.id));
      }

      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(template => 
          template.name.toLowerCase().includes(searchLower) ||
          (template.description?.toLowerCase() || '').includes(searchLower) ||
          template.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      if (selectedCategory !== 'all') {
        filtered = filtered.filter(template => template.category === selectedCategory);
      }

      if (selectedComplexity !== 'all') {
        filtered = filtered.filter(template => template.difficulty === selectedComplexity);
      }

      logger.debug("Templates filtered", {
        totalTemplates: templates.length,
        filteredCount: filtered.length,
        filters: {
          showFavoritesOnly,
          searchTerm,
          selectedCategory,
          selectedComplexity
        }
      });

      return filtered;
    } catch (error) {
      logger.error("Error filtering templates", 
        error instanceof Error ? error : new Error(String(error)),
        { templatesCount: templates?.length }
      );
      return [];
    }
  }, [templates, showFavoritesOnly, searchTerm, selectedCategory, selectedComplexity, favoriteIds]);

  // Apply filters and memoize results
  const filteredTemplates = useMemo(() => getFilteredTemplates(), [getFilteredTemplates]);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle template use with error handling
  const handleUseTemplate = async (template: WorkflowTemplate) => {
    try {
      logger.info("Initiating template setup", {
        templateId: template.id,
        templateName: template.name
      });

      toast({
        title: "Template selected",
        description: `Preparing "${template.name}" template for setup...`,
      });

      // Log navigation attempt
      logger.debug("Navigating to template setup page", {
        templateId: template.id,
        url: `/template-setup/${template.id}`
      });

      // Navigate to the new template setup page
      window.location.href = `/template-setup/${template.id}`;
    } catch (error) {
      logger.error("Failed to initiate template setup", 
        error instanceof Error ? error : new Error(String(error)),
        { templateId: template.id, templateName: template.name }
      );
      toast({
        title: "Error",
        description: "Failed to load template setup. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get appropriate preview image based on template name and ID
  const getTemplatePreviewImage = (template: WorkflowTemplate) => {
    if (!template.name) {
      return defaultTemplatePreview;
    }
    
    const templateName = template.name.toLowerCase();
    
    // Pipedrive to Google Sheets template
    if (template.id === 13 || 
        (templateName.includes('pipedrive') && 
         templateName.includes('google') && 
         templateName.includes('sheet'))
    ) {
      return pipedriveToGoogleSheetsPreview;
    }
    
    // Anthropic/Claude/AI to Google Sheets template
    if ((templateName.includes('anthropic') || templateName.includes('claude') || 
         (templateName.includes('ai') && templateName.includes('scraping'))) && 
        templateName.includes('sheet')
    ) {
      return anthropicToSheetsPreview;
    }
    
    // Facebook to Hubspot template
    if ((templateName.includes('facebook') || templateName.includes('fb')) && 
        (templateName.includes('hubspot') || templateName.includes('lead'))
    ) {
      return facebookToHubspotPreview;
    }
    
    // Customer follow-up template
    if (templateName.includes('customer') && 
        (templateName.includes('follow') || templateName.includes('email'))
    ) {
      return customerFollowUpPreview;
    }
    
    // Default placeholder for any other templates
    return defaultTemplatePreview;
  };

  // Count templates by category
  const getCategoryCounts = () => {
    if (!templates) return {};
    
    const counts: Record<string, number> = { all: templates.length };
    templates.forEach(template => {
      if (template.category) {
        counts[template.category] = (counts[template.category] || 0) + 1;
      }
    });
    
    return counts;
  };
  
  const categoryCounts = getCategoryCounts();

  // Get complexity badge color based on difficulty
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading state with logging
  if (isLoading) {
    logger.debug("Templates loading state active");
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Keep the search filters visible while loading */}
            <div className="mb-8">
              {/* ... existing search filters ... */}
            </div>
            
            {/* Loading skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state with logging
  if (isError) {
    logger.error("Template loading error", 
      error instanceof Error ? error : new Error(String(error))
    );
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-md p-8 max-w-lg mx-auto">
              <div className="text-red-500 mb-4">
                <AlertCircle className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Templates</h3>
              <p className="text-sm text-gray-500 mb-4">
                {error instanceof Error ? error.message : 'Failed to load templates'}
              </p>
              <Button onClick={() => refetch()} className="mx-auto">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state with logging
  if (filteredTemplates.length === 0) {
    logger.debug("No templates found matching filters", {
      filters: {
        searchTerm,
        selectedCategory,
        selectedComplexity,
        showFavoritesOnly
      }
    });
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-md p-8 max-w-lg mx-auto">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
              <p className="text-sm text-gray-500 mb-4">
                Try adjusting your search filters or browse all templates.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedComplexity('all');
                setSortBy('name');
                setShowFavoritesOnly(false);
              }} variant="outline" className="mx-auto">
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      {/* Enhanced Hero header with animation and visuals */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white opacity-5 rounded-full"></div>
          <div className="absolute top-10 right-10 w-64 h-64 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-white opacity-5 rounded-full"></div>
          <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-white opacity-5 rounded-full"></div>
        </div>
        
        <div className="container mx-auto py-20 px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
              <span className="text-sm font-medium text-blue-100 flex items-center">
                <Sparkles className="h-4 w-4 mr-2" /> Automate your workflow in minutes
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-100 leading-tight">
              Discover Powerful<br />Workflow Templates
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Browse our collection of pre-built workflow templates to automate your processes and save valuable time
            </p>
            
            <div className="relative max-w-2xl mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-xl blur opacity-20"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-200" />
                <Input
                  placeholder="Search for templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-6 text-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-indigo-200 rounded-xl focus:border-white focus:ring-white/30 shadow-lg"
                />
                <Button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-indigo-700 hover:bg-white/90 rounded-lg shadow-md"
                  size="sm"
                  onClick={() => setFiltersVisible(!filtersVisible)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full flex items-center">
                <Check className="h-3.5 w-3.5 mr-1.5 text-green-300" /> Easy setup
              </span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full flex items-center">
                <Check className="h-3.5 w-3.5 mr-1.5 text-green-300" /> No-code required
              </span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full flex items-center">
                <Check className="h-3.5 w-3.5 mr-1.5 text-green-300" /> Ready to use
              </span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full flex items-center">
                <Check className="h-3.5 w-3.5 mr-1.5 text-green-300" /> Fully customizable
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto py-8 px-4">
        {/* Filter section */}
        <div className={`mb-8 bg-white rounded-xl shadow-sm p-6 transition-all duration-300 ${filtersVisible ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-700">Categories</h3>
              <div className="space-y-2">
                {CATEGORIES.map((category) => (
                  <div key={category.value} className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`justify-start w-full ${selectedCategory === category.value ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600'}`}
                      onClick={() => setSelectedCategory(category.value)}
                    >
                      {category.value === selectedCategory && <ChevronRight className="h-3 w-3 mr-1" />}
                      {category.label}
                      {categoryCounts[category.value] && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {categoryCounts[category.value] || 0}
                        </Badge>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-700">Complexity</h3>
              <div className="space-y-1">
                {COMPLEXITY_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`justify-start w-full ${selectedComplexity === option.value ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600'}`}
                      onClick={() => setSelectedComplexity(option.value)}
                    >
                      {option.value === selectedComplexity && <ChevronRight className="h-3 w-3 mr-1" />}
                      {option.label}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-700">Sort by</h3>
              <div className="space-y-1">
                {SORT_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`justify-start w-full ${sortBy === option.value ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600'}`}
                      onClick={() => setSortBy(option.value)}
                    >
                      {option.value === sortBy && <ChevronRight className="h-3 w-3 mr-1" />}
                      {option.label}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-700">Special filters</h3>
              <Button 
                variant={showFavoritesOnly ? "default" : "outline"} 
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`w-full justify-start mb-2 ${showFavoritesOnly ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}`}
              >
                <Star className="h-4 w-4 mr-2" fill={showFavoritesOnly ? "currentColor" : "none"} />
                {showFavoritesOnly ? "Showing Favorites" : "Show Favorites"}
              </Button>
              
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedComplexity('all');
                setSortBy('name');
                setShowFavoritesOnly(false);
              }}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Reset All Filters
              </Button>
            </div>
          </div>
        </div>
        
        {/* Active filters display */}
        {(selectedCategory !== 'all' || selectedComplexity !== 'all' || searchTerm || showFavoritesOnly) && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {selectedCategory !== 'all' && (
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 flex items-center gap-1">
                <span>Category: {CATEGORIES.find(c => c.value === selectedCategory)?.label}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-4 w-4 p-0 text-indigo-700 hover:text-indigo-900 hover:bg-transparent"
                  onClick={() => setSelectedCategory('all')}
                >
                  ×
                </Button>
              </Badge>
            )}
            
            {selectedComplexity !== 'all' && (
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 flex items-center gap-1">
                <span>Complexity: {COMPLEXITY_OPTIONS.find(c => c.value === selectedComplexity)?.label}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-4 w-4 p-0 text-indigo-700 hover:text-indigo-900 hover:bg-transparent"
                  onClick={() => setSelectedComplexity('all')}
                >
                  ×
                </Button>
              </Badge>
            )}
            
            {searchTerm && (
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 flex items-center gap-1">
                <span>Search: {searchTerm}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-4 w-4 p-0 text-indigo-700 hover:text-indigo-900 hover:bg-transparent"
                  onClick={() => setSearchTerm('')}
                >
                  ×
                </Button>
              </Badge>
            )}
            
            {showFavoritesOnly && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 flex items-center gap-1">
                <Star className="h-3 w-3 mr-1 fill-current" />
                <span>Favorites only</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-4 w-4 p-0 text-yellow-700 hover:text-yellow-900 hover:bg-transparent"
                  onClick={() => setShowFavoritesOnly(false)}
                >
                  ×
                </Button>
              </Badge>
            )}
          </div>
        )}
        
        {/* Template grid */}
        {!isLoading && filteredTemplates.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {showFavoritesOnly 
                  ? `Your Favorite Templates (${filteredTemplates.length})` 
                  : selectedCategory !== 'all' 
                    ? `${CATEGORIES.find(c => c.value === selectedCategory)?.label} Templates (${filteredTemplates.length})` 
                    : `All Templates (${filteredTemplates.length})`
                }
              </h2>
              <div className="flex items-center">
                <div className="bg-gray-100 rounded-md p-1 flex">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className={`px-2 ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    <span className="text-xs">Grid</span>
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className={`px-2 ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4 mr-1" />
                    <span className="text-xs">List</span>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1 line-clamp-2">{template.name}</CardTitle>
                          <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                        </div>
                        <TemplateFavoriteButton
                          templateId={template.id}
                          initialFavorited={favoriteIds.includes(template.id)}
                          onFavoriteChange={handleFavoriteToggle}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className={`${getDifficultyColor(template.difficulty)} capitalize`}>
                          {template.difficulty}
                        </Badge>
                        {template.category && (
                          <Badge variant="outline" className="capitalize">
                            {template.category}
                          </Badge>
                        )}
                        {template.tags?.map((tag, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-50">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <FileBadge className="h-3.5 w-3.5 mr-1" />
                          <span className="capitalize">{template.category?.replace(/-/g, ' ')}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-3 border-t border-gray-100">
                      <div className="w-full">
                        <div className="flex justify-between items-center">
                          <Button 
                            size="sm" 
                            onClick={() => handleUseTemplate(template)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <Zap className="h-3.5 w-3.5 mr-2" />
                            Use Template
                          </Button>
                          <TemplateIntegrationGuide template={template} variant="gradient" />
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
            
            {/* List View */}
            {viewMode === 'list' && (
              <div className="flex flex-col space-y-4">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow duration-300 border-gray-200 overflow-hidden group">
                    <div className="flex flex-col md:flex-row">
                      {/* Image Preview (smaller in list view) */}
                      <div className="relative w-full md:w-48 h-40 bg-gradient-to-tr from-indigo-50 to-blue-50 overflow-hidden">
                        <img 
                          src={getTemplatePreviewImage(template)}
                          alt={`${template.name} workflow preview`}
                          className="w-full h-full object-contain p-4"
                        />
                        <div className="absolute top-2 right-2">
                          <TemplateFavoriteButton 
                            templateId={template.id} 
                            initialFavorited={favoriteIds.includes(template.id)}
                            onFavoriteChange={handleFavoriteToggle}
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold group-hover:text-indigo-700 transition-colors duration-200">
                              {template.name}
                            </h3>
                            <p className="text-gray-500 mt-1 mb-3">{template.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {template.tags?.slice(0, 5).map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-50">
                              {tag}
                            </Badge>
                          ))}
                          {(template.tags?.length || 0) > 5 && (
                            <Badge variant="outline" className="bg-gray-50">
                              +{(template.tags?.length || 0) - 5} more
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <FileBadge className="h-4 w-4 mr-1 text-indigo-600" />
                            <span className="capitalize">{template.category?.replace(/-/g, ' ')}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-indigo-600" />
                            <span>Updated {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'recently'}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <TemplateIntegrationGuide template={template} variant="gradient" className="flex-1 min-w-[200px]" />
                          <Button 
                            onClick={() => handleUseTemplate(template)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-200 shadow-sm group-hover:shadow-md"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Empty state */}
        {!isLoading && templates && filteredTemplates.length === 0 && (
          <div className="text-center py-16 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-indigo-900 mb-2">
              {showFavoritesOnly 
                ? "No favorite templates found" 
                : "No templates found"}
            </h3>
            <p className="text-indigo-700 mb-4 max-w-md mx-auto">
              {showFavoritesOnly 
                ? "You haven't favorited any templates yet, or none match your current filters." 
                : "Try adjusting your search or filters to find what you're looking for."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {showFavoritesOnly && (
                <Button
                  variant="default"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setShowFavoritesOnly(false)}
                >
                  Show All Templates
                </Button>
              )}
              <Button
                variant="outline"
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
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
        
        {/* Quick links */}
        <div className="mt-12 py-8 border-t border-gray-200">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Need something specific?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ExternalLink className="h-6 w-6 text-blue-700" />
                  </div>
                  <h4 className="font-bold mb-2">Contact Support</h4>
                  <p className="text-sm text-gray-600 mb-4">Need help finding the right template? Our support team is here to help.</p>
                  <ContactFormDialog buttonClassName="w-full" />
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="h-6 w-6 text-indigo-700" />
                  </div>
                  <h4 className="font-bold mb-2">Request Template</h4>
                  <p className="text-sm text-gray-600 mb-4">Can't find what you need? Request a custom template for your workflow.</p>
                  <TemplateRequestDialog buttonClassName="w-full" />
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlusCircle className="h-6 w-6 text-purple-700" />
                  </div>
                  <h4 className="font-bold mb-2">Create From Scratch</h4>
                  <p className="text-sm text-gray-600 mb-4">Start with a blank canvas and build your own custom workflow.</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/create'}
                  >
                    Start Building
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}