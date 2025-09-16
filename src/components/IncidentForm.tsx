import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const incidentSchema = z.object({
  date: z.date({
    required_error: "Incident date is required.",
  }),
  type: z.string().min(1, "Incident type is required"),
  severity_level: z.number().min(1).max(5),
  description: z.string().min(10, "Description must be at least 10 characters"),
  activity: z.string().min(1, "Activity is required"),
  contractor_id: z.string().optional(),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

const IncidentForm = () => {
  const { toast } = useToast();
  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      severity_level: 1,
    },
  });

  const onSubmit = async (data: IncidentFormData) => {
    try {
      const { error } = await supabase.from('incidents').insert({
        date: data.date.toISOString().split('T')[0],
        type: data.type,
        severity_level: data.severity_level,
        description: data.description,
        activity: data.activity,
        contractor_id: data.contractor_id || null,
      });

      if (error) throw error;

      toast({
        title: "Incident Reported",
        description: "The incident has been successfully recorded.",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit incident report",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Incident Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Incident Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Near Miss">Near Miss</SelectItem>
                  <SelectItem value="First Aid Case">First Aid Case</SelectItem>
                  <SelectItem value="Medical Treatment Case">Medical Treatment Case</SelectItem>
                  <SelectItem value="Lost Time Injury">Lost Time Injury</SelectItem>
                  <SelectItem value="Fatality">Fatality</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="severity_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Severity Level (1-5)</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 - Minor</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Critical</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activity</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Hand / Power Tools use">Hand / Power Tools use</SelectItem>
                  <SelectItem value="Manual Handling">Manual Handling</SelectItem>
                  <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                  <SelectItem value="Environmental Conditions">Environmental Conditions</SelectItem>
                  <SelectItem value="Vehicle Operation">Vehicle Operation</SelectItem>
                  <SelectItem value="Working at Height">Working at Height</SelectItem>
                  <SelectItem value="Chemical Handling">Chemical Handling</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe the incident in detail..."
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contractor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contractor (Optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter contractor ID or company name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting...' : 'Submit Incident Report'}
        </Button>
      </form>
    </Form>
  );
};

export default IncidentForm;