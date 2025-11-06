'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import * as geofire from 'geofire-common';

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
import { useUser, useFirestore } from '@/firebase';
import { collection, serverTimestamp, addDoc } from 'firebase/firestore';

const formSchema = z.object({
  patientName: z.string().min(2, {
    message: 'Patient name must be at least 2 characters.',
  }),
  bloodType: z.string().min(1, { message: 'Please select a blood type' }),
  location: z.string().min(2, { message: 'Location is required' }),
  urgency: z.enum(['Low', 'Medium', 'High']),
  contactPerson: z.string().min(2, { message: 'Contact person is required' }),
  contactPhone: z.string().min(10, { message: 'A valid phone number is required'}),
  contactEmail: z.string().email({ message: 'A valid email is required' }),
  notes: z.string().optional(),
});

export default function RequestBloodPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      bloodType: '',
      location: '',
      urgency: 'Medium',
      contactPerson: '',
      contactPhone: '',
      contactEmail: user?.email || '',
      notes: '',
    },
  });

   useEffect(() => {
    if (user?.email) {
      form.setValue('contactEmail', user.email);
    }
   }, [user, form]);

  const handleFetchLocation = () => {
    if (navigator.geolocation) {
      setIsLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            setUserCoords({ lat: latitude, lon: longitude });
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            if (data.address) {
              const { road, suburb, city, town, state, postcode } = data.address;
              const locationParts = [road, suburb, city || town, state, postcode];
              const locationString = locationParts.filter(Boolean).join(', ');
              if (locationString) {
                form.setValue('location', locationString);
              }
            }
          } catch (error) {
            console.error('Error fetching location name:', error);
            toast({
              variant: 'destructive',
              title: 'Could not fetch location name',
              description: 'Please enter your location manually.',
            });
          } finally {
            setIsLocationLoading(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            variant: 'destructive',
            title: 'Location permission denied',
            description: 'Please enable location services or enter your location manually.',
          });
          setIsLocationLoading(false);
        }
      );
    } else {
       toast({
        variant: 'destructive',
        title: 'Location Not Supported',
        description: 'Geolocation is not supported by this browser.',
      });
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Authenticated',
        description: 'You must be logged in to make a request.',
      });
      return;
    }
    if (!firestore) return;
    setIsLoading(true);

    const requestsCollection = collection(firestore, 'bloodRequests');
    const newRequest: any = {
      ...values,
      userId: user.uid,
      status: 'Pending',
      createdAt: serverTimestamp(),
    };
    
    if (userCoords) {
      newRequest.lat = userCoords.lat;
      newRequest.lng = userCoords.lon;
      newRequest.geohash = geofire.geohashForLocation([userCoords.lat, userCoords.lon]);
    }

    try {
      await addDoc(requestsCollection, newRequest);
      toast({
        title: 'Request Submitted',
        description: 'Your blood request has been broadcasted. You will be notified when a donor responds.',
      });
      form.reset();
       if (user?.email) {
        form.setValue('contactEmail', user.email);
       }
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
  
  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">Request Blood</h2>
      <Card>
        <CardHeader>
          <CardTitle>Create a New Blood Request</CardTitle>
          <CardDescription>
            Fill out the form below to find a donor. Your request will be sent to
            donors, and you will be notified when a match is found.
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
                        <Input placeholder="e.g., Priya Patel" {...field} />
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
                          <div className="relative">
                            <Input placeholder="e.g., Apollo Hospital, Delhi" {...field} className="pr-10" />
                            <button
                              type="button"
                              onClick={handleFetchLocation}
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-primary transition-colors"
                              aria-label="Get current location"
                              disabled={isLocationLoading}
                            >
                              {isLocationLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MapPin className="h-4 w-4" />
                              )}
                            </button>
                          </div>
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
                        <Input placeholder="e.g., Rohan Sharma" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              <Button type="submit" disabled={isLoading || isLocationLoading} className="bg-accent text-accent-foreground hover:bg-accent/90">
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
