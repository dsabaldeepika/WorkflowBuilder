import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface EmailConfig {
  enabled: boolean;
  senderEmail: string;
  senderName: string;
  features: {
    auth: {
      enabled: boolean;
      sendWelcomeEmail: boolean;
      sendLoginNotification: boolean;
    },
    workflows: {
      enabled: boolean;
      notifyOnError: boolean;
      notifyOnSuccess: boolean;
      notifyOnScheduledRun: boolean;
      errorThreshold: number;
    },
    notifications: {
      enabled: boolean;
      digestFrequency: 'never' | 'daily' | 'weekly' | 'monthly';
      digestTime: string;
    }
  }
}

export function EmailSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  
  // Fetch current email settings
  const { 
    data: emailStatus, 
    isLoading: isLoadingStatus,
    error: statusError
  } = useQuery({
    queryKey: ['/api/email/status'],
    retry: false
  });
  
  // Form setup
  const form = useForm<EmailConfig>({
    defaultValues: {
      enabled: false,
      senderEmail: '',
      senderName: '',
      features: {
        auth: {
          enabled: false,
          sendWelcomeEmail: true,
          sendLoginNotification: false,
        },
        workflows: {
          enabled: false,
          notifyOnError: true,
          notifyOnSuccess: false,
          notifyOnScheduledRun: false,
          errorThreshold: 1,
        },
        notifications: {
          enabled: false,
          digestFrequency: 'never',
          digestTime: '09:00',
        }
      }
    }
  });
  
  // Populate form with current settings when loaded
  useEffect(() => {
    if (emailStatus) {
      form.reset({
        enabled: emailStatus.enabled,
        senderEmail: emailStatus.senderEmail || 'notifications@pumpflux.com',
        senderName: emailStatus.senderName || 'PumpFlux Notifications',
        features: emailStatus.features
      });
    }
  }, [emailStatus, form]);
  
  // Mutation to update email settings
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<EmailConfig>) => {
      const response = await apiRequest('PUT', '/api/email/config', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Email settings updated',
        description: 'Your email notification settings have been updated successfully.',
      });
      
      // If there's a warning about missing API key, show it
      if (data.warning) {
        toast({
          title: 'SendGrid API Key Missing',
          description: data.warning,
        });
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/email/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update settings',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Mutation to send test email
  const testEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest('POST', '/api/email/test', { email });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Test email sent',
          description: 'Check your inbox for the test email.',
        });
      } else {
        toast({
          title: 'Failed to send test email',
          description: data.message || 'An error occurred while sending the test email.',
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send test email',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const onSendTestEmail = () => {
    const userEmail = form.getValues('senderEmail');
    if (userEmail) {
      testEmailMutation.mutate(userEmail);
    } else {
      toast({
        title: 'Email required',
        description: 'Please enter a valid email address to send the test to.',
      });
    }
  };
  
  const onSubmit = (data: EmailConfig) => {
    updateMutation.mutate(data);
  };
  
  // Save a specific section
  const saveSection = (section: string) => {
    const values = form.getValues();
    
    // Build partial update based on the section
    if (section === 'general') {
      updateMutation.mutate({
        enabled: values.enabled,
      });
    } else if (section === 'auth') {
      updateMutation.mutate({
        features: {
          auth: values.features.auth
        }
      });
    } else if (section === 'workflows') {
      updateMutation.mutate({
        features: {
          workflows: values.features.workflows
        }
      });
    } else if (section === 'digest') {
      updateMutation.mutate({
        features: {
          notifications: values.features.notifications
        }
      });
    }
  };
  
  if (isLoadingStatus) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full rounded-md" />
      </div>
    );
  }
  
  if (statusError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>Error Loading Email Settings</CardTitle>
          </div>
          <CardDescription>
            We encountered an error while loading your email notification settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please try again later or contact support if the issue persists.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/email/status'] })}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const isSendGridConfigured = emailStatus?.hasApiKey || false;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>Email Notification Settings</CardTitle>
            </div>
            <CardDescription>
              Configure how and when PumpFlux sends email notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSendGridConfigured && (
              <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800">SendGrid API Key Missing</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Email notifications require a SendGrid API key. Contact your administrator to configure this.
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Email Notifications</FormLabel>
                      <FormDescription>
                        Master switch for all email notification functionality
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isSendGridConfigured}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="auth">Auth & Account</TabsTrigger>
                <TabsTrigger value="workflows">Workflow Alerts</TabsTrigger>
                <TabsTrigger value="digest">Daily Digest</TabsTrigger>
              </TabsList>
              
              {/* Authentication Email Settings */}
              <TabsContent value="auth" className="space-y-4">
                <FormField
                  control={form.control}
                  name="features.auth.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Authentication Emails</FormLabel>
                        <FormDescription>
                          Enable welcome and account notification emails
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!form.getValues('enabled') || !isSendGridConfigured}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className={!form.getValues('features.auth.enabled') ? 'opacity-50' : ''}>
                  <FormField
                    control={form.control}
                    name="features.auth.sendWelcomeEmail"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Welcome Email</FormLabel>
                          <FormDescription>
                            Send welcome email to new users
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!form.getValues('features.auth.enabled') || !form.getValues('enabled') || !isSendGridConfigured}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={form.control}
                    name="features.auth.sendLoginNotification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Login Notifications</FormLabel>
                          <FormDescription>
                            Send email on new device login (security feature)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!form.getValues('features.auth.enabled') || !form.getValues('enabled') || !isSendGridConfigured}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button 
                    type="button" 
                    onClick={() => saveSection('auth')}
                    disabled={updateMutation.isPending || !isSendGridConfigured}
                  >
                    {updateMutation.isPending && activeTab === 'auth' && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Auth Settings
                  </Button>
                </div>
              </TabsContent>
              
              {/* Workflow Email Settings */}
              <TabsContent value="workflows" className="space-y-4">
                <FormField
                  control={form.control}
                  name="features.workflows.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Workflow Notifications</FormLabel>
                        <FormDescription>
                          Receive notifications about workflow executions
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!form.getValues('enabled') || !isSendGridConfigured}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className={!form.getValues('features.workflows.enabled') ? 'opacity-50' : ''}>
                  <FormField
                    control={form.control}
                    name="features.workflows.notifyOnError"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Error Notifications</FormLabel>
                          <FormDescription>
                            Get notified when workflows fail
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!form.getValues('features.workflows.enabled') || !form.getValues('enabled') || !isSendGridConfigured}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="features.workflows.errorThreshold"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border p-4 mt-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Error Threshold</FormLabel>
                          <FormDescription>
                            Number of consecutive errors before sending a notification
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            disabled={!form.getValues('features.workflows.enabled') || !form.getValues('features.workflows.notifyOnError') || !form.getValues('enabled') || !isSendGridConfigured}
                            className="w-20 mt-2"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={form.control}
                    name="features.workflows.notifyOnSuccess"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Success Notifications</FormLabel>
                          <FormDescription>
                            Get notified when workflows complete successfully
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!form.getValues('features.workflows.enabled') || !form.getValues('enabled') || !isSendGridConfigured}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="features.workflows.notifyOnScheduledRun"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Schedule Notifications</FormLabel>
                          <FormDescription>
                            Get notified when workflows are scheduled to run
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!form.getValues('features.workflows.enabled') || !form.getValues('enabled') || !isSendGridConfigured}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button 
                    type="button" 
                    onClick={() => saveSection('workflows')}
                    disabled={updateMutation.isPending || !isSendGridConfigured}
                  >
                    {updateMutation.isPending && activeTab === 'workflows' && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Workflow Settings
                  </Button>
                </div>
              </TabsContent>
              
              {/* Digest Email Settings */}
              <TabsContent value="digest" className="space-y-4">
                <FormField
                  control={form.control}
                  name="features.notifications.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Digest Emails</FormLabel>
                        <FormDescription>
                          Receive periodic summaries of your workflow activity
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!form.getValues('enabled') || !isSendGridConfigured}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className={!form.getValues('features.notifications.enabled') ? 'opacity-50' : ''}>
                  <FormField
                    control={form.control}
                    name="features.notifications.digestFrequency"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border p-4">
                        <div className="space-y-0.5 mb-2">
                          <FormLabel className="text-base">Digest Frequency</FormLabel>
                          <FormDescription>
                            How often you want to receive digest emails
                          </FormDescription>
                        </div>
                        <Select
                          disabled={!form.getValues('features.notifications.enabled') || !form.getValues('enabled') || !isSendGridConfigured}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[200px] mt-1">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="never">Never</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="features.notifications.digestTime"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border p-4 mt-4">
                        <div className="space-y-0.5 mb-2">
                          <FormLabel className="text-base">Delivery Time</FormLabel>
                          <FormDescription>
                            When to send the digest email (24-hour format)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Input
                            type="time"
                            value={field.value}
                            onChange={field.onChange}
                            disabled={!form.getValues('features.notifications.enabled') || form.getValues('features.notifications.digestFrequency') === 'never' || !form.getValues('enabled') || !isSendGridConfigured}
                            className="w-[200px] mt-1"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button 
                    type="button" 
                    onClick={() => saveSection('digest')}
                    disabled={updateMutation.isPending || !isSendGridConfigured}
                  >
                    {updateMutation.isPending && activeTab === 'digest' && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Digest Settings
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onSendTestEmail}
                disabled={testEmailMutation.isPending || !isSendGridConfigured}
              >
                {testEmailMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Send Test Email
              </Button>
            </div>
            <Button 
              type="submit" 
              disabled={updateMutation.isPending || !isSendGridConfigured}
              className="w-full sm:w-auto"
            >
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save All Settings
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}