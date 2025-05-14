import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, RefreshCw, Key, ExternalLink, Copy, Database } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';

// Integration-specific icons
import { 
  SiGooglesheets, 
  SiGmail, 
  SiHubspot, 
  SiFacebook, 
  SiClickup, 
  SiTrello, 
  SiSalesforce, 
  SiMailchimp, 
  SiAirtable,
  SiSlack,
  SiGoogle
} from 'react-icons/si';

// Define the shape of a user credential
export interface UserCredential {
  id: number;
  name: string;
  appIntegrationId: number;
  isValid: boolean;
  lastValidatedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Define the shape of an app integration
export interface AppIntegration {
  id: number;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  category: string;
  authType: string;
  authConfig: any;
  isActive: boolean;
}

// Define props for our component
interface ConnectionManagerProps {
  service?: string;
  requiredFields?: Record<string, string>;
  onCredentialCreated?: (credentialId: number) => void;
  onCredentialSelected?: (credential: UserCredential) => void;
  enableCreate?: boolean;
}

export function ConnectionManager({ 
  service,
  requiredFields = {},
  onCredentialCreated,
  onCredentialSelected,
  enableCreate = true
}: ConnectionManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedCredentialId, setSelectedCredentialId] = useState<number | null>(null);
  const [credentialName, setCredentialName] = useState('');
  const [credentialValues, setCredentialValues] = useState<Record<string, string>>({});
  const [selectedIntegration, setSelectedIntegration] = useState<AppIntegration | null>(null);

  // Fetch available app integrations
  const { data: integrations, isLoading: integrationsLoading } = useQuery({
    queryKey: ['/api/app-integrations'],
    queryFn: async () => {
      try {
        // This is a mock implementation - in a real app, this would call a real API
        const mockIntegrations: AppIntegration[] = [
          {
            id: 1,
            name: 'google-sheets',
            displayName: 'Google Sheets',
            description: 'Connect to Google Sheets to read and write data',
            icon: 'google-sheets',
            category: 'productivity',
            authType: 'oauth2',
            authConfig: {},
            isActive: true
          },
          {
            id: 2,
            name: 'facebook',
            displayName: 'Facebook',
            description: 'Connect to Facebook for lead generation and marketing',
            icon: 'facebook',
            category: 'social',
            authType: 'oauth2',
            authConfig: {},
            isActive: true
          },
          {
            id: 3,
            name: 'hubspot',
            displayName: 'HubSpot',
            description: 'Connect to HubSpot CRM for marketing and sales',
            icon: 'hubspot',
            category: 'crm',
            authType: 'api_key',
            authConfig: {},
            isActive: true
          },
          {
            id: 4,
            name: 'slack',
            displayName: 'Slack',
            description: 'Connect to Slack for messaging and notifications',
            icon: 'slack',
            category: 'communication',
            authType: 'api_key',
            authConfig: {},
            isActive: true
          }
        ];
        
        return mockIntegrations;
      } catch (error) {
        console.error('Error fetching integrations:', error);
        return [];
      }
    }
  });

  // Filter integrations by service name if provided
  const filteredIntegrations = service 
    ? integrations?.filter((integration: AppIntegration) => 
        integration.name.toLowerCase().includes(service.toLowerCase())
      )
    : integrations;

