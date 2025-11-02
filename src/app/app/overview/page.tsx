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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OverviewPage() {
  const recentRequests = bloodRequests.slice(0, 2);
  const donateBanner = PlaceHolderImages.find(
    (img) => img.id === 'avatar-4'
  );

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-primary text-primary-foreground">
        <div className="flex items-center">
          <div className="flex-1 p-6">
            <h2 className="text-2xl font-bold">Donate Blood,</h2>
            <h2 className="text-2xl font-bold">Save Lives</h2>
            <p className="mt-2 text-sm">
              Your donation can save up to 3 lives. Be a hero today.
            </p>
          </div>
          <div className="relative h-32 w-32 flex-shrink-0">
            {donateBanner && (
              <Image
                src={donateBanner.imageUrl}
                alt="Donate Blood"
                fill
                className="object-cover"
                data-ai-hint="woman smiling"
              />
            )}
          </div>
        </div>
      </Card>

      <Tabs defaultValue="blood">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="blood">Blood</TabsTrigger>
          <TabsTrigger value="plasma">Plasma</TabsTrigger>
        </TabsList>
        <TabsContent value="blood" className="mt-4 space-y-4">
          {recentRequests.map((request) => (
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
                    {request.urgency} Urgency
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
          ))}
        </TabsContent>
        <TabsContent value="plasma">
          <p className="p-4 text-center text-muted-foreground">
            Plasma requests will be shown here.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}