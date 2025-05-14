import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft } from 'lucide-react';
import EnhancedTemplateDetail from '@/components/workflow/EnhancedTemplateDetail';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const TemplateDetailPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/templates/:id');
  const { toast } = useToast();
  const templateId = params?.id ? parseInt(params.id) : null;
  
  const { 
    data: template, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/workflow-templates', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const res = await fetch(`/api/workflow-templates/${templateId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch template details');
      }
      return res.json();
    },
    enabled: !!templateId,
  });
  
  const importMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/workflow-templates/${id}/import`, {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Template imported successfully",
        description: "Your new workflow has been created.",
        variant: "default",
      });
      
      // Invalidate queries that might be affected
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      
      // Navigate to the created workflow
      setLocation(`/workflows/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to import template",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleUseTemplate = (id: number) => {
    importMutation.mutate(id);
  };
  
  const goBack = () => {
    setLocation('/inspiration-gallery');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !template) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Error Loading Template</h1>
          <p>We couldn't load the template details. Please try again.</p>
          <Button onClick={goBack}>Return to Gallery</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={goBack}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Gallery
        </Button>
      </div>
      
      <EnhancedTemplateDetail 
        template={template} 
        onUseTemplate={handleUseTemplate}
      />
      
      {importMutation.isPending && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <h3 className="text-lg font-medium text-center">Importing Template</h3>
            <p className="text-center text-muted-foreground">
              Please wait while we set up your new workflow...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateDetailPage;