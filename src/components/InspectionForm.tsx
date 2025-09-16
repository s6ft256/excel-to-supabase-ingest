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

const inspectionSchema = z.object({
  date: z.date({
    required_error: "Inspection date is required.",
  }),
  type: z.string().min(1, "Inspection type is required"),
  score: z.number().min(0).max(100),
  inspector: z.string().min(1, "Inspector name is required"),
});

type InspectionFormData = z.infer<typeof inspectionSchema>;

const InspectionForm = () => {
  const { toast } = useToast();
  const form = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      score: 85,
    },
  });

  const onSubmit = async (data: InspectionFormData) => {
    try {
      const { error } = await supabase.from('inspections').insert({
        date: data.date.toISOString().split('T')[0],
        type: data.type,
        score: data.score,
        inspector: data.inspector,
      });

      if (error) throw error;

      toast({
        title: "Inspection Recorded",
        description: "The inspection has been successfully recorded.",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit inspection record",
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
              <FormLabel>Inspection Date</FormLabel>
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
              <FormLabel>Inspection Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select inspection type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Weekly Safety Inspection">Weekly Safety Inspection</SelectItem>
                  <SelectItem value="Monthly Audit">Monthly Audit</SelectItem>
                  <SelectItem value="Annual Compliance Review">Annual Compliance Review</SelectItem>
                  <SelectItem value="Emergency Preparedness Check">Emergency Preparedness Check</SelectItem>
                  <SelectItem value="Equipment Safety Check">Equipment Safety Check</SelectItem>
                  <SelectItem value="Environmental Assessment">Environmental Assessment</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Score (0-100)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  placeholder="Enter inspection score"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inspector"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inspector</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select inspector" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="HSE Manager">HSE Manager</SelectItem>
                  <SelectItem value="Safety Officer">Safety Officer</SelectItem>
                  <SelectItem value="External Auditor">External Auditor</SelectItem>
                  <SelectItem value="Site Supervisor">Site Supervisor</SelectItem>
                  <SelectItem value="Environmental Specialist">Environmental Specialist</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting...' : 'Submit Inspection Record'}
        </Button>
      </form>
    </Form>
  );
};

export default InspectionForm;