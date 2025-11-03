'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useFirestore,
  useMemoFirebase,
  useUser,
  useDoc,
} from '@/firebase';
import {
  collection,
  query,
  getDocs,
  startAt,
  endAt,
  serverTimestamp,
  doc,
  addDoc,
  where,
} from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { BloodRequest, User, Notification } from '@/lib/types';
import { HeartHandshake, LifeBuoy, Loader2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as geofire from 'geofire-common';

type RequestWithDistance = BloodRequest & { distance?: number };

async function sendSmsNotification(to: string, body: string) {
    const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, body }),
    });
    return response;
}


export default function DonatePage() {
  const firestore = useFirestore();
  const { user: currentUser, isUserLoading } = useUser();
  const { toast } = useToast();
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [activeRequests, setActiveRequests] = useState<RequestWithDistance[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [donating, setDonating] = useState<string | null>(null);

  const userDocRef = useMemoFirebase(
    () => (currentUser ? doc(firestore, 'users', currentUser.uid) : null),
    [firestore, currentUser]
  );
  const { data: currentUserData, isLoading: isUserDataLoading } =
    useDoc<User>(userDocRef);

  useEffect(() => {
    // This effect runs only on the client, preventing a hydration mismatch.
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
          toast({
            variant: 'destructive',
            title: 'Location Error',
            description: 'Could not get location. Showing all requests.',
          });
          fetchRequests(); // Fetch all requests if location fails
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      fetchRequests(); // Fetch all requests if geolocation is not supported
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const fetchRequests = async (center?: geofire.Geopoint) => {
    if (!firestore) return;
    setIsLoading(true);
    const requestsCollection = collection(firestore, 'bloodRequests');
    const radiusInM = 100 * 1000; // 100 km

    let finalQuery = query(
      requestsCollection,
      where('status', '==', 'Pending')
    );

    const promises = [];
    if (center) {
      const bounds = geofire.geohashQueryBounds(center, radiusInM);
      for (const b of bounds) {
        const q = query(
          requestsCollection,
          where('status', '==', 'Pending'),
          where('geohash', '>=', b[0]),
          where('geohash', '<=', b[1])
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
          if (data.userId === currentUser?.uid) return; // Don't show user's own requests

          if (center && data.lat && data.lng) {
            const distanceInKm = geofire.distanceBetween(
              [data.lat, data.lng],
              center
            );
            const distanceInM = distanceInKm * 1000;
            if (distanceInM <= radiusInM) {
              matchingDocs.push({
                ...data,
                id: doc.id,
                distance: distanceInKm,
              });
            }
          } else if (!center) {
            matchingDocs.push({ ...data, id: doc.id });
          }
        });
      });

      if (center) {
        matchingDocs.sort(
          (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)
        );
      } else {
        matchingDocs.sort(
          (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
        );
      }

      setActiveRequests(matchingDocs);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      toast({
        variant: 'destructive',
        title: 'Error finding requests',
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!firestore || isUserLoading) return;
    if (location) {
      fetchRequests([location.latitude, location.longitude]);
    } else if (locationError) {
      fetchRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, firestore, locationError, isUserLoading, currentUser]);

  const handleOfferDonation = async (request: BloodRequest) => {
    if (!currentUser || !firestore || !currentUserData) return;

    setDonating(request.id);

    try {
      // 1. Create a match document so the patient can see the offer
      const matchCollection = collection(firestore, 'donationMatches');
      const newMatch = {
        requestId: request.id,
        requestUserId: request.userId,
        donorId: currentUser.uid,
        donorName: `${currentUserData.firstName} ${currentUserData.lastName}`,
        donorBloodType: currentUserData.bloodType,
        donorLocation: currentUserData.location,
        donorEmail: currentUserData.email,
        donorPhoneNumber: currentUserData.phoneNumber || 'Not provided',
        matchDate: serverTimestamp(),
        status: 'pending',
      };
      await addDoc(matchCollection, newMatch);

      // 2. Create an in-app notification for the patient
      const notificationCollection = collection(firestore, 'notifications');
      const newNotification: Omit<Notification, 'id'> = {
        userId: request.userId,
        message: `A donor (${currentUserData.firstName}, Blood Type: ${currentUserData.bloodType}) has offered to fulfill your request for ${request.bloodType} blood.`,
        type: 'request_match',
        relatedId: request.id,
        isRead: false,
        createdAt: serverTimestamp(),
      };
      await addDoc(notificationCollection, newNotification);

      // 3. Send an SMS notification
      const smsBody = `BloodSync: New donation offer! A donor (${currentUserData.firstName}, Blood Type: ${currentUserData.bloodType}) has offered to help. Log in to your account to accept.`;
      const smsResponse = await sendSmsNotification(request.contactPhone, smsBody);

      if (!smsResponse.ok) {
          throw new Error('Failed to send SMS notification.');
      }

      toast({
        title: 'Offer Sent!',
        description: `The patient has been notified of your offer.`,
      });
    } catch (err: any) {
      console.error('Error offering donation: ', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Could not send your donation offer.',
      });
    } finally {
      setDonating(null);
    }
  };

  const showLoading =
    isLoading || isUserLoading || isUserDataLoading || (!location && !locationError);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Become a Donor
        </h2>
        <p className="text-muted-foreground">
          Find active blood requests and save a life today. Your donation is a
          gift of hope.
        </p>
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
        <h3 className="font-headline text-xl font-semibold">
          Active Requests {location && '(within 100km)'}
        </h3>
        {showLoading && (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        )}
        {!showLoading && activeRequests && activeRequests.length > 0 ? (
          activeRequests.map((request) => (
            <Card
              key={request.id}
              className="hover:shadow-md transition-shadow"
            >
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
                    <Badge
                      variant={
                        request.urgency === 'High' ? 'destructive' : 'secondary'
                      }
                    >
                      {request.urgency} Urgency
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {request.location}
                    {request.distance &&
                      ` (${request.distance.toFixed(1)} km away)`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Posted on: {request.createdAt.toDate().toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleOfferDonation(request)}
                    disabled={donating === request.id}
                  >
                    {donating === request.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <HeartHandshake className="mr-2 h-4 w-4" />
                    )}
                    Donate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          !showLoading && (
            <div className="text-center py-10 bg-card rounded-lg border">
              <LifeBuoy className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-semibold">
                No Active Requests Nearby
              </p>
              <p className="text-muted-foreground mt-2">
                There are no pending blood requests in your area right now.
                Thank you for your willingness to help!
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
