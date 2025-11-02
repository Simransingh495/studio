'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, where } from 'firebase/firestore';
import type { Notification } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { BellRing, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotificationsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const notificationsQuery = useMemoFirebase(
    () => user ? query(collection(firestore, 'notifications'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')) : null,
    [firestore, user]
  );
  
  const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user || !firestore) return;
    const notifRef = doc(firestore, 'notifications', notificationId);
    try {
      await updateDoc(notifRef, { isRead: true });
    } catch (e) {
      console.error("Failed to mark notification as read", e);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Notifications</h2>
        <p className="text-muted-foreground">Recent updates about your requests and donation offers.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Alerts</CardTitle>
          <CardDescription>
            You have {notifications?.length ?? 0} total notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}
            {!isLoading && notifications && notifications.length > 0 ? (
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <div key={notif.id} className={`flex items-center gap-4 rounded-lg border p-4 ${!notif.isRead ? 'bg-primary/5' : 'bg-transparent'}`}>
                            <BellRing className="h-8 w-8 text-primary" />
                            <div className="flex-1">
                                <p className="font-semibold">{notif.message}</p>
                                <p className="text-sm text-muted-foreground">
                                    {notif.createdAt.toDate().toLocaleString()}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                {notif.type === 'request_match' && (
                                    <Button asChild size="sm">
                                        <Link href={`/app/profile/requests`}>View Offers</Link>
                                    </Button>
                                )}
                                {!notif.isRead && (
                                    <Button variant="secondary" size="sm" onClick={() => handleMarkAsRead(notif.id)}>
                                        Mark as Read
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                !isLoading && (
                     <div className="text-center py-10">
                        <BellOff className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg font-semibold">No Notifications Yet</p>
                        <p className="text-muted-foreground mt-2">
                          We'll let you know when there's something new to see.
                        </p>
                    </div>
                )
            )}
        </CardContent>
      </Card>
    </div>
  );
}
