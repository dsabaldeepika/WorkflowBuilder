import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { templateRequestSchema, TemplateRequestInput } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { FEATURE_FLAGS } from '@shared/config';

export function TemplateRequestForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<TemplateRequestInput>({
    resolver: zodResolver(templateRequestSchema),
    defaultValues: {
      name: '',
      email: '',
      templateName: '',
      description: '',
      useCase: ''
    }
  });
  
  const onSubmit = async (data: TemplateRequestInput) => {
    setIsSubmitting(true);
    
    try {
      // If email feature is enabled, send the template request data to the server
      if (FEATURE_FLAGS.enableEmail) {
        await apiRequest('POST', '/api/template-request', data);
      } else {
        // Simulate server delay without actually sending email
        await new Promise(resolve => setTimeout(resolve, 750));
        
        console.log('Email feature is disabled. Would have sent template request:', data);
      }
      
      setIsSuccess(true);
      form.reset();
      
      toast({
        title: "Template request submitted",
        description: "Thank you for your request! We'll review it and get back to you soon.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error submitting template request:', error);
      toast({
        title: "Failed to submit request",
        description: "An error occurred while submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setIsSuccess(false);
    form.reset();
  };
  
  return (
    <Card className="w-full max-w-md shadow-lg border-0 bg-white/70 backdrop-blur-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Request a Template</CardTitle>
        <CardDescription>
          Tell us about the workflow template you'd like us to create
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isSuccess ? (
          <div className="text-center py-8">
            <div className="mb-4 flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Request Received!</h3>
            <p className="text-gray-600 mb-6">
              We've received your template request and will consider it for our library. We'll notify you when it's available.
            </p>
            <Button onClick={resetForm} variant="outline">
              Submit Another Request
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="templateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="E.g., Customer Onboarding Sequence" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what this template should do..." 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="useCase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Use Case</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Explain how you would use this template" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4 text-xs text-center text-gray-500">
        We may contact you for more details about your template request.
      </CardFooter>
    </Card>
  );
}