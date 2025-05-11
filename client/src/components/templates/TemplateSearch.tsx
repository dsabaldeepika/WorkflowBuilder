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
import { Loader2, Clock, FileBadge, Tag, Search } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [sortBy, setSortBy] = useState('name');

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

  // Fetch templates with filters
  const { data: templates, isLoading, isError } = useQuery<WorkflowTemplate[]>({
    queryKey: ['/api/workflow/templates', searchTerm, selectedCategory, selectedComplexity, sortBy],
    queryFn: async () => {
      const queryStr = buildQueryString();
      const url = `/api/workflow/templates${queryStr ? `?${queryStr}` : ''}`;
      return fetch(url).then(res => res.json());
    }
  });

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      {!isLoading && templates && (
        <>
          <div className="text-sm text-gray-500 mb-4">
            Found {templates.length} template{templates.length !== 1 ? 's' : ''}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{template.name}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2 h-10">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags?.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
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
                    <Button size="sm" variant="default">
                      Use Template
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {/* Empty state */}
      {!isLoading && templates && templates.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <FileBadge className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search or filters to find what you're looking for.
          </p>
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
      )}
    </div>
  );
}