'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser,
  useDoc,
} from '@/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  addDoc,
} from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { BloodRequest, User, Notification } from '@/lib/types';
import { LifeBuoy, Share, HeartHandshake, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function OverviewPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [donating, setDonating] = useState<string | null>(null);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: currentUserData, isLoading: isUserDataLoading } =
    useDoc<User>(userDocRef);

  const requestsCollection = useMemoFirebase(
    () => collection(firestore, 'bloodRequests'),
    [firestore]
  );
  const recentRequestsQuery = useMemoFirebase(
    () =>
      requestsCollection
        ? query(requestsCollection, orderBy('createdAt', 'desc'), limit(5))
        : null,
    [requestsCollection]
  );
  const { data: recentRequests, isLoading: isRequestsLoading } =
    useCollection<BloodRequest>(recentRequestsQuery);

  const handleShare = (request: BloodRequest) => {
    const shareText = `A patient needs your help! Blood type: ${request.bloodType}, Location: ${request.location}. Please help if you can.`;
    navigator.clipboard.writeText(shareText);
    toast({
      title: 'Copied to Clipboard!',
      description: 'You can now share this request with others.',
    });
  };

  const handleAccept = async (request: BloodRequest) => {
    if (!user || !firestore || !currentUserData) return;

    if (user.uid === request.userId) {
      toast({
        variant: 'destructive',
        title: 'Cannot Donate to Yourself',
        description: 'You cannot accept your own blood request.',
      });
      return;
    }

    setDonating(request.id);

    try {
      // 1. Create a match document so the patient can see the offer
      const matchCollection = collection(firestore, 'donationMatches');
      const newMatch = {
        requestId: request.id,
        requestUserId: request.userId,
        donorId: user.uid,
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

      // 3. Send a simulated Push notification
      const pushMessage = `Good news! A donor (${currentUserData.firstName}, Blood Type: ${currentUserData.bloodType}) has offered to fulfill your blood request. Please check the BloodSync app for details.`;
      await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientUserId: request.userId,
          message: pushMessage,
        }),
      });

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

  const isLoading = isRequestsLoading || isUserLoading || isUserDataLoading;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-primary text-primary-foreground">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold">Donate Blood, Save Lives</h2>
          <p className="mt-2 text-sm">
            Your donation can save up to 3 lives. Be a hero today.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-headline text-xl font-semibold">Recent Requests</h3>
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}
        {!isLoading && recentRequests && recentRequests.length > 0 ? (
          recentRequests.map((request) => (
            <Card key={request.id}>
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
                  <div className="font-semibold flex items-center gap-2">
                    <Badge
                      variant={
                        request.urgency === 'High' ? 'destructive' : 'secondary'
                      }
                    >
                      {request.urgency}
                    </Badge>{' '}
                    Urgency
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {request.location}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Posted by {request.patientName} on{' '}
                    {request.createdAt.toDate().toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleShare(request)}
                  >
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAccept(request)}
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
          !isLoading && (
            <div className="text-center py-10 bg-card rounded-lg border">
              <LifeBuoy className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-semibold">No Active Requests</p>
              <p className="text-muted-foreground mt-2">
                No active blood requests right now. Check back later!
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
