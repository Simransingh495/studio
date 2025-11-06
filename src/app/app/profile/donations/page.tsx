'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Donation } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { HandHeart, Droplets } from 'lucide-react';
import { format } from 'date-fns';

export default function DonationHistoryPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const donationsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'donations'),
            where('donorId', '==', user.uid)
          )
        : null,
    [firestore, user]
  );
  
  const { data: donations, isLoading } = useCollection<Donation>(donationsQuery);

  const sortedDonations = donations 
    ? [...donations].sort((a, b) => b.donationDate.toDate().getTime() - a.donationDate.toDate().getTime()) 
    : [];

  return (
    <div className="space-y-6">
       <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Donation History</h2>
            <p className="text-muted-foreground">A record of your life-saving contributions. Thank you for being a hero.</p>
        </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Donations</CardTitle>
          <CardDescription>
            You have made {sortedDonations?.length ?? 0} donations.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            )}
            {!isLoading && sortedDonations && sortedDonations.length > 0 ? (
                <div className="space-y-4">
                    {sortedDonations.map((donation) => (
                        <div key={donation.id} className="flex items-center gap-4 rounded-lg border p-4">
                            <Droplets className="h-8 w-8 text-primary" />
                            <div className="flex-1">
                                <p className="font-semibold">Donation to fulfill request at {donation.location}</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(donation.donationDate.toDate(), 'PPP')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                !isLoading && (
                     <div className="text-center py-10">
                        <HandHeart className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg font-semibold">No Donations Yet</p>
                        <p className="text-muted-foreground mt-2">
                          Your donation history is empty. Become a donor today!
                        </p>
                    </div>
                )
            )}
        </CardContent>
      </Card>
    </div>
  );
}
