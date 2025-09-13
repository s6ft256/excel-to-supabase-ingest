import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateSQLInserts } from '@/utils/excelParser';
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
      // Split SQL statements and execute them individually
      const statements = sqlStatements
        .split(';\n')
        .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'))
        .map(stmt => stmt.trim());

      for (const statement of statements) {
        if (statement) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.error('SQL Error:', error);
            // Continue with other statements even if one fails
          }
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