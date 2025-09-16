import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChartData {
  incidentsByType: Array<{ name: string; value: number }>;
  incidentsBySeverity: Array<{ name: string; value: number }>;
  inspectionScores: Array<{ date: string; score: number }>;
  trainingAttendance: Array<{ topic: string; attendees: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ReportsCharts = () => {
  const [chartData, setChartData] = useState<ChartData>({
    incidentsByType: [],
    incidentsBySeverity: [],
    inspectionScores: [],
    trainingAttendance: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      // Fetch incidents data
      const { data: incidents, error: incidentsError } = await supabase
        .from('incidents')
        .select('type, severity_level');

      if (incidentsError) throw incidentsError;

      // Fetch inspections data
      const { data: inspections, error: inspectionsError } = await supabase
        .from('inspections')
        .select('date, score')
        .order('date', { ascending: true });

      if (inspectionsError) throw inspectionsError;

      // Fetch training data
      const { data: trainingSessions, error: trainingError } = await supabase
        .from('training_sessions')
        .select('topic, no_of_attendees');

      if (trainingError) throw trainingError;

      // Process incidents by type
      const incidentTypeCount = incidents?.reduce((acc: any, incident) => {
        acc[incident.type] = (acc[incident.type] || 0) + 1;
        return acc;
      }, {});

      const incidentsByType = Object.entries(incidentTypeCount || {}).map(([name, value]) => ({
        name,
        value: value as number,
      }));

      // Process incidents by severity
      const severityCount = incidents?.reduce((acc: any, incident) => {
        const severity = `Level ${incident.severity_level}`;
        acc[severity] = (acc[severity] || 0) + 1;
        return acc;
      }, {});

      const incidentsBySeverity = Object.entries(severityCount || {}).map(([name, value]) => ({
        name,
        value: value as number,
      }));

      // Process inspection scores
      const inspectionScores = inspections?.map(inspection => ({
        date: new Date(inspection.date).toLocaleDateString(),
        score: inspection.score || 0,
      })) || [];

      // Process training attendance
      const trainingAttendance = trainingSessions?.map(session => ({
        topic: session.topic || 'Unknown',
        attendees: session.no_of_attendees || 0,
      })) || [];

      setChartData({
        incidentsByType,
        incidentsBySeverity,
        inspectionScores,
        trainingAttendance,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch chart data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
        <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Incidents by Type</CardTitle>
          <CardDescription>Distribution of incident types</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData.incidentsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.incidentsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Incidents by Severity</CardTitle>
          <CardDescription>Breakdown of incident severity levels</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.incidentsBySeverity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inspection Scores Over Time</CardTitle>
          <CardDescription>Trend of inspection scores</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData.inspectionScores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training Session Attendance</CardTitle>
          <CardDescription>Number of attendees by training topic</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.trainingAttendance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="attendees" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsCharts;