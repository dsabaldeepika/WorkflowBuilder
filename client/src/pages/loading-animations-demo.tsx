import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InlineWorkflowLoading } from '@/components/workflow/InlineWorkflowLoading';
import { motion } from 'framer-motion';
import { RotateCw, Play, CheckCircle, AlertTriangle } from 'lucide-react';

export const LoadingAnimationsDemo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const startSimulation = () => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    
    // Simulate success or error after delay
    setTimeout(() => {
      setIsLoading(false);
      if (Math.random() > 0.3) {
        setIsSuccess(true);
      } else {
        setIsError(true);
      }
    }, 3000);
  };
  
  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-3xl font-bold">Workflow Loading Animations</h1>
      <p className="text-muted-foreground">
        Interactive demonstration of loading animations used throughout the workflow system.
      </p>
      
      <Tabs defaultValue="inline">
        <TabsList>
          <TabsTrigger value="inline">Inline Animations</TabsTrigger>
          <TabsTrigger value="states">Processing States</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inline" className="space-y-6 py-4">
          <Card>
            <CardHeader>
              <CardTitle>Inline Loading Indicators</CardTitle>
              <CardDescription>
                Compact loading animations for use within components or buttons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-4 border rounded-md space-y-2">
                  <h3 className="font-medium">Default</h3>
                  <InlineWorkflowLoading size="md" text="Loading" />
                </div>
                
                <div className="flex flex-col items-center p-4 border rounded-md space-y-2">
                  <h3 className="font-medium">Processing</h3>
                  <InlineWorkflowLoading size="md" text="Processing" variant="processing" />
                </div>
                
                <div className="flex flex-col items-center p-4 border rounded-md space-y-2">
                  <h3 className="font-medium">Success</h3>
                  <InlineWorkflowLoading size="md" text="Success" variant="success" />
                </div>
                
                <div className="flex flex-col items-center p-4 border rounded-md space-y-2">
                  <h3 className="font-medium">Error</h3>
                  <InlineWorkflowLoading size="md" text="Error" variant="error" />
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Size Variations</h3>
                <div className="flex flex-wrap gap-6">
                  <InlineWorkflowLoading size="sm" text="Small" />
                  <InlineWorkflowLoading size="md" text="Medium" />
                  <InlineWorkflowLoading size="lg" text="Large" />
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">With/Without Text</h3>
                <div className="flex flex-wrap gap-6">
                  <InlineWorkflowLoading size="md" showIcon={true} />
                  <InlineWorkflowLoading size="md" text="With Text" showIcon={true} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="states" className="space-y-6 py-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Processing States</CardTitle>
              <CardDescription>
                Interactive animations showing different workflow execution states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center mb-10">
                <Button 
                  onClick={startSimulation} 
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <span className="relative flex h-3 w-3 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-foreground"></span>
                      </span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Simulation
                    </>
                  )}
                </Button>
              </div>
              
              <div className="p-8 border rounded-lg bg-slate-50">
                <div className="max-w-xl mx-auto">
                  {isLoading && (
                    <div className="flex flex-col items-center p-8 text-center">
                      <div className="h-16 w-16 mb-4 relative">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 2,
                            ease: "linear",
                            repeat: Infinity
                          }}
                        >
                          <RotateCw className="h-16 w-16 text-blue-500" />
                        </motion.div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Processing Workflow</h3>
                      <p className="text-muted-foreground">Please wait while we process your workflow...</p>
                    </div>
                  )}
                  
                  {isSuccess && (
                    <div className="flex flex-col items-center p-8 text-center">
                      <div className="h-16 w-16 mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Workflow Completed</h3>
                      <p className="text-muted-foreground">Your workflow has been processed successfully!</p>
                    </div>
                  )}
                  
                  {isError && (
                    <div className="flex flex-col items-center p-8 text-center">
                      <div className="h-16 w-16 mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-10 w-10 text-red-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Workflow Failed</h3>
                      <p className="text-muted-foreground">There was an error processing your workflow. Please try again.</p>
                    </div>
                  )}
                  
                  {!isLoading && !isSuccess && !isError && (
                    <div className="flex flex-col items-center p-8 text-center">
                      <p className="text-lg">Click "Run Simulation" to see the workflow processing states</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoadingAnimationsDemo;