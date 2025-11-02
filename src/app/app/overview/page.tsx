'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { bloodRequests } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function OverviewPage() {
  const recentRequests = bloodRequests.slice(0, 3);

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
        {recentRequests.length > 0 ? (
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
                  <p className="font-semibold">
                    <Badge variant={request.urgency === 'High' ? 'destructive' : 'secondary'}>{request.urgency}</Badge> Urgency
                  </p>
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
           <p className="p-4 text-center text-muted-foreground">
            No active blood requests right now.
          </p>
        )}
      </div>
    </div>
  );
}
