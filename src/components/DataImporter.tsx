import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ParsedData {
  incidents: any[];
  incident_details: any[];
  training_sessions: any[];
  inspections: any[];
}

interface SheetInfo {
  name: string;
  rowCount: number;
  selected: boolean;
}

const DataImporter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [importing, setImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [availableSheets, setAvailableSheets] = useState<SheetInfo[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const { toast } = useToast();

  const mapSeverityToNumber = (severity: string) => {
    const severityMap: { [key: string]: number } = {
      'Low': 1,
      'Medium': 2,
      'High': 3,
      'Critical': 4
    };
    return severityMap[severity] || 2;
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Detect all sheets and their row counts
        const sheets: SheetInfo[] = workbook.SheetNames.map(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          return {
            name: sheetName,
            rowCount: jsonData.length,
            selected: false
          };
        });
        
        setAvailableSheets(sheets);
        
        // Auto-select the first sheet if there are any
        if (sheets.length > 0) {
          setSelectedSheets([sheets[0].name]);
          processSelectedSheets(workbook, [sheets[0].name]);
        }
        
        toast({
          title: "File Analyzed Successfully",
          description: `Found ${sheets.length} sheet(s). Select which sheets to import.`,
        });
      } catch (error) {
        toast({
          title: "Parse Error",
          description: "Failed to parse Excel file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processSelectedSheets = (workbook: XLSX.WorkBook, sheetNames: string[]) => {
    const incidents: any[] = [];
    const incident_details: any[] = [];
    const training_sessions: any[] = [];
    const inspections: any[] = [];

    // Process each selected sheet
    sheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Parse the data based on your Excel structure
      jsonData.forEach((row: any, index) => {
        // Parse incidents data (assuming structured incident data)
        if (row.Incident || row.incident || row['Incident Type'] || row.type === 'incident' || sheetName.toLowerCase().includes('incident')) {
          incidents.push({
            incident_name: row.Incident || row.incident || row['Incident Type'] || 'Unknown',
            time: row.Time || row.time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            critical_level: row['Critical Level'] || row.critical_level || row.severity_level || 'Medium',
            place: row.Place || row.place || row.location || 'Unknown',
            date: row.Date || row.date || new Date().toISOString().split('T')[0],
            type: row['Incident Type'] || row.incident_type || row.type || 'General',
            description: row.description || row.Description || row.Incident || row.incident || '',
            activity: row.activity || row.Activity || row.place || row.Place || '',
            severity_level: mapSeverityToNumber(row['Critical Level'] || row.critical_level || 'Medium'),
            contractor_id: row.contractor_id || null
          });
        } else if (row.type === 'training' || row.Type === 'training' || sheetName.toLowerCase().includes('training')) {
          training_sessions.push({
            date: row.date || row.Date,
            topic: row.topic || row.Topic,
            type: row.training_type || row['Training Type'],
            conductor: row.conductor || row.Conductor,
            no_of_attendees: row.attendees || row.Attendees || 0
          });
        } else if (row.type === 'inspection' || row.Type === 'inspection' || sheetName.toLowerCase().includes('inspection')) {
          inspections.push({
            date: row.date || row.Date,
            type: row.inspection_type || row['Inspection Type'],
            inspector: row.inspector || row.Inspector,
            score: row.score || row.Score || 0
          });
        }
      });
    });

    const parsed = { incidents, incident_details, training_sessions, inspections };
    setParsedData(parsed);
    
    toast({
      title: "Data Processed Successfully",
      description: `Found ${incidents.length} incidents, ${training_sessions.length} training sessions, and ${inspections.length} inspections.`,
    });
  };

  const handleSheetSelection = (sheetName: string, selected: boolean) => {
    let newSelectedSheets: string[];
    if (selected) {
      newSelectedSheets = [...selectedSheets, sheetName];
    } else {
      newSelectedSheets = selectedSheets.filter(name => name !== sheetName);
    }
    
    setSelectedSheets(newSelectedSheets);
    
    // Re-process data with new selection
    if (file && newSelectedSheets.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        processSelectedSheets(workbook, newSelectedSheets);
      };
      reader.readAsArrayBuffer(file);
    } else if (newSelectedSheets.length === 0) {
      setParsedData(null);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.includes('sheet') || droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
        setFile(droppedFile);
        parseExcelFile(droppedFile);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  const getSeverityBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'secondary';
      case 'medium': return 'default';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'default';
    }
  };

  // Filter and pagination logic for data preview
  const filteredIncidents = useMemo(() => {
    if (!parsedData?.incidents) return [];
    
    return parsedData.incidents.filter(incident => 
      Object.values(incident).some(value => 
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [parsedData?.incidents, searchTerm]);

  const paginatedIncidents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredIncidents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredIncidents, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);

  const handleImportData = async () => {
    if (!parsedData) {
      toast({
        title: "Error",
        description: "No data to import. Please upload and parse an Excel file first.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setUploadProgress(0);
    
    try {
      const totalOperations = 4;
      let completedOperations = 0;

      // Insert incidents
      if (parsedData.incidents.length > 0) {
        const { error: incidentsError } = await supabase
          .from('incidents')
          .insert(parsedData.incidents);
        
        if (incidentsError) {
          throw new Error(`Failed to insert incidents: ${incidentsError.message}`);
        }
      }
      completedOperations++;
      setUploadProgress((completedOperations / totalOperations) * 100);

      // Insert incident details
      if (parsedData.incident_details.length > 0) {
        const { error: detailsError } = await supabase
          .from('incident_details')
          .insert(parsedData.incident_details);
        
        if (detailsError) {
          throw new Error(`Failed to insert incident details: ${detailsError.message}`);
        }
      }
      completedOperations++;
      setUploadProgress((completedOperations / totalOperations) * 100);

      // Insert training sessions
      if (parsedData.training_sessions.length > 0) {
        const { error: trainingError } = await supabase
          .from('training_sessions')
          .insert(parsedData.training_sessions);
        
        if (trainingError) {
          throw new Error(`Failed to insert training sessions: ${trainingError.message}`);
        }
      }
      completedOperations++;
      setUploadProgress((completedOperations / totalOperations) * 100);

      // Insert inspections
      if (parsedData.inspections.length > 0) {
        const { error: inspectionsError } = await supabase
          .from('inspections')
          .insert(parsedData.inspections);
        
        if (inspectionsError) {
          throw new Error(`Failed to insert inspections: ${inspectionsError.message}`);
        }
      }
      completedOperations++;
      setUploadProgress(100);

      toast({
        title: "Import Complete",
        description: "Data has been imported successfully. The page will refresh to show the new data.",
      });
      
      // Reset state after successful import
      setTimeout(() => {
        setFile(null);
        setParsedData(null);
        setUploadProgress(0);
        // Refresh the page to show updated data
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import data",
        variant: "destructive",
      });
      setUploadProgress(0);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6" />
          Excel Data Importer
        </CardTitle>
        <CardDescription>
          Upload your HSE Statistics Excel file to import incidents, training sessions, and inspections data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {file ? file.name : 'Drop your Excel file here'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {file ? 'File ready for import' : 'Or click to browse and select a file'}
          </p>
          <p className="text-sm text-muted-foreground">
            Supports .xlsx and .xls files
          </p>
        </div>

        {/* File Info */}
        {file && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              File loaded: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              {availableSheets.length > 0 && (
                <span className="block mt-2 text-sm">
                  Found {availableSheets.length} sheet(s): {availableSheets.map(s => s.name).join(', ')}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Sheet Selection */}
        {availableSheets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Sheets to Import</CardTitle>
              <CardDescription>
                Choose which sheets contain the data you want to import
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableSheets.map((sheet) => (
                  <div key={sheet.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`sheet-${sheet.name}`}
                        checked={selectedSheets.includes(sheet.name)}
                        onChange={(e) => handleSheetSelection(sheet.name, e.target.checked)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label htmlFor={`sheet-${sheet.name}`} className="font-medium">
                        {sheet.name}
                      </label>
                    </div>
                    <Badge variant="secondary">
                      {sheet.rowCount} rows
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Selected {selectedSheets.length} of {availableSheets.length} sheets
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Preview */}
        {parsedData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Data Preview
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search data..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 w-64"
                />
              </div>
            </div>

            {/* Incidents Table */}
            {parsedData.incidents.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium flex items-center gap-2">
                          Incident
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </th>
                        <th className="text-left p-4 font-medium">
                          Time
                          <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
                        </th>
                        <th className="text-left p-4 font-medium">
                          Critical Level
                          <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
                        </th>
                        <th className="text-left p-4 font-medium">
                          Place
                          <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
                        </th>
                        <th className="text-left p-4 font-medium">
                          Date
                          <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedIncidents.map((incident, index) => (
                        <tr key={index} className="border-t hover:bg-muted/25">
                          <td className="p-4">
                            <span className="font-medium text-foreground">
                              {incident.incident_name || incident.incident || incident.type}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {incident.time}
                          </td>
                          <td className="p-4">
                            <Badge variant={getSeverityBadgeVariant(incident.critical_level || 'Medium')}>
                              {incident.critical_level || 'Medium'}
                            </Badge>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {incident.place}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {incident.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t bg-muted/25">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredIncidents.length)} of {filteredIncidents.length} rows
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Incidents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-destructive">
                    {parsedData.incidents.length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Training Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">
                    {parsedData.training_sessions.length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Inspections</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-secondary">
                    {parsedData.inspections.length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Import Progress */}
        {importing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Importing data...</span>
              <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Import Button */}
        <div className="flex gap-4">
          <Button 
            onClick={handleImportData} 
            disabled={!parsedData || importing}
            className="flex-1"
            size="lg"
          >
            {importing ? 'Importing Data...' : 'Import Data to Database'}
          </Button>
          {parsedData && (
            <Button 
              variant="outline" 
              onClick={() => {
                setFile(null);
                setParsedData(null);
              }}
              disabled={importing}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Excel Format Requirements:</strong> Your Excel file should contain columns for 'type' (incident/training/inspection), 
            'date', and relevant data fields. The importer will automatically categorize rows based on the 'type' column.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default DataImporter;