import { useState } from 'react';
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
import { Loader2, Search } from "lucide-react";
import { Link } from 'wouter';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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
      
      {/* Templates Grid */}
      {!isLoading && templates && templates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.slice(0, 6).map((template) => (
            <Card key={template.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {template.description}
                </CardDescription>
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
                <Button size="sm" className="w-full" variant="outline">
                  Use Template
                </Button>
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
    </div>
  );
}