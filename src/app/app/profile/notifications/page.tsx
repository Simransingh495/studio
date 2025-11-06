'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import type { Notification } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, BellOff, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';


export default function NotificationPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  // The orderBy clause was causing an internal assertion error in Firestore
  // because the composite index was not created. Removing it to fix the crash.
  const notificationsQuery = useMemoFirebase(
    () => user ? query(
      collection(firestore, 'notifications'),
      where('userId', '==', user.uid)
    ) : null,
    [firestore, user]
  );
  
  const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!firestore) return;
    const notificationRef = doc(firestore, 'notifications', notificationId);
    try {
      await updateDoc(notificationRef, { isRead: true });
      toast({ title: 'Notification marked as read.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update notification.' });
    }
  };

  const sortedNotifications = notifications
    ? [...notifications].sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime())
    : [];

  return (
    <div className="space-y-6">
       <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Notifications</h2>
            <p className="text-muted-foreground">Updates on your requests and donation offers.</p>
        </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Notifications</CardTitle>
          <CardDescription>
            You have {notifications?.filter(n => !n.isRead).length ?? 0} unread notifications.
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
            {!isLoading && sortedNotifications && sortedNotifications.length > 0 ? (
                <div className="space-y-4">
                    {sortedNotifications.map((notification) => (
                        <div key={notification.id} className={cn("flex items-start gap-4 rounded-lg border p-4 transition-colors", !notification.isRead && "bg-primary/5")}>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mt-1">
                                <Bell className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <p className={cn("font-medium", !notification.isRead && "font-bold")}>{notification.message}</p>
                                <p className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })}
                                </p>
                            </div>
                            {!notification.isRead && (
                                <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => handleMarkAsRead(notification.id)}>
                                            <Check className="h-5 w-5" />
                                            <span className="sr-only">Mark as read</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Mark as read</p>
                                    </TooltipContent>
                                </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                !isLoading && (
                     <div className="text-center py-16">
                        <BellOff className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg font-semibold">No Notifications Yet</p>
                        <p className="text-muted-foreground mt-2">
                          You have no new notifications.
                        </p>
                    </div>
                )
            )}
        </CardContent>
      </Card>
    </div>
  );
}
