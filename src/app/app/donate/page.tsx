'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, where, getDocs, startAt, endAt, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { BloodRequest } from '@/lib/types';
import { HeartHandshake, LifeBuoy, Loader2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as geofire from 'geofire-common';

type RequestWithDistance = BloodRequest & { distance?: number };

export default function DonatePage() {
  const firestore = useFirestore();
  const { user: currentUser, isUserLoading } = useUser();
  const { toast } = useToast();
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [activeRequests, setActiveRequests] = useState<RequestWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [donating, setDonating] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
        },
        (err) => {
          setLocationError(`Error: ${err.message}`);
          toast({ variant: 'destructive', title: "Location Error", description: "Could not get location. Showing all requests." });
          fetchRequests();
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      fetchRequests();
    }
  }, [toast]);
  
  const fetchRequests = async (center?: geofire.Geopoint) => {
      setIsLoading(true);
      const requestsCollection = collection(firestore, 'bloodRequests');
      const radiusInM = 100 * 1000; // 100 km

      let finalQuery = query(requestsCollection, where('status', '==', 'Pending'));
      
      const promises = [];
      if (center) {
          const bounds = geofire.geohashQueryBounds(center, radiusInM);
          for (const b of bounds) {
            const q = query(
              requestsCollection,
              where('status', '==', 'Pending'),
              orderBy('geohash'),
              startAt(b[0]),
              endAt(b[1])
            );
            promises.push(getDocs(q));
          }
      } else {
          promises.push(getDocs(finalQuery));
      }

      try {
        const snapshots = await Promise.all(promises);
        let matchingDocs: RequestWithDistance[] = [];
        snapshots.forEach((snap) => {
            snap.forEach((doc) => {
                const data = doc.data() as BloodRequest;
                if(data.userId === currentUser?.uid) return; // Don't show user's own requests
                
                if (center && data.lat && data.lng) {
                    const distanceInKm = geofire.distanceBetween([data.lat, data.lng], center);
                    const distanceInM = distanceInKm * 1000;
                    if (distanceInM <= radiusInM) {
                        matchingDocs.push({ ...data, id: doc.id, distance: distanceInKm });
                    }
                } else if (!center) {
                     matchingDocs.push({ ...data, id: doc.id });
                }
            });
        });
        
        if (center) {
            matchingDocs.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        } else {
            matchingDocs.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        }

        setActiveRequests(matchingDocs);

      } catch (err: any) {
        console.error("Error fetching requests:", err);
        toast({
          variant: 'destructive',
          title: 'Error finding requests',
          description: err.message
        });
      } finally {
        setIsLoading(false);
      }
  };
  
  useEffect(() => {
    if(!firestore || isUserLoading) return;
    if (location) {
        fetchRequests([location.latitude, location.longitude]);
    } else if (locationError) { 
        fetchRequests();
    }
  }, [location, firestore, locationError, isUserLoading]);


  const handleOfferDonation = (request: BloodRequest) => {
    if (!currentUser || !firestore) return;
    
    setDonating(request.id);

    // 1. Create a DonationMatch document
    const matchCollection = collection(firestore, 'donationMatches');
    const newMatch = {
        requestId: request.id,
        requestUserId: request.userId,
        donorId: currentUser.uid,
        donorName: `${currentUser.displayName || 'Anonymous Donor'}`,
        donorBloodType: 'Unknown', // In a real app, get this from donor's profile
        donorLocation: 'Unknown', // and this
        matchDate: serverTimestamp(),
        status: 'pending',
    };
    
    // 2. Create a notification for the patient
    const patientNotifCollection = collection(firestore, 'users', request.userId, 'notifications');
    const newNotification = {
        userId: request.userId,
        message: `A donor has offered to fulfill your request for ${request.bloodType} blood.`,
        type: 'request_match',
        relatedId: request.id,
        isRead: false,
        createdAt: serverTimestamp(),
    };

    try {
        addDocumentNonBlocking(matchCollection, newMatch);
        addDocumentNonBlocking(patientNotifCollection, newNotification);

        toast({
            title: "Offer Sent!",
            description: `The patient has been notified of your offer.`
        });
    } catch(err) {
        console.error("Error offering donation: ", err);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not send your donation offer."
        })
    } finally {
        setDonating(null);
    }
  }

  const showLoading = isLoading || isUserLoading || (!location && !locationError);

  return (
    <div className="space-y-6">
       <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Become a Donor</h2>
            <p className="text-muted-foreground">Find active blood requests and save a life today. Your donation is a gift of hope.</p>
        </div>

      {showLoading && !locationError && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-card rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Fetching your location & nearby requests...</span>
          </div>
      )}
       {locationError && (
          <div className="flex items-center gap-2 text-sm text-destructive p-4 bg-card rounded-lg">
            <MapPin className="h-4 w-4" />
            <span>{locationError} Showing all active requests.</span>
          </div>
       )}

      <div className="space-y-4">
        <h3 className="font-headline text-xl font-semibold">Active Requests {location && '(within 100km)'}</h3>
        {showLoading && (
           <div className="space-y-4">
             <Skeleton className="h-28 w-full" />
             <Skeleton className="h-28 w-full" />
             <Skeleton className="h-28 w-full" />
           </div>
        )}
        {!showLoading && activeRequests && activeRequests.length > 0 ? (
          activeRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-2xl text-primary">
                      {request.bloodType.slice(0, -1)}
                    </span>
                    <span className="text-sm text-primary">
                      {request.bloodType.slice(-1)}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-2 flex-wrap">
                    {request.patientName} 
                    <Badge variant={request.urgency === 'High' ? 'destructive' : 'secondary'}>{request.urgency} Urgency</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3"/>
                    {request.location}
                    {request.distance && ` (${request.distance.toFixed(1)} km away)`}
                  </p>
                   <p className="text-xs text-muted-foreground mt-1">
                    Posted on: {request.createdAt.toDate().toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" onClick={() => handleOfferDonation(request)} disabled={donating === request.id}>
                    {donating === request.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HeartHandshake className="mr-2 h-4 w-4"/>}
                    Donate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
           !showLoading && <div className="text-center py-10 bg-card rounded-lg border">
                <LifeBuoy className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-semibold">No Active Requests Nearby</p>
                <p className="text-muted-foreground mt-2">
                  There are no pending blood requests in your area right now. Thank you for your willingness to help!
                </p>
          </div>
        )}
      </div>
    </div>
  );
}
