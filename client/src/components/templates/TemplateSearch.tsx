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
  Info
} from "lucide-react";
import { TemplateFavoriteButton } from './TemplateFavoriteButton';
import { TemplateIntegrationGuide } from './TemplateIntegrationGuide';
import { useToast } from '@/hooks/use-toast';

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
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
  
  const handleUseTemplate = (template: WorkflowTemplate) => {
    toast({
      title: "Template selected",
      description: `Preparing "${template.name}" template for setup...`,
    });
    // Navigate to the new template setup page
    window.location.href = `/template-setup/${template.id}`;
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      {/* Hero header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Discover Workflow Templates
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Browse our collection of pre-built workflow templates to automate your processes and save time
            </p>
            
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-200" />
              <Input
                placeholder="Search for templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-6 text-lg bg-white/10 border-white/20 text-white placeholder:text-indigo-200 rounded-lg focus:border-white focus:ring-white/30"
              />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-indigo-700 hover:bg-white/90"
                size="sm"
                onClick={() => setFiltersVisible(!filtersVisible)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
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
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full" />
            <span className="ml-3 text-lg text-gray-700">Loading amazing templates...</span>
          </div>
        )}
        
        {/* Error state */}
        {isError && (
          <div className="text-center py-16 bg-red-50 rounded-xl border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileBadge className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-800 mb-2">Failed to load templates</h3>
            <p className="text-red-600 mb-4 max-w-md mx-auto">
              We encountered an error while loading the templates. Please try again later or contact support if the issue persists.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Try Again
            </Button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300 border-gray-200 overflow-hidden group">
                    {/* Image Preview */}
                    <div className="relative h-48 bg-gradient-to-tr from-indigo-50 to-blue-50 overflow-hidden">
                      <img 
                        src={getTemplatePreviewImage(template)}
                        alt={`${template.name} workflow preview`}
                        className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300 p-4"
                      />
                      <div className="absolute top-3 right-3">
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
                    </div>
                    
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl group-hover:text-indigo-700 transition-colors duration-200">
                            {template.name}
                          </CardTitle>
                          <CardDescription className="mt-1 line-clamp-2 h-10">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-grow pb-3">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {template.tags?.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-50">
                            {tag}
                          </Badge>
                        ))}
                        {(template.tags?.length || 0) > 3 && (
                          <Badge variant="outline" className="bg-gray-50">
                            +{(template.tags?.length || 0) - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <FileBadge className="h-3.5 w-3.5 mr-1" />
                          <span className="capitalize">{template.category?.replace(/-/g, ' ')}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>{template.estimatedDuration}</span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-3 border-t border-gray-100">
                      <div className="w-full">
                        <div className="flex flex-wrap justify-between items-center mb-2">
                          <Badge variant="secondary" className={`${getComplexityColor(template.complexity || 'medium')} capitalize`}>
                            {template.complexity || 'medium'} complexity
                          </Badge>
                          <Button 
                            size="sm" 
                            onClick={() => handleUseTemplate(template)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-200 shadow-sm group-hover:shadow-md"
                          >
                            <Zap className="h-3.5 w-3.5 mr-2" />
                            Use Template
                          </Button>
                        </div>
                        <div className="flex justify-center w-full">
                          <TemplateIntegrationGuide template={template} variant="gradient" className="w-full" />
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
                            onFavoriteChange={(templateId, isFavorited) => {
                              const newFavorites = isFavorited 
                                ? [...favoriteIds, templateId]
                                : favoriteIds.filter(id => id !== templateId);
                              setFavoriteIds(newFavorites);
                            }}
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
                          {template.estimatedDuration && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-indigo-600" />
                              <span>{template.estimatedDuration}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-indigo-600" />
                            <span>Updated {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'recently'}</span>
                          </div>
                          <Badge variant="secondary" className={`${getComplexityColor(template.complexity || 'medium')} capitalize`}>
                            {template.complexity || 'medium'} complexity
                          </Badge>
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      window.open('mailto:support@pumpflux.com?subject=Template Support Request', '_blank');
                    }}
                  >
                    Contact Us
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="h-6 w-6 text-indigo-700" />
                  </div>
                  <h4 className="font-bold mb-2">Request Template</h4>
                  <p className="text-sm text-gray-600 mb-4">Can't find what you need? Request a custom template for your workflow.</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      window.open('mailto:templates@pumpflux.com?subject=Custom Template Request&body=Please describe the workflow template you would like us to create:', '_blank');
                    }}
                  >
                    Make Request
                  </Button>
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