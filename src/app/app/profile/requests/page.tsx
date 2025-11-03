'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from '@/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { BloodRequest, DonationMatch, Donation, Notification } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ClipboardList,
  Loader2,
  UserCheck,
  UserX,
  Phone,
  Mail,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { format } from 'date-fns';

export default function MyRequestsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [processingMatch, setProcessingMatch] = useState<string | null>(null);

  const requestsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'bloodRequests'),
            where('userId', '==', user.uid)
            // Removing orderBy to prevent Firestore internal assertion error
            // orderBy('createdAt', 'desc')
          )
        : null,
    [firestore, user]
  );
  const { data: requests, isLoading: isRequestsLoading } =
    useCollection<BloodRequest>(requestsQuery);

  // Sort requests on the client-side
  const sortedRequests = useMemo(() => {
    if (!requests) return [];
    return [...requests].sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
  }, [requests]);

  const requestIds = useMemo(
    () => (sortedRequests ? sortedRequests.map((r) => r.id) : []),
    [sortedRequests]
  );

  const matchesQuery = useMemoFirebase(
    () =>
      user && requestIds && requestIds.length > 0
        ? query(
            collection(firestore, 'donationMatches'),
            where('requestId', 'in', requestIds)
          )
        : null,
    [firestore, user, requestIds]
  );
  const { data: matches, isLoading: isMatchesLoading } =
    useCollection<DonationMatch>(matchesQuery);

  const handleMatchResponse = async (
    match: DonationMatch,
    response: 'accepted' | 'rejected'
  ) => {
    if (!firestore || !user) return;
    setProcessingMatch(match.id);

    const matchRef = doc(firestore, 'donationMatches', match.id);
    const requestRef = doc(firestore, 'bloodRequests', match.requestId);
    const requestDoc = sortedRequests?.find((r) => r.id === match.requestId);

    try {
      await updateDoc(matchRef, { status: response });
      
      const notificationCollection = collection(firestore, 'notifications');
      
      if (response === 'accepted' && requestDoc) {
        await updateDoc(requestRef, { status: 'Fulfilled' });

        const donationCollection = collection(firestore, 'donations');
        const newDonation: Omit<Donation, 'id'> = {
          donorId: match.donorId,
          requestId: match.requestId,
          donorName: match.donorName,
          bloodType: requestDoc.bloodType,
          location: requestDoc.location,
          donationDate: new Date(),
        };
        await addDoc(donationCollection, newDonation);
        
        const acceptedInAppNotification: Omit<Notification, 'id'> = {
          userId: match.donorId,
          message: `Your donation offer for ${requestDoc.bloodType} blood has been accepted!`,
          type: 'offer_accepted',
          relatedId: match.requestId,
          isRead: false,
          createdAt: serverTimestamp(),
        };
        await addDoc(notificationCollection, acceptedInAppNotification);

        toast({
          title: 'Match Accepted!',
          description: 'The donor has been notified with your contact details.',
        });

        const otherPendingMatches = matches?.filter(m => m.requestId === match.requestId && m.id !== match.id && m.status === 'pending');
        if (otherPendingMatches) {
          for (const otherMatch of otherPendingMatches) {
            await updateDoc(doc(firestore, 'donationMatches', otherMatch.id), { status: 'rejected' });
          }
        }

      } else if (response === 'rejected' && requestDoc) {
        const rejectedInAppNotification: Omit<Notification, 'id'> = {
          userId: match.donorId,
          message: `Your offer for request #${match.requestId.substring(0, 5)} was not accepted this time.`,
          type: 'offer_rejected',
          relatedId: match.requestId,
          isRead: false,
          createdAt: serverTimestamp(),
        };
        await addDoc(notificationCollection, rejectedInAppNotification);

        toast({
          title: 'Offer Rejected',
          description: 'The offer has been declined and the donor has been notified.',
        });
      }
    } catch (err: any) {
      console.error('Error responding to match: ', err);
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setProcessingMatch(null);
    }
  };

  const isLoading = isRequestsLoading || isMatchesLoading;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          My Blood Requests
        </h2>
        <p className="text-muted-foreground">
          Track the status of your requests and view donor offers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
          <CardDescription>
            You have made {sortedRequests?.length ?? 0} requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}
          {!isLoading && sortedRequests && sortedRequests.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {sortedRequests.map((request) => {
                const pendingOffers =
                  matches?.filter(
                    (m) => m.requestId === request.id && m.status === 'pending'
                  ) ?? [];
                const acceptedOffer = matches?.find(
                  (m) => m.requestId === request.id && m.status === 'accepted'
                );

                return (
                  <AccordionItem
                    value={request.id}
                    key={request.id}
                    className="border-b-0"
                  >
                    <Card className="overflow-hidden">
                      <AccordionTrigger
                        className="p-4 hover:no-underline data-[state=open]:bg-primary/5 data-[state=open]:border-b"
                        disabled={request.status === 'Fulfilled'}
                      >
                        <div className="flex items-center gap-4 text-left w-full">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <span className="font-bold text-xl text-primary">
                              {request.bloodType}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">
                              Request at {request.location}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(request.createdAt.toDate(), 'PPP')}
                              <Badge
                                variant={
                                  request.status === 'Fulfilled'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className={`ml-2 ${
                                  request.status === 'Fulfilled'
                                    ? 'bg-green-600'
                                    : ''
                                }`}
                              >
                                {request.status}
                              </Badge>
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4">
                        {acceptedOffer ? (
                          <div>
                            <h4 className="font-semibold mb-2 text-green-600">
                              Donor Confirmed!
                            </h4>
                            <div className="rounded-md border p-3 bg-green-50">
                              <p className="font-semibold">
                                {acceptedOffer.donorName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Blood Type: {acceptedOffer.donorBloodType}
                              </p>
                              <div className="text-sm text-muted-foreground flex flex-col gap-2 mt-2">
                                <a
                                  href={`tel:${acceptedOffer.donorPhoneNumber}`}
                                  className="flex items-center gap-2 hover:underline"
                                >
                                  <Phone className="h-4 w-4" />
                                  {acceptedOffer.donorPhoneNumber}
                                </a>
                                <a
                                  href={`mailto:${acceptedOffer.donorEmail}`}
                                  className="flex items-center gap-2 hover:underline"
                                >
                                  <Mail className="h-4 w-4" />
                                  {acceptedOffer.donorEmail}
                                </a>
                              </div>
                            </div>
                          </div>
                        ) : request.status === 'Fulfilled' ? (
                          <p className="text-sm text-muted-foreground">
                            This request has been fulfilled.
                          </p>
                        ) : (
                          <>
                            <h4 className="font-semibold mb-2">
                              Pending Donor Offers ({pendingOffers.length})
                            </h4>
                            {pendingOffers.length > 0 ? (
                              <div className="space-y-3">
                                {pendingOffers.map((match) => (
                                  <div
                                    key={match.id}
                                    className="flex items-center justify-between rounded-md border p-3 bg-secondary/50"
                                  >
                                    <div>
                                      <p className="font-semibold">
                                        {match.donorName}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {match.donorLocation} - Blood Type:{' '}
                                        {match.donorBloodType}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() =>
                                          handleMatchResponse(match, 'rejected')
                                        }
                                        disabled={!!processingMatch}
                                      >
                                        {processingMatch === match.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <UserX className="h-4 w-4" />
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() =>
                                          handleMatchResponse(match, 'accepted')
                                        }
                                        disabled={!!processingMatch}
                                      >
                                        {processingMatch === match.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <UserCheck className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No pending offers for this request yet.
                              </p>
                            )}
                          </>
                        )}
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            !isLoading && (
              <div className="text-center py-10">
                <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-semibold">No Requests Found</p>
                <p className="text-muted-foreground mt-2">
                  You have not made any blood requests.
                </p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    