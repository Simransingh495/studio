'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { BrainCircuit, Loader2, Send, UserCheck } from 'lucide-react';

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
import { useToast } from '@/hooks/use-toast';
import { bloodTypes } from '@/lib/types';
import { findSmartMatch } from '@/app/actions';
import type { SmartBloodMatchOutput } from '@/ai/flows/smart-blood-match';
import { users } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  patientBloodType: z.string().min(1, { message: 'Please select a blood type' }),
  patientLocation: z.string().min(2, { message: 'Location is required' }),
});

export default function SmartMatchPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SmartBloodMatchOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientBloodType: '',
      patientLocation: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResults(null);

    const response = await findSmartMatch(
      values.patientBloodType,
      values.patientLocation
    );

    setLoading(false);
    if (response.success && response.data) {
      setResults(response.data);
      toast({
        title: 'Match Found!',
        description: 'AI has suggested the best donors for your request.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.error,
      });
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="font-headline text-3xl font-bold tracking-tight">
        AI-Powered Smart Match
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Find the Perfect Donor</CardTitle>
          <CardDescription>
            In critical situations, let our AI find the most suitable donors based
            on compatibility, location, and availability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col sm:flex-row gap-4 items-end"
            >
              <FormField
                control={form.control}
                name="patientBloodType"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-auto flex-1">
                    <FormLabel>Patient Blood Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood type" />
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
                name="patientLocation"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-auto flex-1">
                    <FormLabel>Patient Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Delhi, IN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BrainCircuit className="mr-2 h-4 w-4" />
                )}
                Find Matches
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {loading && (
         <div className="text-center p-8">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">AI is analyzing potential donors...</p>
        </div>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Suggested Donors</CardTitle>
            <CardDescription>
              Based on the provided information, here are the top recommended donors.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {results.suggestedDonors.length === 0 ? (
                <Alert>
                  <BrainCircuit className="h-4 w-4" />
                  <AlertTitle>No Optimal Matches Found</AlertTitle>
                  <AlertDescription>
                    The AI could not find any suitable donors based on the strict criteria. You may want to broaden your search or check again later.
                  </AlertDescription>
                </Alert>
             ) : (
                results.suggestedDonors.map(({ donorId, reason }) => {
                const donor = users.find((u) => u.id === donorId);
                if (!donor) return null;
                return (
                  <Card key={donorId} className="bg-secondary/50">
                    <CardHeader className="flex flex-row items-start gap-4">
                         <Avatar className="h-12 w-12 border-2 border-primary">
                            <AvatarImage src={donor.avatarUrl} alt={donor.name} />
                            <AvatarFallback>{donor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-lg">{donor.name}</CardTitle>
                                    <CardDescription>{donor.location} &bull; Blood Type: {donor.bloodType}</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => toast({ title: `Notification sent to ${donor.name}`})}>
                                    <Send className="mr-2 h-4 w-4"/>
                                    Contact
                                </Button>
                            </div>
                            <Alert className="mt-4">
                                <UserCheck className="h-4 w-4" />
                                <AlertTitle>AI Recommendation</AlertTitle>
                                <AlertDescription>{reason}</AlertDescription>
                            </Alert>
                        </div>
                    </CardHeader>
                  </Card>
                );
              })
             )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
