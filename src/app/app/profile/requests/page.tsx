'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection, useFirestore, useUser, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { BloodRequest, DonationMatch } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList, Loader2, UserCheck, UserX, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


export default function MyRequestsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [processingMatch, setProcessingMatch] = useState<string | null>(null);

  const requestsQuery = useMemoFirebase(
    () => user ? query(
      collection(firestore, 'bloodRequests'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    ) : null,
    [firestore, user]
  );
  const { data: requests, isLoading: isRequestsLoading } = useCollection<BloodRequest>(requestsQuery);
  
  const requestIds = useMemo(() => requests ? requests.map(r => r.id) : [], [requests]);

  const matchesQuery = useMemoFirebase(
    () => (user && requestIds && requestIds.length > 0) ? query(
      collection(firestore, 'donationMatches'),
      where('requestId', 'in', requestIds)
    ) : null,
    [firestore, user, requestIds]
  );
  const { data: matches, isLoading: isMatchesLoading } = useCollection<DonationMatch>(matchesQuery);

  const handleMatchResponse = async (match: DonationMatch, response: 'accepted' | 'rejected') => {
      if (!firestore || !user) return;
      setProcessingMatch(match.id);
      
      const matchRef = doc(firestore, 'donationMatches', match.id);
      const requestRef = doc(firestore, 'bloodRequests', match.requestId);
      const requestDoc = requests?.find(r => r.id === match.requestId);
      const donorNotifCollection = collection(firestore, 'notifications');
      
      try {
        await updateDoc(matchRef, { status: response });

        if (response === 'accepted' && requestDoc) {
          // Update the request status
          await updateDoc(requestRef, { status: 'Matched' });

          // Notify the donor
          const newNotification = {
              userId: match.donorId,
              message: `Your offer for ${requestDoc.bloodType} blood has been accepted! Please contact the patient at: ${requestDoc.contactPhone}.`,
              type: 'offer_accepted',
              relatedId: match.requestId,
              isRead: false,
              createdAt: serverTimestamp(),
          };
          addDocumentNonBlocking(donorNotifCollection, newNotification);
          
          toast({ title: "Match Accepted!", description: "The donor has been notified with your contact details." });

          // Optional: Reject other pending offers for this request
          const otherPendingMatches = matches?.filter(m => m.requestId === match.requestId && m.id !== match.id && m.status === 'pending');
          if (otherPendingMatches) {
            for(const otherMatch of otherPendingMatches) {
              const otherMatchRef = doc(firestore, 'donationMatches', otherMatch.id);
              await updateDoc(otherMatchRef, { status: 'rejected' });
            }
          }

        } else if (response === 'rejected') {
          // Notify the donor that the offer was rejected
           const newNotification = {
              userId: match.donorId,
              message: `Your donation offer for request #${match.requestId.substring(0,5)} was not accepted.`,
              type: 'offer_rejected',
              relatedId: match.requestId,
              isRead: false,
              createdAt: serverTimestamp(),
          };
          addDocumentNonBlocking(donorNotifCollection, newNotification);
          toast({ title: "Offer Rejected", description: "The offer has been declined."});
        }
      } catch (err: any) {
        console.error("Error responding to match: ", err);
        toast({ variant: 'destructive', title: "Error", description: err.message });
      } finally {
        setProcessingMatch(null);
      }
  }

  const isLoading = isRequestsLoading || isMatchesLoading;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">My Blood Requests</h2>
        <p className="text-muted-foreground">Track the status of your requests and view donor offers.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
          <CardDescription>
            You have made {requests?.length ?? 0} requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            )}
            {!isLoading && requests && requests.length > 0 ? (
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {requests.map((request) => {
                      const pendingOffers = matches?.filter(m => m.requestId === request.id && m.status === 'pending') ?? [];
                      const acceptedOffer = matches?.find(m => m.requestId === request.id && m.status === 'accepted');

                      return (
                        <AccordionItem value={request.id} key={request.id} className="border-b-0">
                           <Card className="overflow-hidden">
                              <AccordionTrigger className="p-4 hover:no-underline data-[state=open]:bg-primary/5">
                                <div className="flex items-center gap-4 text-left w-full">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                      <span className="font-bold text-xl text-primary">{request.bloodType}</span>
                                  </div>
                                  <div className="flex-1">
                                      <p className="font-semibold">Request at {request.location}</p>
                                      <p className="text-sm text-muted-foreground">
                                          {request.createdAt.toDate().toLocaleDateString()}
                                          <Badge variant={request.status === 'Matched' ? 'default' : 'secondary'} className={`ml-2 ${request.status === 'Matched' ? 'bg-green-600' : ''}`}>{request.status}</Badge>
                                      </p>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="p-4 border-t">
                                {acceptedOffer ? (
                                  <div>
                                    <h4 className="font-semibold mb-2 text-green-600">Donor Confirmed!</h4>
                                     <div className="rounded-md border p-3 bg-green-50">
                                          <p className="font-semibold">{acceptedOffer.donorName}</p>
                                          <p className="text-sm text-muted-foreground">Blood Type: {acceptedOffer.donorBloodType}</p>
                                          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                             <Phone className="h-4 w-4" /> 
                                             {acceptedOffer.donorContactPhone || "Contact info not provided"}
                                          </p>
                                      </div>
                                  </div>
                                ) : (
                                <>
                                  <h4 className="font-semibold mb-2">Pending Donor Offers ({pendingOffers.length})</h4>
                                  {pendingOffers.length > 0 ? (
                                    <div className="space-y-3">
                                        {pendingOffers.map(match => (
                                            <div key={match.id} className="flex items-center justify-between rounded-md border p-3 bg-secondary/50">
                                                <div>
                                                    <p className="font-semibold">{match.donorName}</p>
                                                    <p className="text-sm text-muted-foreground">{match.donorLocation} - Blood Type: {match.donorBloodType}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleMatchResponse(match, 'rejected')} disabled={!!processingMatch}>
                                                        {processingMatch === match.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <UserX className="h-4 w-4"/>}
                                                    </Button>
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleMatchResponse(match, 'accepted')} disabled={!!processingMatch}>
                                                        {processingMatch === match.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <UserCheck className="h-4 w-4"/>}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No pending offers for this request yet.</p>
                                  )}
                                </>
                                )}
                              </AccordionContent>
                           </Card>
                        </AccordionItem>
                      )
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