  // Fetch user credentials for selected integration
  const { data: credentials, isLoading: credentialsLoading } = useQuery({
    queryKey: ['/api/user-credentials', selectedIntegration?.id],
    queryFn: async () => {
      if (!selectedIntegration) return [];
      
      try {
        // This is a mock implementation - in a real app, this would call a real API
        const mockCredentials: UserCredential[] = [
          {
            id: 1,
            name: 'My Google Sheets Connection',
            appIntegrationId: 1,
            isValid: true,
            lastValidatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        return mockCredentials.filter(cred => cred.appIntegrationId === selectedIntegration.id);
      } catch (error) {
        console.error('Error fetching credentials:', error);
        return [];
      }
    },
    enabled: !!selectedIntegration
  });

  // Create new credential mutation
  const createCredentialMutation = useMutation({
    mutationFn: async (data: any) => {
      // Mock implementation that returns a successful result
      return { id: Math.floor(Math.random() * 1000) + 1, ...data };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-credentials'] });
      toast({
        title: 'Connection created',
        description: 'Your connection has been set up successfully',
      });
      setIsAddingNew(false);
      setCredentialName('');
      setCredentialValues({});
      if (onCredentialCreated) onCredentialCreated(data.id);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create connection',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Test credential mutation
  const testCredentialMutation = useMutation({
    mutationFn: async (data: any) => {
      // Mock implementation that returns a successful result
      return { isValid: true };
    },
    onSuccess: (data) => {
      if (data.isValid) {
        toast({
          title: 'Connection is valid',
          description: 'Successfully connected to the service',
        });
      } else {
        toast({
          title: 'Connection test failed',
          description: 'Unable to connect with these credentials',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Connection test failed',
        description: error.message || 'An error occurred during testing',
        variant: 'destructive',
      });
    }
  });

  // Choose an integration to work with
  const handleSelectIntegration = (integration: AppIntegration) => {
    setSelectedIntegration(integration);
    setIsAddingNew(false);
    
    // Initialize credential values with required fields if any
    if (Object.keys(requiredFields).length > 0) {
      const initialValues: Record<string, string> = {};
      Object.keys(requiredFields).forEach(key => {
        initialValues[key] = requiredFields[key] || '';
      });
      setCredentialValues(initialValues);
    } else {
      setCredentialValues({});
    }
  };

  // Handle selecting an existing credential
  const handleSelectCredential = (credential: UserCredential) => {
    setSelectedCredentialId(credential.id);
    if (onCredentialSelected) onCredentialSelected(credential);
  };

  // Handle form input changes
  const handleInputChange = (key: string, value: string) => {
    setCredentialValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Save a new credential
  const handleSaveCredential = () => {
    if (!selectedIntegration) return;
    
    createCredentialMutation.mutate({
      name: credentialName,
      appIntegrationId: selectedIntegration.id,
      credentials: credentialValues
    });
  };

  // Test current credential values
  const handleTestCredential = () => {
    if (!selectedIntegration) return;
    
    testCredentialMutation.mutate({
      appIntegrationId: selectedIntegration.id,
      credentials: credentialValues
    });
  };

  // Reset form
  const handleCancelAdd = () => {
    setIsAddingNew(false);
    setCredentialName('');
    setCredentialValues({});
  };

  // Get icon for a service
  const getServiceIcon = (service: string): React.ReactNode => {
    const size = 24;
    
    switch (service.toLowerCase()) {
      case 'google-sheets':
      case 'googlesheets':
        return <SiGooglesheets size={size} className="text-green-600" />;
      case 'gmail':
        return <SiGmail size={size} className="text-red-500" />;
      case 'hubspot':
        return <SiHubspot size={size} className="text-orange-500" />;
      case 'facebook':
        return <SiFacebook size={size} className="text-blue-600" />;
      case 'clickup':
        return <SiClickup size={size} className="text-purple-500" />;
      case 'trello':
        return <SiTrello size={size} className="text-blue-400" />;
      case 'salesforce':
        return <SiSalesforce size={size} className="text-blue-700" />;
      case 'mailchimp':
        return <SiMailchimp size={size} className="text-yellow-500" />;
      case 'airtable':
        return <SiAirtable size={size} className="text-teal-500" />;
      case 'slack':
        return <SiSlack size={size} className="text-purple-600" />;
      case 'google':
        return <SiGoogle size={size} className="text-blue-500" />;
      default:
        return <Database size={size} className="text-gray-500" />;
    }
  };

  // If we only have a single integration based on service filter, select it automatically
  useEffect(() => {
    if (service && filteredIntegrations?.length === 1 && !selectedIntegration) {
      handleSelectIntegration(filteredIntegrations[0]);
    }
  }, [service, filteredIntegrations, selectedIntegration]);

  // Initialize credential fields based on the required fields prop
  useEffect(() => {
    if (Object.keys(requiredFields).length > 0 && selectedIntegration) {
      const initialValues: Record<string, string> = {};
      Object.keys(requiredFields).forEach(key => {
        initialValues[key] = requiredFields[key] || '';
      });
      setCredentialValues(initialValues);
    }
  }, [requiredFields, selectedIntegration]);

  if (integrationsLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="h-8 w-8 text-muted-foreground" />
            </motion.div>
            <span className="ml-3 text-muted-foreground">Loading available connections...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!filteredIntegrations || filteredIntegrations.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <Alert className="bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No integrations available</AlertTitle>
            <AlertDescription>
              {service 
                ? `No integrations found for ${service}. Please try a different service.`
                : 'No integrations are currently available. Please check back later.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {selectedIntegration 
            ? <div className="flex items-center">
                {getServiceIcon(selectedIntegration.name)}
                <span className="ml-2">{selectedIntegration.displayName} Connection</span>
              </div>
            : 'Select a Service'}
        </CardTitle>
        <CardDescription>
          {selectedIntegration 
            ? selectedIntegration.description
            : 'Connect your workflow to external services'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Service selection when no integration is selected */}
        {!selectedIntegration && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map((integration: AppIntegration) => (
              <Card 
                key={integration.id} 
                className="cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => handleSelectIntegration(integration)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {getServiceIcon(integration.name)}
                    <span className="ml-2 font-medium">{integration.displayName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{integration.description}</p>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-3">
                  <span className="text-xs text-muted-foreground">
                    {integration.authType === 'oauth2' ? 'OAuth Authentication' : 'API Key Authentication'}
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Credential management for selected integration */}
        {selectedIntegration && (
          <div>
            {/* Tabs for managing credentials */}
            <Tabs defaultValue={isAddingNew ? "new" : "existing"}>
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="existing">Existing Connections</TabsTrigger>
                  {enableCreate && <TabsTrigger value="new">Create New</TabsTrigger>}
                </TabsList>
                
                <Button
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSelectedIntegration(null);
                    setSelectedCredentialId(null);
                  }}
                >
                  Change Service
                </Button>
              </div>
              
              {/* Existing credentials tab */}
              <TabsContent value="existing">
                {credentialsLoading ? (
                  <div className="flex justify-center items-center py-6">
                    <RefreshCw className="h-5 w-5 text-muted-foreground animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading connections...</span>
                  </div>
                ) : credentials?.length > 0 ? (
                  <div className="space-y-3">
                    {credentials.map((credential: UserCredential) => (
                      <div 
                        key={credential.id}
                        className={`p-4 border rounded-md cursor-pointer transition-all ${
                          selectedCredentialId === credential.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => handleSelectCredential(credential)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="mr-3">
                              {credential.isValid 
                                ? <CheckCircle2 className="h-5 w-5 text-green-500" /> 
                                : <AlertCircle className="h-5 w-5 text-amber-500" />}
                            </div>
                            <div>
                              <div className="font-medium">{credential.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Last validated: {credential.lastValidatedAt 
                                  ? new Date(credential.lastValidatedAt).toLocaleString() 
                                  : 'Never'}
                              </div>
                            </div>
                          </div>
                          <Badge className={credential.isValid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                            {credential.isValid ? 'Valid' : 'Invalid'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground mb-4">No existing connections found</div>
                    {enableCreate && (
                      <Button onClick={() => setIsAddingNew(true)}>Create New Connection</Button>
                    )}
                  </div>
                )}
              </TabsContent>
              
              {/* Create new credential tab */}
              {enableCreate && (
                <TabsContent value="new">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="credential-name">Connection Name</Label>
                      <Input
                        id="credential-name"
                        placeholder="My Google Sheets Connection"
                        value={credentialName}
                        onChange={(e) => setCredentialName(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Give this connection a descriptive name to identify it later
                      </p>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    {/* OAuth vs API Key specific UI */}
                    {selectedIntegration.authType === 'oauth2' ? (
                      <div className="space-y-4">
                        <Alert className="bg-blue-50 border-blue-200">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <AlertTitle className="text-blue-700">OAuth Authentication</AlertTitle>
                          <AlertDescription className="text-blue-700">
                            You&apos;ll be redirected to {selectedIntegration.displayName} to authorize this connection.
                          </AlertDescription>
                        </Alert>
                        
                        <Button 
                          className="w-full"
                          onClick={() => {
                            // Mock OAuth flow for now
                            toast({
                              title: 'OAuth flow initiated',
                              description: `Redirecting to ${selectedIntegration.displayName} authorization page...`,
                            });
                            
                            // In a real implementation, this would redirect to OAuth provider
                            setTimeout(() => {
                              if (createCredentialMutation.isPending) return;
                              
                              // Mock successful OAuth completion
                              createCredentialMutation.mutate({
                                name: credentialName || `${selectedIntegration.displayName} Connection`,
                                appIntegrationId: selectedIntegration.id,
                                credentials: { oauth_token: 'mock_oauth_token' }
                              });
                            }, 1500);
                          }}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Connect with {selectedIntegration.displayName}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Alert className="bg-blue-50 border-blue-200">
                          <Key className="h-4 w-4 text-blue-600" />
                          <AlertTitle className="text-blue-700">API Credentials Required</AlertTitle>
                          <AlertDescription className="text-blue-700">
                            Enter your {selectedIntegration.displayName} API credentials to establish this connection.
                          </AlertDescription>
                        </Alert>
                        
                        {/* Dynamic form fields based on integration */}
                        <div className="space-y-4">
                          {selectedIntegration.name === 'google-sheets' && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="api-key">API Key</Label>
                                <Input
                                  id="api-key"
                                  placeholder="Your Google API Key"
                                  value={credentialValues.api_key || ''}
                                  onChange={(e) => handleInputChange('api_key', e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="client-email">Client Email</Label>
                                <Input
                                  id="client-email"
                                  placeholder="service-account@project.iam.gserviceaccount.com"
                                  value={credentialValues.client_email || ''}
                                  onChange={(e) => handleInputChange('client_email', e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="private-key">Private Key</Label>
                                <Input
                                  id="private-key"
                                  placeholder="-----BEGIN PRIVATE KEY-----..."
                                  value={credentialValues.private_key || ''}
                                  onChange={(e) => handleInputChange('private_key', e.target.value)}
                                />
                              </div>
                            </>
                          )}
                          
                          {selectedIntegration.name === 'hubspot' && (
                            <div className="space-y-2">
                              <Label htmlFor="api-key">API Key</Label>
                              <Input
                                id="api-key"
                                placeholder="Your HubSpot API Key"
                                value={credentialValues.api_key || ''}
                                onChange={(e) => handleInputChange('api_key', e.target.value)}
                              />
                            </div>
                          )}
                          
                          {selectedIntegration.name === 'facebook' && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="app-id">App ID</Label>
                                <Input
                                  id="app-id"
                                  placeholder="Your Facebook App ID"
                                  value={credentialValues.app_id || ''}
                                  onChange={(e) => handleInputChange('app_id', e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="app-secret">App Secret</Label>
                                <Input
                                  id="app-secret"
                                  placeholder="Your Facebook App Secret"
                                  type="password"
                                  value={credentialValues.app_secret || ''}
                                  onChange={(e) => handleInputChange('app_secret', e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="access-token">Access Token</Label>
                                <Input
                                  id="access-token"
                                  placeholder="Your long-lived Access Token"
                                  value={credentialValues.access_token || ''}
                                  onChange={(e) => handleInputChange('access_token', e.target.value)}
                                />
                              </div>
                            </>
                          )}
                          
                          {/* Default form for other integrations */}
                          {!['google-sheets', 'hubspot', 'facebook'].includes(selectedIntegration.name) && (
                            <div className="space-y-2">
                              <Label htmlFor="api-key">API Key / Access Token</Label>
                              <Input
                                id="api-key"
                                placeholder={`Your ${selectedIntegration.displayName} API Key`}
                                value={credentialValues.api_key || ''}
                                onChange={(e) => handleInputChange('api_key', e.target.value)}
                              />
                            </div>
                          )}
                          
                          {/* Specific credential fields for required fields prop */}
                          {Object.keys(requiredFields).map(key => {
                            // Skip fields we've already handled above
                            if (['api_key', 'client_email', 'private_key', 'app_id', 'app_secret', 'access_token'].includes(key)) {
                              return null;
                            }
                            
                            return (
                              <div key={key} className="space-y-2">
                                <Label htmlFor={key}>{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Label>
                                <Input
                                  id={key}
                                  placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                                  value={credentialValues[key] || ''}
                                  onChange={(e) => handleInputChange(key, e.target.value)}
                                />
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex space-x-2 pt-4">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={handleTestCredential}
                            disabled={createCredentialMutation.isPending || testCredentialMutation.isPending}
                          >
                            {testCredentialMutation.isPending ? (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Testing...
                              </>
                            ) : (
                              <>Test Connection</>
                            )}
                          </Button>
                          
                          <Button 
                            className="flex-1"
                            onClick={handleSaveCredential}
                            disabled={!credentialName || createCredentialMutation.isPending}
                          >
                            {createCredentialMutation.isPending ? (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>Save Connection</>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </CardContent>
      
      {selectedIntegration && (
        <CardFooter className="bg-muted/30 border-t flex justify-between">
          <div className="text-xs text-muted-foreground">
            Connection information is securely encrypted and stored
          </div>
          
          {selectedIntegration.authType !== 'oauth2' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Help
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>How to get {selectedIntegration.displayName} credentials</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {selectedIntegration.name === 'google-sheets' && (
                    <div className="space-y-4">
                      <p>To connect to Google Sheets, you need to:</p>
                      <ol className="list-decimal pl-4 space-y-2">
                        <li>Go to the Google Cloud Console</li>
                        <li>Create a new project or select an existing one</li>
                        <li>Enable the Google Sheets API</li>
                        <li>Create a service account</li>
                        <li>Download the JSON key file</li>
                        <li>Extract the client_email and private_key from the JSON file</li>
                        <li>Share your Google Sheets with the client_email address</li>
                      </ol>
                    </div>
                  )}
                  
                  {selectedIntegration.name === 'facebook' && (
                    <div className="space-y-4">
                      <p>To connect to Facebook APIs, you need to:</p>
                      <ol className="list-decimal pl-4 space-y-2">
                        <li>Go to Facebook for Developers</li>
                        <li>Create a new app or select an existing one</li>
                        <li>Navigate to Settings > Basic to find your App ID and App Secret</li>
                        <li>Use the Graph API Explorer to generate a long-lived access token</li>
                      </ol>
                    </div>
                  )}
                  
                  {selectedIntegration.name === 'hubspot' && (
                    <div className="space-y-4">
                      <p>To connect to HubSpot, you need to:</p>
                      <ol className="list-decimal pl-4 space-y-2">
                        <li>Log in to your HubSpot account</li>
                        <li>Go to Settings > Integrations > API Keys</li>
                        <li>Create a new API key or use an existing one</li>
                      </ol>
                    </div>
                  )}
                  
                  {!['google-sheets', 'facebook', 'hubspot'].includes(selectedIntegration.name) && (
                    <div className="space-y-4">
                      <p>To connect to {selectedIntegration.displayName}, you typically need to:</p>
                      <ol className="list-decimal pl-4 space-y-2">
                        <li>Log in to your {selectedIntegration.displayName} account</li>
                        <li>Navigate to the API or Developer settings</li>
                        <li>Create a new API key or access token</li>
                        <li>Copy the key and paste it here</li>
                      </ol>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Documentation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardFooter>
      )}
    </Card>
  );
}