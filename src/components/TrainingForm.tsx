import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const trainingSchema = z.object({
  date: z.date({
    required_error: "Training date is required.",
  }),
  topic: z.string().min(1, "Training topic is required"),
  type: z.enum(['internal', 'external']),
  no_of_attendees: z.number().min(1, "Number of attendees must be at least 1"),
  conductor: z.string().min(1, "Conductor name is required"),
});

type TrainingFormData = z.infer<typeof trainingSchema>;

const TrainingForm = () => {
  const { toast } = useToast();
  const form = useForm<TrainingFormData>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      no_of_attendees: 10,
      type: 'internal',
    },
  });

  const onSubmit = async (data: TrainingFormData) => {
    try {
      const { error } = await supabase.from('training_sessions').insert({
        date: data.date.toISOString().split('T')[0],
        topic: data.topic,
        type: data.type,
        no_of_attendees: data.no_of_attendees,
        conductor: data.conductor,
      });

      if (error) throw error;

      toast({
        title: "Training Session Recorded",
        description: "The training session has been successfully recorded.",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit training record",
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
              <FormLabel>Training Date</FormLabel>
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
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Training Topic</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select training topic" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Hand Tool Safety">Hand Tool Safety</SelectItem>
                  <SelectItem value="Emergency Response Procedures">Emergency Response Procedures</SelectItem>
                  <SelectItem value="Manual Handling Techniques">Manual Handling Techniques</SelectItem>
                  <SelectItem value="Fire Safety">Fire Safety</SelectItem>
                  <SelectItem value="Chemical Safety">Chemical Safety</SelectItem>
                  <SelectItem value="Working at Height">Working at Height</SelectItem>
                  <SelectItem value="Personal Protective Equipment">Personal Protective Equipment</SelectItem>
                  <SelectItem value="Environmental Awareness">Environmental Awareness</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Training Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select training type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="no_of_attendees"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Attendees</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  placeholder="Enter number of attendees"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="conductor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conductor</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select conductor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Safety Officer">Safety Officer</SelectItem>
                  <SelectItem value="HSE Manager">HSE Manager</SelectItem>
                  <SelectItem value="Fire Safety Consultant">Fire Safety Consultant</SelectItem>
                  <SelectItem value="Occupational Health Specialist">Occupational Health Specialist</SelectItem>
                  <SelectItem value="External Training Provider">External Training Provider</SelectItem>
                  <SelectItem value="Site Supervisor">Site Supervisor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting...' : 'Submit Training Record'}
        </Button>
      </form>
    </Form>
  );
};

export default TrainingForm;