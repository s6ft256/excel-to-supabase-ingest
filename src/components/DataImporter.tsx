import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateSQLInserts, parseExcelData } from '@/utils/excelParser';
import { supabase } from '@/integrations/supabase/client';

const DataImporter = () => {
  const [sqlStatements, setSqlStatements] = useState('');
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleGenerateSQL = () => {
    const sql = generateSQLInserts();
    setSqlStatements(sql);
    toast({
      title: "SQL Generated",
      description: "SQL INSERT statements have been generated from the Excel data.",
    });
  };

  const handleImportData = async () => {
    if (!sqlStatements) {
      toast({
        title: "Error",
        description: "No SQL statements to execute. Generate SQL first.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    try {
      // Get parsed data directly from the excel parser
      const parsedData = parseExcelData();
      
      // Insert incidents
      if (parsedData.incidents.length > 0) {
        const { error: incidentsError } = await supabase
          .from('incidents')
          .insert(parsedData.incidents);
        
        if (incidentsError) {
          console.error('Error inserting incidents:', incidentsError);
        }
      }

      // Insert incident details
      if (parsedData.incident_details.length > 0) {
        const { error: detailsError } = await supabase
          .from('incident_details')
          .insert(parsedData.incident_details);
        
        if (detailsError) {
          console.error('Error inserting incident details:', detailsError);
        }
      }

      // Insert training sessions
      if (parsedData.training_sessions.length > 0) {
        const { error: trainingError } = await supabase
          .from('training_sessions')
          .insert(parsedData.training_sessions);
        
        if (trainingError) {
          console.error('Error inserting training sessions:', trainingError);
        }
      }

      // Insert inspections
      if (parsedData.inspections.length > 0) {
        const { error: inspectionsError } = await supabase
          .from('inspections')
          .insert(parsedData.inspections);
        
        if (inspectionsError) {
          console.error('Error inserting inspections:', inspectionsError);
        }
      }

      toast({
        title: "Import Complete",
        description: "Data has been imported successfully. Refresh the dashboard to see the new data.",
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import data",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Excel Data Importer</CardTitle>
        <CardDescription>
          Generate and execute SQL INSERT statements from the HSE Statistics Excel file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button onClick={handleGenerateSQL}>
            Generate SQL from Excel Data
          </Button>
          <Button 
            onClick={handleImportData} 
            disabled={!sqlStatements || importing}
            variant="default"
          >
            {importing ? 'Importing...' : 'Import Data to Database'}
          </Button>
        </div>
        
        {sqlStatements && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Generated SQL Statements:</label>
            <Textarea 
              value={sqlStatements}
              onChange={(e) => setSqlStatements(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="SQL statements will appear here..."
            />
            <p className="text-sm text-muted-foreground">
              You can review and modify the SQL statements above before importing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataImporter;