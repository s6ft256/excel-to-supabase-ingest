import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ParsedData {
  incidents: any[];
  incident_details: any[];
  training_sessions: any[];
  inspections: any[];
}

const DataImporter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [importing, setImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Parse different sheets or sections of the Excel file
        const incidents: any[] = [];
        const incident_details: any[] = [];
        const training_sessions: any[] = [];
        const inspections: any[] = [];

        // Assuming the Excel has specific sheet names or we parse from the first sheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        // Parse the data based on your Excel structure
        jsonData.forEach((row: any, index) => {
          // Example parsing - adjust based on your Excel structure
          if (row.type === 'incident' || row.Type === 'incident') {
            incidents.push({
              date: row.date || row.Date,
              type: row.incident_type || row['Incident Type'],
              description: row.description || row.Description,
              activity: row.activity || row.Activity,
              severity_level: row.severity_level || row['Severity Level'] || 1,
              contractor_id: row.contractor_id || null
            });
          } else if (row.type === 'training' || row.Type === 'training') {
            training_sessions.push({
              date: row.date || row.Date,
              topic: row.topic || row.Topic,
              type: row.training_type || row['Training Type'],
              conductor: row.conductor || row.Conductor,
              no_of_attendees: row.attendees || row.Attendees || 0
            });
          } else if (row.type === 'inspection' || row.Type === 'inspection') {
            inspections.push({
              date: row.date || row.Date,
              type: row.inspection_type || row['Inspection Type'],
              inspector: row.inspector || row.Inspector,
              score: row.score || row.Score || 0
            });
          }
        });

        const parsed = { incidents, incident_details, training_sessions, inspections };
        setParsedData(parsed);
        
        toast({
          title: "File Parsed Successfully",
          description: `Found ${incidents.length} incidents, ${training_sessions.length} training sessions, and ${inspections.length} inspections.`,
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
        description: "Data has been imported successfully. Refresh the dashboard to see the new data.",
      });
      
      // Reset state after successful import
      setTimeout(() => {
        setFile(null);
        setParsedData(null);
        setUploadProgress(0);
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
            </AlertDescription>
          </Alert>
        )}

        {/* Data Preview */}
        {parsedData && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data Preview</h3>
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

            {/* Sample Data Display */}
            {parsedData.incidents.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Sample Incident Data:</h4>
                <div className="bg-muted p-3 rounded text-sm">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(parsedData.incidents[0], null, 2)}
                  </pre>
                </div>
              </div>
            )}
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