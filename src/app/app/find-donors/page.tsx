'use client';

import { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';


export default function FindDonorsPage() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  // Get location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setLocationError(`Error: ${err.message}`);
          toast({ variant: 'destructive', title: "Location Error", description: err.message });
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, [toast]);
  
  // In a real app, you would use a geospatial query.
  // For this prototype, we'll just fetch all donors.
  const donorsCollection = useMemoFirebase(
    () => collection(firestore, 'users'),
    [firestore]
  );
  const donorsQuery = useMemoFirebase(
    () => query(donorsCollection, where('isDonor', '==', true)),
    [donorsCollection]
  );

  const { data: nearbyDonors, isLoading: isDonorsLoading } = useCollection<User>(donorsQuery);

  const isLoading = isDonorsLoading || (!location && !locationError);


  const handleRequest = (donorName: string) => {
    toast({
      title: 'Request Sent',
      description: `A notification has been sent to ${donorName}.`,
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">Find Nearby Donors</h2>
      <Card>
        <CardHeader>
          <CardTitle>Donors Near You</CardTitle>
          <CardDescription>
            We've automatically detected your location to find available blood donors near you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           {locationError && <p className="text-sm text-destructive">{locationError}</p>}
           {location && !isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                Showing donors. (In a real app these would be filtered by your location: Lat: {location.latitude.toFixed(2)}, Lon: {location.longitude.toFixed(2)})
              </span>
            </div>
           )}
           {isLoading && !locationError && (
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Fetching your location & nearby donors...</span>
             </div>
           )}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
             <Card key={i}>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-[120px]" />
                </CardContent>
              </Card>
          ))}
        </div>
      )}

      {!isLoading && nearbyDonors && nearbyDonors.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold tracking-tight mb-4 font-headline">Available Donors</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {nearbyDonors.map((donor) => (
              <Card key={donor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/50">
                    <AvatarImage src={donor.avatarUrl} alt={`${donor.firstName} ${donor.lastName}`} />
                    <AvatarFallback>{donor.firstName[0]}{donor.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{donor.firstName} {donor.lastName}</CardTitle>
                    <CardDescription>{donor.location}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-2xl text-primary">{donor.bloodType}</span>
                    <Badge variant={donor.availability === 'Available' ? 'default' : 'secondary'} className={donor.availability === 'Available' ? 'bg-green-600' : ''}>{donor.availability}</Badge>
                  </div>
                   <p className="text-sm text-muted-foreground">Last donation: {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'N/A'}</p>
                  <Button onClick={() => handleRequest(`${donor.firstName} ${donor.lastName}`)} disabled={donor.availability !== 'Available'} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Request Donation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!isLoading && (!nearbyDonors || nearbyDonors.length === 0) && (
         <div className="text-center py-10 bg-card rounded-lg border">
            <p className="text-lg font-semibold">No Donors Found</p>
            <p className="text-muted-foreground mt-2">No donors were found. Please try again later.</p>
         </div>
      )}
    </div>
  );
}
