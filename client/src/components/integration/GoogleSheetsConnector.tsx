import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, RefreshCw, Clipboard, ExternalLink, Table, FileSpreadsheet, Search } from 'lucide-react';
import { ConnectionManager, UserCredential } from './ConnectionManager';
import { SiGooglesheets } from 'react-icons/si';
import { motion } from 'framer-motion';

// Types for Google Sheets resources
interface GoogleSpreadsheet {
  id: string;
  name: string;
  modifiedTime: string;
  url: string;
}

interface GoogleSheet {
  id: number;
  title: string;
  index: number;
  rowCount: number;
  columnCount: number;
}

// Component props
interface GoogleSheetsConnectorProps {
  initialSpreadsheetId?: string;
  initialSheetName?: string;
  initialAction?: string;
  onConfigurationComplete?: (config: GoogleSheetsConfig) => void;
  readOnly?: boolean;
}

// Google Sheets configuration data
interface GoogleSheetsConfig {
  credentialId: number;
  spreadsheetId: string;
  spreadsheetName?: string;
  sheetName: string;
  action: string;
  valueInputOption?: string; // RAW or USER_ENTERED
  range?: string; // e.g. "A1:D10"
  headerRow?: boolean; // Whether the first row is a header
  fields?: string[]; // Field mapping for the operation
}

