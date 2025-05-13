import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkflowLoadingAnimation } from '@/components/workflow/WorkflowLoadingAnimation';
import { InlineWorkflowLoading } from '@/components/workflow/InlineWorkflowLoading';

const LoadingAnimationsDemo = () => {
  const [isFullscreenLoading, setIsFullscreenLoading] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  
  const startFullscreenLoader = () => {
    setIsFullscreenLoading(true);
    setLoadingComplete(false);
    
    // Auto-complete after all stages
    setTimeout(() => {
      setLoadingComplete(true);
      setTimeout(() => setIsFullscreenLoading(false), 1500);
    }, 8000);
  };
  
  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Playful Workflow Loading Animations</h1>
      
      <Tabs defaultValue="fullscreen">
        <TabsList className="mb-4">
          <TabsTrigger value="fullscreen">Fullscreen Loading</TabsTrigger>
          <TabsTrigger value="inline">Inline Loading</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fullscreen">
          <Card>
            <CardHeader>
              <CardTitle>Fullscreen Workflow Loading Animation</CardTitle>
              <CardDescription>
                An engaging fullscreen loading animation with multiple stages showing processing status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                This animation is useful during lengthy processing operations or when initializing complex workflows.
                It provides a clear visual indication of progress and helps reduce perceived wait time.
              </p>
              
              <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                <Button onClick={startFullscreenLoader} size="lg">
                  Start Fullscreen Loader
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-gray-500">
              <div>Features animated particles, progress stages and orbiting elements</div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="inline">
          <Card>
            <CardHeader>
              <CardTitle>Inline Workflow Loading Indicators</CardTitle>
              <CardDescription>
                Compact loading indicators for inline use within UI components.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Size Variants</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InlineWorkflowLoading size="sm" text="Small inline loader" />
                    <InlineWorkflowLoading size="md" text="Medium inline loader" />
                    <InlineWorkflowLoading size="lg" text="Large inline loader" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Status Variants</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InlineWorkflowLoading variant="default" text="Processing workflow steps" />
                    <InlineWorkflowLoading variant="processing" text="Connecting to external service" />
                    <InlineWorkflowLoading variant="success" text="Workflow completed successfully" />
                    <InlineWorkflowLoading variant="error" text="Workflow failed: Unable to connect to API" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Minimal Variants</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InlineWorkflowLoading showIcon={false} text="Processing without icons" />
                    <div className="flex justify-center p-4 border rounded-lg">
                      <InlineWorkflowLoading size="sm" variant="default" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Fullscreen loader */}
      <WorkflowLoadingAnimation 
        isLoading={isFullscreenLoading}
        onComplete={() => setLoadingComplete(true)}
        loadingText={loadingComplete ? "Workflow processing complete!" : "Processing your workflow"}
      />
    </div>
  );
};

export default LoadingAnimationsDemo;