'use client';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { BloodRequest } from '@/lib/types';
import { LifeBuoy } from 'lucide-react';

export default function OverviewPage() {
  const firestore = useFirestore();
  const requestsCollection = useMemoFirebase(
    () => collection(firestore, 'bloodRequests'),
    [firestore]
  );
  const recentRequestsQuery = useMemoFirebase(
    () => query(requestsCollection, orderBy('createdAt', 'desc'), limit(5)),
    [requestsCollection]
  );
  const { data: recentRequests, isLoading } = useCollection<BloodRequest>(recentRequestsQuery);

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
                  <div className="font-semibold">
                    <Badge variant={request.urgency === 'High' ? 'destructive' : 'secondary'}>{request.urgency}</Badge> Urgency
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {request.location}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">Share</Button>
                  <Button size="sm">Accept</Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
           !isLoading && <div className="text-center py-10 bg-card rounded-lg border">
                <LifeBuoy className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-semibold">No Active Requests</p>
                <p className="text-muted-foreground mt-2">
                  No active blood requests right now. Check back later!
                </p>
          </div>
        )}
      </div>
    </div>
  );
}
