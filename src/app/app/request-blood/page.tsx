'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { bloodTypes } from '@/lib/types';
import { useAuth, useFirestore, addDocumentNonBlocking, useUser } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

const formSchema = z.object({
  patientName: z.string().min(2, {
    message: 'Patient name must be at least 2 characters.',
  }),
  bloodType: z.string().min(1, { message: 'Please select a blood type' }),
  location: z.string().min(2, { message: 'Location is required' }),
  urgency: z.enum(['Low', 'Medium', 'High']),
  contactPerson: z.string().min(2, { message: 'Contact person is required' }),
  contactPhone: z.string().min(10, { message: 'A valid phone number is required'}),
  notes: z.string().optional(),
});

export default function RequestBloodPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      bloodType: '',
      location: '',
      urgency: 'Medium',
      contactPerson: '',
      contactPhone: '',
      notes: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Authenticated',
        description: 'You must be logged in to make a request.',
      });
      return;
    }
    setIsLoading(true);

    const requestsCollection = collection(firestore, 'bloodRequests');
    const newRequest = {
      ...values,
      userId: user.uid,
      status: 'Pending',
      createdAt: serverTimestamp(),
    };

    try {
      addDocumentNonBlocking(requestsCollection, newRequest);
      toast({
        title: 'Request Submitted',
        description: 'Your blood request has been broadcasted to nearby donors.',
      });
      form.reset();
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">Request Blood</h2>
      <Card>
        <CardHeader>
          <CardTitle>Create a New Blood Request</CardTitle>
          <CardDescription>
            Fill out the form below to find a donor. Your request will be sent to
            all available donors in the specified area.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Jane Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bloodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Blood Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a blood type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bloodTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hospital/Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., City General Hospital" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency Level</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(123) 456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any other relevant information..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <Button type="submit" disabled={isLoading} className="bg-accent text-accent-foreground hover:bg-accent/90">
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
