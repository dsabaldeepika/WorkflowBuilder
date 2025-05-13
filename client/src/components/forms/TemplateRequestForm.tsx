import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { templateRequestFormSchema, TemplateRequestFormInput } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { FEATURE_FLAGS } from '@shared/config';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export function TemplateRequestForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<TemplateRequestFormInput>({
    resolver: zodResolver(templateRequestFormSchema),
    defaultValues: {
      name: '',
      email: '',
      workflowType: '',
      description: '',
      integrations: ''
    }
  });
  
  const onSubmit = async (data: TemplateRequestFormInput) => {
    setIsSubmitting(true);
    
    try {
      // If email feature is enabled, send the template request data to the server
      if (FEATURE_FLAGS.enableEmail) {
        await apiRequest('/api/template-request', {
          method: 'POST',
          body: JSON.stringify(data)
        });
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
      });
    } catch (error) {
      console.error('Error submitting template request form:', error);
      toast({
        title: "Failed to submit request",
        description: "An error occurred while sending your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setIsSuccess(false);
    form.reset();
  };
  
  const workflowTypes = [
    "Data Integration",
    "Social Media Automation",
    "Customer Relationship Management",
    "Marketing Automation",
    "E-commerce",
    "Analytics",
    "Content Management",
    "Other"
  ];
  
  return (
    <div className="w-full">
      {isSuccess ? (
        <div className="text-center py-6">
          <div className="mb-4 flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Request Received!</h3>
          <p className="text-gray-600 mb-6">
            We'll review your template request and contact you soon with updates.
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
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="your.email@example.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="workflowType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflow Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select workflow type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {workflowTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflow Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please describe the workflow you'd like us to create as a template..." 
                      className="min-h-24" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="integrations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Integrations</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List any specific apps or services that need to be integrated (e.g., Slack, Google Sheets, HubSpot, etc.)" 
                      className="min-h-20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}