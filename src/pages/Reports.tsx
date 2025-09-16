import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import IncidentForm from '@/components/IncidentForm';
import InspectionForm from '@/components/InspectionForm';
import TrainingForm from '@/components/TrainingForm';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Reports = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">HSE Reports</h1>
            <p className="text-muted-foreground">Create new reports and view analytics</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Forms</CardTitle>
            <CardDescription>
              Create new incident reports, inspection records, and training sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="incident" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="incident">Incidents</TabsTrigger>
                <TabsTrigger value="inspection">Inspections</TabsTrigger>
                <TabsTrigger value="training">Training</TabsTrigger>
              </TabsList>
              
              <TabsContent value="incident" className="mt-6">
                <IncidentForm />
              </TabsContent>
              
              <TabsContent value="inspection" className="mt-6">
                <InspectionForm />
              </TabsContent>
              
              <TabsContent value="training" className="mt-6">
                <TrainingForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;