export function GoogleSheetsConnector({
  initialSpreadsheetId = '',
  initialSheetName = '',
  initialAction = 'get_values',
  onConfigurationComplete,
  readOnly = false
}: GoogleSheetsConnectorProps) {
  const { toast } = useToast();
  const [selectedCredentialId, setSelectedCredentialId] = useState<number | null>(null);
  const [step, setStep] = useState<'credential' | 'spreadsheet' | 'sheet' | 'action'>('credential');
  const [formState, setFormState] = useState<GoogleSheetsConfig>({
    credentialId: 0,
    spreadsheetId: initialSpreadsheetId,
    sheetName: initialSheetName,
    action: initialAction,
    valueInputOption: 'USER_ENTERED',
    headerRow: true,
    range: '',
    fields: []
  });
  
  // Track sheet columns derived from sheet data or manually specified
  const [sheetColumns, setSheetColumns] = useState<string[]>([]);
  const [manualRange, setManualRange] = useState(false);
  
  // Handle direct spreadsheet ID input
  const [directSpreadsheetId, setDirectSpreadsheetId] = useState(initialSpreadsheetId);
  const [isLoadingSpreadsheet, setIsLoadingSpreadsheet] = useState(false);
  
  // Queries
  const { data: spreadsheets, isLoading: spreadsheetsLoading } = useQuery({
    queryKey: ['/api/spreadsheets', selectedCredentialId],
    queryFn: async () => {
      try {
        // In a real implementation, this would call the actual Google Sheets API
        // For demo, we'll return some mock data
        return [
          {
            id: 'mock-spreadsheet-1',
            name: 'Customer Data',
            modifiedTime: new Date().toISOString(),
            url: 'https://docs.google.com/spreadsheets/d/mock-spreadsheet-1'
          },
          {
            id: 'mock-spreadsheet-2',
            name: 'Sales Tracking',
            modifiedTime: new Date().toISOString(),
            url: 'https://docs.google.com/spreadsheets/d/mock-spreadsheet-2'
          },
          {
            id: 'mock-spreadsheet-3',
            name: 'Marketing Campaigns',
            modifiedTime: new Date().toISOString(),
            url: 'https://docs.google.com/spreadsheets/d/mock-spreadsheet-3'
          }
        ] as GoogleSpreadsheet[];
      } catch (error) {
        console.error('Error fetching spreadsheets:', error);
        return [];
      }
    },
    enabled: !!selectedCredentialId
  });
  
  const { data: sheets, isLoading: sheetsLoading } = useQuery({
    queryKey: ['/api/sheets', formState.spreadsheetId, selectedCredentialId],
    queryFn: async () => {
      try {
        // In a real implementation, this would call the actual Google Sheets API
        // For demo, we'll return some mock data
        return [
          {
            id: 1,
            title: 'Leads',
            index: 0,
            rowCount: 100,
            columnCount: 10
          },
          {
            id: 2,
            title: 'Customers',
            index: 1,
            rowCount: 250,
            columnCount: 15
          },
          {
            id: 3,
            title: 'Invoices',
            index: 2,
            rowCount: 75,
            columnCount: 8
          }
        ] as GoogleSheet[];
      } catch (error) {
        console.error('Error fetching sheets:', error);
        return [];
      }
    },
    enabled: !!formState.spreadsheetId && !!selectedCredentialId
  });
  
  const { data: sheetData, isLoading: sheetDataLoading } = useQuery({
    queryKey: ['/api/sheet-data', formState.spreadsheetId, formState.sheetName, selectedCredentialId],
    queryFn: async () => {
      try {
        // In a real implementation, this would call the actual Google Sheets API
        // For demo, we'll return some mock data
        
        // Mock headers based on selected sheet
        let headers: string[] = [];
        
        if (formState.sheetName === 'Leads') {
          headers = ['Name', 'Email', 'Phone', 'Source', 'Status', 'Created Date', 'Last Contact', 'Notes'];
        } else if (formState.sheetName === 'Customers') {
          headers = ['Customer ID', 'Company', 'Contact', 'Email', 'Phone', 'Address', 'City', 'State', 'ZIP', 'Country', 'First Purchase', 'Last Purchase', 'Lifetime Value'];
        } else if (formState.sheetName === 'Invoices') {
          headers = ['Invoice #', 'Customer', 'Amount', 'Issue Date', 'Due Date', 'Status', 'Payment Method'];
        } else {
          // Generate generic column names
          headers = Array.from({ length: 10 }, (_, i) => `Column ${String.fromCharCode(65 + i)}`);
        }
        
        // Mock data rows
        const rows = Array.from({ length: 5 }, (_, rowIndex) => {
          return headers.reduce((row, header, colIndex) => {
            if (header.includes('Date')) {
              row[header] = new Date(Date.now() - rowIndex * 86400000).toLocaleDateString();
            } else if (header.includes('Amount') || header.includes('Value')) {
              row[header] = `$${Math.floor(Math.random() * 10000) / 100}`;
            } else if (header.includes('Email')) {
              row[header] = `user${rowIndex}@example.com`;
            } else if (header.includes('Phone')) {
              row[header] = `(555) 123-${1000 + rowIndex}`;
            } else if (header.includes('Status')) {
              const statuses = ['Active', 'Pending', 'Completed', 'Cancelled'];
              row[header] = statuses[rowIndex % statuses.length];
            } else {
              row[header] = `${header} Value ${rowIndex + 1}`;
            }
            return row;
          }, {} as Record<string, string>);
        });
        
        return {
          headers,
          rows
        };
      } catch (error) {
        console.error('Error fetching sheet data:', error);
        return { headers: [], rows: [] };
      }
    },
    enabled: !!formState.spreadsheetId && !!formState.sheetName && !!selectedCredentialId
  });
  
  // Load spreadsheet by ID mutation
  const loadSpreadsheetMutation = useMutation({
    mutationFn: async (spreadsheetId: string) => {
      // In a real implementation, this would validate the ID with Google Sheets API
      // For demo, just return a mock result
      return {
        id: spreadsheetId,
        name: 'Manually Entered Spreadsheet',
        modifiedTime: new Date().toISOString(),
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
      };
    },
    onSuccess: (data) => {
      setFormState(prev => ({
        ...prev,
        spreadsheetId: data.id,
        spreadsheetName: data.name
      }));
      
      toast({
        title: 'Spreadsheet found',
        description: `Successfully connected to "${data.name}"`,
      });
      
      setStep('sheet');
    },
    onError: (error: any) => {
      toast({
        title: 'Spreadsheet not found',
        description: error.message || 'Unable to find spreadsheet with this ID',
        variant: 'destructive',
      });
    }
  });
  
  // Credential selection handler
  const handleCredentialSelected = (credential: UserCredential) => {
    setSelectedCredentialId(credential.id);
    setFormState(prev => ({
      ...prev,
      credentialId: credential.id
    }));
    setStep('spreadsheet');
  };
  
  // Select spreadsheet handler
  const handleSelectSpreadsheet = (spreadsheet: GoogleSpreadsheet) => {
    setFormState(prev => ({
      ...prev,
      spreadsheetId: spreadsheet.id,
      spreadsheetName: spreadsheet.name
    }));
    setStep('sheet');
  };
  
  // Load spreadsheet by ID
  const handleLoadSpreadsheet = () => {
    if (!directSpreadsheetId) {
      toast({
        title: 'Invalid spreadsheet ID',
        description: 'Please enter a valid Google Sheets ID',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoadingSpreadsheet(true);
    loadSpreadsheetMutation.mutate(directSpreadsheetId);
  };
  
  // Select sheet handler
  const handleSelectSheet = (sheet: GoogleSheet) => {
    setFormState(prev => ({
      ...prev,
      sheetName: sheet.title
    }));
    setStep('action');
  };
  
  // Directly set sheet name
  const handleSetSheetName = (name: string) => {
    setFormState(prev => ({
      ...prev,
      sheetName: name
    }));
    setStep('action');
  };
  
  // Action selection handler
  const handleActionChange = (action: string) => {
    setFormState(prev => ({
      ...prev,
      action
    }));
  };
  
  // Range change handler
  const handleRangeChange = (range: string) => {
    setFormState(prev => ({
      ...prev,
      range
    }));
  };
  
  // Value input option change handler
  const handleValueInputOptionChange = (option: string) => {
    setFormState(prev => ({
      ...prev,
      valueInputOption: option
    }));
  };
  
  // Header row toggle handler
  const handleHeaderRowChange = (hasHeader: boolean) => {
    setFormState(prev => ({
      ...prev,
      headerRow: hasHeader
    }));
  };
  
  // Complete configuration
  const handleComplete = () => {
    if (onConfigurationComplete) {
      onConfigurationComplete(formState);
    }
  };
  
  // Effect to set sheet columns when sheet data is loaded
  useEffect(() => {
    if (sheetData?.headers) {
      setSheetColumns(sheetData.headers);
    }
  }, [sheetData]);
  
  // Effect to mark configuration as complete when all required data is available
  useEffect(() => {
    const isComplete = 
      !!formState.credentialId && 
      !!formState.spreadsheetId && 
      !!formState.sheetName && 
      !!formState.action;
    
    if (isComplete && onConfigurationComplete) {
      onConfigurationComplete(formState);
    }
  }, [formState, onConfigurationComplete]);
  
  // If read-only mode, render a simplified view
  if (readOnly) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center">
            <SiGooglesheets className="h-5 w-5 text-green-600 mr-2" />
            <CardTitle>Google Sheets Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Spreadsheet:</span>
              <span className="text-sm">{formState.spreadsheetName || formState.spreadsheetId || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sheet:</span>
              <span className="text-sm">{formState.sheetName || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Action:</span>
              <Badge>
                {formState.action === 'get_values' ? 'Read Data' : 
                 formState.action === 'append_row' ? 'Append Row' : 
                 formState.action === 'update_row' ? 'Update Row' :
                 formState.action}
              </Badge>
            </div>
            {formState.range && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Range:</span>
                <span className="text-sm font-mono">{formState.range}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Step 1: Select Google Sheets credential */}
      {step === 'credential' && (
        <div className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <SiGooglesheets className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-700">Connect to Google Sheets</AlertTitle>
            <AlertDescription className="text-blue-700">
              Select or create a Google Sheets connection to continue
            </AlertDescription>
          </Alert>
          
          <ConnectionManager 
            service="google-sheets"
            requiredFields={{
              api_key: '',
              client_email: '',
              private_key: ''
            }}
            onCredentialSelected={handleCredentialSelected}
            enableCreate={true}
          />
        </div>
      )}
      
      {/* Step 2: Select spreadsheet */}
      {step === 'spreadsheet' && (
        <div className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-700">Select a Spreadsheet</AlertTitle>
            <AlertDescription className="text-green-700">
              Choose a Google Sheets document to connect to, or enter a spreadsheet ID directly
            </AlertDescription>
          </Alert>
          
          <Tabs defaultValue="browse">
            <TabsList className="mb-4">
              <TabsTrigger value="browse">Browse Spreadsheets</TabsTrigger>
              <TabsTrigger value="direct">Direct ID</TabsTrigger>
            </TabsList>
            
            <TabsContent value="browse">
              {spreadsheetsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
                  <span className="ml-3 text-muted-foreground">Loading your spreadsheets...</span>
                </div>
              ) : spreadsheets && spreadsheets.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {spreadsheets.map((spreadsheet) => (
                    <div 
                      key={spreadsheet.id}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all"
                      onClick={() => handleSelectSpreadsheet(spreadsheet)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileSpreadsheet className="h-5 w-5 text-green-600 mr-3" />
                          <div>
                            <h3 className="font-medium">{spreadsheet.name}</h3>
                            <div className="text-xs text-muted-foreground mt-1">
                              Modified: {new Date(spreadsheet.modifiedTime).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-blue-600 hover:underline">
                          Select
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">No spreadsheets found</div>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setStep('credential')}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="direct">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spreadsheet-id">Spreadsheet ID</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="spreadsheet-id"
                      placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      value={directSpreadsheetId}
                      onChange={(e) => setDirectSpreadsheetId(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleLoadSpreadsheet}
                      disabled={isLoadingSpreadsheet}
                    >
                      {isLoadingSpreadsheet ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      <span className="ml-2">Load</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The Spreadsheet ID can be found in the URL of your Google Sheet:
                    <br />
                    <span className="font-mono">https://docs.google.com/spreadsheets/d/<span className="text-primary font-bold">spreadsheetId</span>/edit</span>
                  </p>
                </div>
                
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-700">Permissions Required</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    Make sure you've shared the spreadsheet with the service account email associated with this credential.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={() => setStep('credential')}
            >
              Back to Credentials
            </Button>
          </div>
        </div>
      )}
      
      {/* Step 3: Select sheet */}
      {step === 'sheet' && (
        <div className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <Table className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-700">Select a Sheet</AlertTitle>
            <AlertDescription className="text-green-700">
              Choose a sheet from the spreadsheet "{formState.spreadsheetName || formState.spreadsheetId}"
            </AlertDescription>
          </Alert>
          
          <Tabs defaultValue="browse">
            <TabsList className="mb-4">
              <TabsTrigger value="browse">Browse Sheets</TabsTrigger>
              <TabsTrigger value="direct">Direct Name</TabsTrigger>
            </TabsList>
            
            <TabsContent value="browse">
              {sheetsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
                  <span className="ml-3 text-muted-foreground">Loading sheets...</span>
                </div>
              ) : sheets && sheets.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {sheets.map((sheet) => (
                    <div 
                      key={sheet.id}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all"
                      onClick={() => handleSelectSheet(sheet)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Table className="h-5 w-5 text-green-600 mr-3" />
                          <div>
                            <h3 className="font-medium">{sheet.title}</h3>
                            <div className="text-xs text-muted-foreground mt-1">
                              {sheet.rowCount} rows × {sheet.columnCount} columns
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-blue-600 hover:underline">
                          Select
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">No sheets found</div>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setStep('spreadsheet')}
                  >
                    Back to Spreadsheet Selection
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="direct">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sheet-name">Sheet Name</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="sheet-name"
                      placeholder="e.g. Sheet1"
                      value={formState.sheetName}
                      onChange={(e) => setFormState(prev => ({ ...prev, sheetName: e.target.value }))}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => handleSetSheetName(formState.sheetName)}
                      disabled={!formState.sheetName}
                    >
                      <span>Continue</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the exact name of the sheet tab you want to use
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={() => setStep('spreadsheet')}
            >
              Back to Spreadsheet
            </Button>
          </div>
        </div>
      )}
      
      {/* Step 4: Configure action */}
      {step === 'action' && (
        <div className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-700">Configure Google Sheets Action</AlertTitle>
            <AlertDescription className="text-green-700">
              Set up how you want to interact with the sheet "{formState.sheetName}"
            </AlertDescription>
          </Alert>
          
          <div className="space-y-6 p-4 border rounded-lg">
            <div className="space-y-3">
              <h3 className="text-lg font-medium mb-2">Select Google Sheets Module</h3>
              <p className="text-gray-500 mb-4">Choose an action or trigger from Google Sheets</p>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2 text-gray-700">ROWS</h4>
                <div className="grid gap-3">
                  <div 
                    className={`p-3 border rounded-lg ${formState.action === 'watch_rows' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'} cursor-pointer flex items-start gap-3`}
                    onClick={() => handleActionChange('watch_rows')}
                  >
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Watch New Rows</h5>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Trigger</Badge>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">Triggers when a new row is added to the sheet</p>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-3 border rounded-lg ${formState.action === 'get_values' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'} cursor-pointer flex items-start gap-3`}
                    onClick={() => handleActionChange('get_values')}
                  >
                    <div className="p-2 bg-green-100 text-green-600 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Read Data</h5>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Action</Badge>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">Retrieves data from a spreadsheet</p>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-3 border rounded-lg ${formState.action === 'append_row' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'} cursor-pointer flex items-start gap-3`}
                    onClick={() => handleActionChange('append_row')}
                  >
                    <div className="p-2 bg-green-100 text-green-600 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Add a Row</h5>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Action</Badge>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">Appends a new row to the sheet</p>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-3 border rounded-lg ${formState.action === 'update_row' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'} cursor-pointer flex items-start gap-3`}
                    onClick={() => handleActionChange('update_row')}
                  >
                    <div className="p-2 bg-green-100 text-green-600 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Update Row</h5>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Action</Badge>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">Updates an existing row in the sheet</p>
                    </div>
                  </div>
                </div>
              </div>
                </div>
              </RadioGroup>
            </div>
            
            <Separator />
            
            {/* Range selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="range">Data Range</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Manual Range</span>
                  <Switch 
                    checked={manualRange} 
                    onCheckedChange={setManualRange}
                  />
                </div>
              </div>
              
              {manualRange ? (
                <Input
                  id="range"
                  placeholder="e.g. A1:D10"
                  value={formState.range || ''}
                  onChange={(e) => handleRangeChange(e.target.value)}
                />
              ) : (
                <Select
                  value={formState.range || 'all'}
                  onValueChange={(value) => handleRangeChange(value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All data (entire sheet)</SelectItem>
                    <SelectItem value="A:Z">All columns (A:Z)</SelectItem>
                    <SelectItem value="1:1000">All rows (1:1000)</SelectItem>
                    <SelectItem value="A1:D10">Fixed range (A1:D10)</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              <p className="text-xs text-muted-foreground">
                Specify which cells to read from or write to. Leave empty to use all data.
              </p>
            </div>
            
            {formState.action === 'append_row' && (
              <>
                <Separator />
                
                {/* Value input option */}
                <div className="space-y-3">
                  <Label htmlFor="value-input-option">Input Processing</Label>
                  <Select
                    value={formState.valueInputOption}
                    onValueChange={handleValueInputOptionChange}
                  >
                    <SelectTrigger id="value-input-option">
                      <SelectValue placeholder="Select input processing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RAW">Raw (no formula processing)</SelectItem>
                      <SelectItem value="USER_ENTERED">User Entered (process formulas)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Controls how values are processed. "User Entered" will process formulas, while "Raw" will not.
                  </p>
                </div>
              </>
            )}
            
            <Separator />
            
            {/* Header row toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="header-row" className="block mb-1">Header Row</Label>
                <p className="text-xs text-muted-foreground">
                  First row contains column headers
                </p>
              </div>
              <Switch 
                id="header-row"
                checked={formState.headerRow} 
                onCheckedChange={handleHeaderRowChange}
              />
            </div>
            
            {sheetDataLoading ? (
              <div className="py-4 flex justify-center">
                <RefreshCw className="h-5 w-5 text-muted-foreground animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading sheet data...</span>
              </div>
            ) : sheetData?.headers && sheetData.headers.length > 0 ? (
              <>
                <Separator />
                
                {/* Preview of sheet structure */}
                <div className="space-y-3">
                  <Label>Sheet Structure Preview</Label>
                  <div className="overflow-x-auto">
                    <div className="border rounded-md">
                      <div className="grid grid-cols-4 gap-2 p-2 bg-muted/50 font-medium border-b">
                        {sheetData.headers.slice(0, 4).map((header, index) => (
                          <div key={index} className="text-xs truncate">
                            {header}
                          </div>
                        ))}
                        {sheetData.headers.length > 4 && (
                          <div className="text-xs text-muted-foreground">
                            +{sheetData.headers.length - 4} more columns
                          </div>
                        )}
                      </div>
                      <div className="p-2 text-xs text-muted-foreground text-center">
                        {sheetData.rows.length} rows detected
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
          
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={() => setStep('sheet')}
            >
              Back to Sheet Selection
            </Button>
            
            <Button 
              onClick={handleComplete}
            >
              Complete Configuration
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}