import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReportsCharts from '@/components/ReportsCharts';
import DataImporter from '@/components/DataImporter';

interface Incident {
  id: number;
  date: string;
  activity: string;
  description: string;
  severity_level: number;
  type: string;
  profiles?: {
    company: string;
    username: string;
  };
}

interface Inspection {
  id: number;
  date: string;
  score: number;
  type: string;
  inspector: string;
}

interface TrainingSession {
  id: number;
  date: string;
  topic: string;
  type: string;
  no_of_attendees: number;
  conductor: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch incidents with contractor info
      const { data: incidentsData, error: incidentsError } = await supabase
        .from('incidents')
        .select(`
          *,
          profiles:contractor_id (
            company,
            username
          )
        `)
        .order('date', { ascending: false });

      if (incidentsError) throw incidentsError;

      // Fetch inspections
      const { data: inspectionsData, error: inspectionsError } = await supabase
        .from('inspections')
        .select('*')
        .order('date', { ascending: false });

      if (inspectionsError) throw inspectionsError;

      // Fetch training sessions
      const { data: trainingData, error: trainingError } = await supabase
        .from('training_sessions')
        .select('*')
        .order('date', { ascending: false });

      if (trainingError) throw trainingError;

      setIncidents(incidentsData || []);
      setInspections(inspectionsData || []);
      setTrainingSessions(trainingData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const incidentColumns: ColumnDef<Incident>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString(),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("type")}</Badge>
      ),
    },
    {
      accessorKey: "activity",
      header: "Activity",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "severity_level",
      header: "Severity",
      cell: ({ row }) => {
        const severity = row.getValue("severity_level") as number;
        const variant = severity >= 4 ? "destructive" : severity >= 2 ? "default" : "secondary";
        return <Badge variant={variant}>Level {severity}</Badge>;
      },
    },
    {
      accessorKey: "profiles.company",
      header: "Contractor",
      cell: ({ row }) => row.original.profiles?.company || "N/A",
    },
  ];

  const inspectionColumns: ColumnDef<Inspection>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString(),
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ row }) => {
        const score = row.getValue("score") as number;
        const variant = score >= 90 ? "default" : score >= 70 ? "secondary" : "destructive";
        return <Badge variant={variant}>{score}%</Badge>;
      },
    },
    {
      accessorKey: "inspector",
      header: "Inspector",
    },
  ];

  const trainingColumns: ColumnDef<TrainingSession>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString(),
    },
    {
      accessorKey: "topic",
      header: "Topic",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.getValue("type") === "internal" ? "default" : "secondary"}>
          {row.getValue("type")}
        </Badge>
      ),
    },
    {
      accessorKey: "no_of_attendees",
      header: "Attendees",
    },
    {
      accessorKey: "conductor",
      header: "Conductor",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const totalIncidents = incidents.length;
  const highSeverityIncidents = incidents.filter(i => i.severity_level >= 4).length;
  const avgInspectionScore = inspections.length > 0 
    ? (inspections.reduce((sum, i) => sum + (i.score || 0), 0) / inspections.length).toFixed(1)
    : "0";
  const totalTrainingSessions = trainingSessions.length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">HSE Statistics Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link to="/reports">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.email}
            </span>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIncidents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">High Severity Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{highSeverityIncidents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Avg Inspection Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgInspectionScore}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Training Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrainingSessions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Excel Data Importer */}
        <div className="mb-8">
          <DataImporter key={`data-importer-${Date.now()}`} />
        </div>

        {/* Charts Section */}
        <ReportsCharts />

        {/* Data Tables */}
        <Tabs defaultValue="incidents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
          </TabsList>

          <TabsContent value="incidents">
            <Card>
              <CardHeader>
                <CardTitle>Incident Reports</CardTitle>
                <CardDescription>
                  Overview of all safety incidents and their details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable columns={incidentColumns} data={incidents} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inspections">
            <Card>
              <CardHeader>
                <CardTitle>Safety Inspections</CardTitle>
                <CardDescription>
                  Results from safety inspections and audits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable columns={inspectionColumns} data={inspections} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training">
            <Card>
              <CardHeader>
                <CardTitle>Training Sessions</CardTitle>
                <CardDescription>
                  Safety training and education programs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable columns={trainingColumns} data={trainingSessions} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;