import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, RefreshCw, Database, ExternalLink, Copy, Check, ChevronsUpDown, ListFilter, Table } from 'lucide-react';
import { SiGooglesheets } from 'react-icons/si';
import { ConnectionManager, UserCredential } from './ConnectionManager';
import { apiRequest } from '@/lib/queryClient';

// Define the interfaces for Google Sheets data
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

interface GoogleSheetsConnectorProps {
  initialSpreadsheetId?: string;
  initialSheetName?: string;
  initialAction?: string;
  onConfigurationComplete?: (config: GoogleSheetsConfig) => void;
  readOnly?: boolean;
}

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
  initialSpreadsheetId,
  initialSheetName,
  initialAction = 'get_values',
  onConfigurationComplete,
  readOnly = false
}: GoogleSheetsConnectorProps) {
  const { toast } = useToast();
  const [selectedCredentialId, setSelectedCredentialId] = useState<number | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState(initialSpreadsheetId || '');
  const [customSpreadsheetId, setCustomSpreadsheetId] = useState('');
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<GoogleSpreadsheet | null>(null);
  const [selectedSheetName, setSelectedSheetName] = useState(initialSheetName || '');
  const [selectedAction, setSelectedAction] = useState(initialAction);
  const [valueInputOption, setValueInputOption] = useState('USER_ENTERED');
  const [range, setRange] = useState('');
  const [headerRow, setHeaderRow] = useState(true);
  const [fields, setFields] = useState<string[]>([]);
  const [fieldsInput, setFieldsInput] = useState('');
  const [isConfigComplete, setIsConfigComplete] = useState(false);

  // Fetch spreadsheets when credential is selected
  const { data: spreadsheets, isLoading: spreadsheetsLoading, refetch: refetchSpreadsheets } = useQuery({
    queryKey: ['/api/google-sheets/spreadsheets', selectedCredentialId],
    queryFn: async () => {
      if (!selectedCredentialId) return [];
      
      try {
        // This is a mock implementation - in a real app, this would call a real API
        const mockSpreadsheets: GoogleSpreadsheet[] = [
          { id: '1D2F3G4H5I6J7K8L9M0N1O2P3Q4R5S6T7U', name: 'Customer Data', modifiedTime: '2025-05-10T12:00:00Z', url: 'https://docs.google.com/spreadsheets/d/1D2F3G4H/edit' },
          { id: '2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U', name: 'Sales Pipeline', modifiedTime: '2025-05-11T14:30:00Z', url: 'https://docs.google.com/spreadsheets/d/2E3F4G5/edit' },
          { id: '3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V', name: 'Marketing Campaigns', modifiedTime: '2025-05-12T09:15:00Z', url: 'https://docs.google.com/spreadsheets/d/3F4G5H6/edit' },
        ];
        
        // In a real implementation, return data from the API
        return mockSpreadsheets;
      } catch (error) {
        console.error('Error fetching spreadsheets:', error);
        return [];
      }
    },
    enabled: !!selectedCredentialId,
  });

  // Fetch sheets in a spreadsheet
  const { data: sheets, isLoading: sheetsLoading, refetch: refetchSheets } = useQuery({
    queryKey: ['/api/google-sheets/sheets', selectedCredentialId, spreadsheetId],
    queryFn: async () => {
      if (!selectedCredentialId || !spreadsheetId) return [];
      
      try {
        // Mock implementation
        const mockSheets: GoogleSheet[] = [
          { id: 0, title: 'Sheet1', index: 0, rowCount: 100, columnCount: 10 },
          { id: 1, title: 'Sheet2', index: 1, rowCount: 50, columnCount: 8 },
          { id: 2, title: 'Data', index: 2, rowCount: 200, columnCount: 15 },
        ];
        
        return mockSheets;
      } catch (error) {
        console.error('Error fetching sheets:', error);
        return [];
      }
    },
    enabled: !!selectedCredentialId && !!spreadsheetId,
  });

  // Fetch sample data to extract headers
  const { data: sampleData, isLoading: sampleDataLoading, refetch: refetchSampleData } = useQuery({
    queryKey: ['/api/google-sheets/sample-data', selectedCredentialId, spreadsheetId, selectedSheetName],
    queryFn: async () => {
      if (!selectedCredentialId || !spreadsheetId || !selectedSheetName) return null;
      
      try {
        // Mock implementation
        const mockHeaders = ['Name', 'Email', 'Phone', 'Company', 'Deal Value', 'Status'];
        const mockRows = [
          ['John Doe', 'john@example.com', '555-1234', 'Acme Inc', '$5000', 'Open'],
          ['Jane Smith', 'jane@example.com', '555-5678', 'XYZ Corp', '$7500', 'Negotiation'],
        ];
        
        return { headers: mockHeaders, rows: mockRows };
      } catch (error) {
        console.error('Error fetching sample data:', error);
        return null;
      }
    },
    enabled: !!selectedCredentialId && !!spreadsheetId && !!selectedSheetName,
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCredentialId) throw new Error('No credential selected');
      
      // In a real implementation, this would call an actual API
      return { success: true, message: 'Connection successful' };
    },
    onSuccess: (data) => {
      toast({
        title: 'Connection successful',
        description: 'Successfully connected to Google Sheets',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Connection test failed',
        description: error.message || 'Failed to connect to Google Sheets',
        variant: 'destructive',
      });
    }
  });

  // Handle credential selection
  const handleCredentialSelected = (credential: UserCredential) => {
    setSelectedCredentialId(credential.id);
    toast({
      title: 'Credential selected',
      description: `Using ${credential.name} for Google Sheets`,
    });
  };

  // Handle spreadsheet selection
  const handleSpreadsheetSelected = (spreadsheet: GoogleSpreadsheet | null) => {
    if (!spreadsheet && !customSpreadsheetId) {
      toast({
        title: 'No spreadsheet selected',
        description: 'Please select a spreadsheet or enter a spreadsheet ID',
        variant: 'destructive',
      });
      return;
    }
    
    if (spreadsheet) {
      setSpreadsheetId(spreadsheet.id);
      setSelectedSpreadsheet(spreadsheet);
    } else if (customSpreadsheetId) {
      // Validate spreadsheet ID format first
      if (!/^[a-zA-Z0-9-_]{10,100}$/.test(customSpreadsheetId)) {
        toast({
          title: 'Invalid spreadsheet ID',
          description: 'Please enter a valid Google Sheets spreadsheet ID',
          variant: 'destructive',
        });
        return;
      }
      
      setSpreadsheetId(customSpreadsheetId);
      setSelectedSpreadsheet({
        id: customSpreadsheetId,
        name: 'Custom Spreadsheet',
        modifiedTime: new Date().toISOString(),
        url: `https://docs.google.com/spreadsheets/d/${customSpreadsheetId}/edit`,
      });
    }
    
    // Reset sheet selection
    setSelectedSheetName('');
  };

  // Handle sheet selection
  const handleSheetSelected = (sheetName: string) => {
    setSelectedSheetName(sheetName);
    
    // Reset fields based on selected sheet
    if (sampleData?.headers && headerRow) {
      setFields(sampleData.headers);
      setFieldsInput(sampleData.headers.join(', '));
    } else {
      setFields([]);
      setFieldsInput('');
    }
  };

  // Handle parsing fields from input
  const handleFieldsInputChange = (input: string) => {
    setFieldsInput(input);
    setFields(input.split(',').map(field => field.trim()).filter(Boolean));
  };

  // Check if configuration is complete
  useEffect(() => {
    const isComplete = !!selectedCredentialId && 
      !!spreadsheetId && 
      !!selectedSheetName && 
      !!selectedAction;
    
    setIsConfigComplete(isComplete);
    
    if (isComplete && onConfigurationComplete) {
      onConfigurationComplete({
        credentialId: selectedCredentialId!,
        spreadsheetId,
        spreadsheetName: selectedSpreadsheet?.name,
        sheetName: selectedSheetName,
        action: selectedAction,
        valueInputOption,
        range: range || `${selectedSheetName}!A1:Z1000`,
        headerRow,
        fields
      });
    }
  }, [
    selectedCredentialId, 
    spreadsheetId, 
    selectedSpreadsheet,
    selectedSheetName, 
    selectedAction,
    valueInputOption,
    range,
    headerRow,
    fields,
    onConfigurationComplete
  ]);

  return (
    <div className="space-y-6">
      {/* Connection Management Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center">
            <SiGooglesheets className="h-6 w-6 text-green-600 mr-2" />
            <div>
              <CardTitle>Google Sheets Connection</CardTitle>
              <CardDescription>Connect to Google Sheets to access your spreadsheets</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ConnectionManager 
            service="google-sheets"
            requiredFields={{ 
              api_key: '',
              client_email: '',
              private_key: '' 
            }}
            onCredentialSelected={handleCredentialSelected}
            enableCreate={!readOnly}
          />
        </CardContent>
      </Card>

      {/* Spreadsheet Selection Section */}
      <Card className={selectedCredentialId ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
        <CardHeader className="pb-3">
          <CardTitle>Select Spreadsheet</CardTitle>
          <CardDescription>Choose a spreadsheet or enter a spreadsheet ID</CardDescription>
        </CardHeader>
        <CardContent>
          {spreadsheetsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : spreadsheets && spreadsheets.length > 0 ? (
            <div className="space-y-4">
              <div>
                <Label>Your Spreadsheets</Label>
                <Select 
                  onValueChange={(value) => {
                    const selected = spreadsheets.find(s => s.id === value);
                    handleSpreadsheetSelected(selected || null);
                  }}
                  value={spreadsheetId}
                  disabled={readOnly}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a spreadsheet" />
                  </SelectTrigger>
                  <SelectContent>
                    {spreadsheets.map((sheet) => (
                      <SelectItem key={sheet.id} value={sheet.id}>
                        {sheet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                OR
              </div>

              <div className="space-y-2">
                <Label htmlFor="spreadsheet-id">Enter Spreadsheet ID</Label>
                <div className="flex space-x-2">
                  <Input
                    id="spreadsheet-id"
                    placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    value={customSpreadsheetId}
                    onChange={(e) => setCustomSpreadsheetId(e.target.value)}
                    disabled={readOnly}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => handleSpreadsheetSelected(null)}
                    disabled={!customSpreadsheetId || readOnly}
                  >
                    Use ID
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  The spreadsheet ID is found in the URL between /d/ and /edit
                </p>
              </div>
            </div>
          ) : (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">No spreadsheets found</AlertTitle>
              <AlertDescription className="text-amber-700">
                {spreadsheets?.length === 0 
                  ? "You don't have any spreadsheets accessible with this connection."
                  : "An error occurred while fetching your spreadsheets."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        {selectedSpreadsheet && (
          <CardFooter className="bg-muted/30 border-t flex justify-between p-4">
            <div className="flex items-center text-sm">
              <span className="font-medium mr-2">Selected:</span> 
              {selectedSpreadsheet.name}
            </div>
            {!readOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(selectedSpreadsheet.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Google Sheets
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      {/* Sheet Selection Section */}
      <Card className={selectedCredentialId && spreadsheetId ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
        <CardHeader className="pb-3">
          <CardTitle>Select Sheet</CardTitle>
          <CardDescription>Choose which sheet to work with</CardDescription>
        </CardHeader>
        <CardContent>
          {sheetsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : sheets && sheets.length > 0 ? (
            <div className="space-y-4">
              <div>
                <Label>Available Sheets</Label>
                <Select 
                  onValueChange={handleSheetSelected} 
                  value={selectedSheetName}
                  disabled={readOnly}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a sheet" />
                  </SelectTrigger>
                  <SelectContent>
                    {sheets.map((sheet) => (
                      <SelectItem key={sheet.id} value={sheet.title}>
                        {sheet.title} ({sheet.rowCount} rows)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedSheetName && sampleData && (
                <div className="border rounded-md p-4 bg-muted/30">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Sheet Preview</h4>
                    <Badge className="bg-green-100 text-green-800">
                      {sampleData.rows.length} rows
                    </Badge>
                  </div>
                  
                  <div className="overflow-x-auto max-h-40 border rounded">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {sampleData.headers.map((header, i) => (
                            <th
                              key={i}
                              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sampleData.rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j} className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">No sheets found</AlertTitle>
              <AlertDescription className="text-amber-700">
                {sheets?.length === 0 
                  ? "No sheets found in this spreadsheet."
                  : "An error occurred while fetching sheets."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Operation Selection Section */}
      <Card className={selectedCredentialId && spreadsheetId && selectedSheetName ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
        <CardHeader className="pb-3">
          <CardTitle>Configure Operation</CardTitle>
          <CardDescription>Choose what you want to do with this sheet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Operation</Label>
              <Select 
                onValueChange={setSelectedAction} 
                value={selectedAction}
                disabled={readOnly}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="get_values">Get Values</SelectItem>
                  <SelectItem value="append_row">Append Row</SelectItem>
                  <SelectItem value="update_values">Update Values</SelectItem>
                  <SelectItem value="clear_values">Clear Values</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Accordion type="single" collapsible>
              <AccordionItem value="advanced-options">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <ChevronsUpDown className="h-4 w-4 mr-2" />
                    Advanced Options
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                    {/* Range option */}
                    <div className="space-y-2">
                      <Label htmlFor="range">Range (Optional)</Label>
                      <Input
                        id="range"
                        placeholder={`${selectedSheetName}!A1:Z1000`}
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        disabled={readOnly}
                      />
                      <p className="text-xs text-muted-foreground">
                        Specify a range like "A1:D10" or leave empty for entire sheet
                      </p>
                    </div>
                    
                    {/* Value input option for writes */}
                    {['append_row', 'update_values'].includes(selectedAction) && (
                      <div className="space-y-2">
                        <Label>Value Input Option</Label>
                        <Select 
                          onValueChange={setValueInputOption} 
                          value={valueInputOption}
                          disabled={readOnly}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select input behavior" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RAW">Raw (No Formatting)</SelectItem>
                            <SelectItem value="USER_ENTERED">User Entered (With Formatting)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Determines if values should be parsed as formulas, dates, etc.
                        </p>
                      </div>
                    )}
                    
                    {/* Header row option */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="header-row"
                        checked={headerRow}
                        onChange={(e) => setHeaderRow(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                        disabled={readOnly}
                      />
                      <Label htmlFor="header-row" className="text-sm font-normal cursor-pointer">
                        First row contains headers
                      </Label>
                    </div>
                    
                    {/* Field mapping for append operations */}
                    {['append_row', 'update_values'].includes(selectedAction) && (
                      <div className="space-y-2">
                        <Label htmlFor="fields">Fields</Label>
                        <Input
                          id="fields"
                          placeholder="name, email, phone, status"
                          value={fieldsInput}
                          onChange={(e) => handleFieldsInputChange(e.target.value)}
                          disabled={readOnly}
                        />
                        <p className="text-xs text-muted-foreground">
                          Comma-separated list of fields to use for this operation
                        </p>
                        
                        {fields.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {fields.map((field, index) => (
                              <Badge key={index} className="bg-blue-100 text-blue-800">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/20 px-6 py-4">
          <div className="w-full">
            <Alert className={isConfigComplete ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}>
              {isConfigComplete ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              )}
              <AlertTitle className={isConfigComplete ? "text-green-800" : "text-amber-800"}>
                {isConfigComplete ? "Configuration Complete" : "Configuration Incomplete"}
              </AlertTitle>
              <AlertDescription className={isConfigComplete ? "text-green-700" : "text-amber-700"}>
                {isConfigComplete 
                  ? `Ready to ${selectedAction.replace('_', ' ')} ${fields.length ? `with fields: ${fields.join(', ')}` : ''}`
                  : "Please complete all required configuration steps"}
              </AlertDescription>
            </Alert>
            
            {!readOnly && isConfigComplete && (
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={() => testConnectionMutation.mutate()} 
                  variant="outline" 
                  disabled={testConnectionMutation.isPending}
                >
                  {testConnectionMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>Test Connection</>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}