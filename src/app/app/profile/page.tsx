'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/types';
import { users } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  List,
  LogOut,
  Settings,
  Timer,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';


export default function ProfilePage() {
  const { toast } = useToast();
  // Mocking logged-in user data
  const currentUser = users[0] as User;

  const userInitials = currentUser.name.split(' ').map((n) => n[0]).join('');

  const stats = [
    { label: 'Blood Type', value: currentUser.bloodType },
    { label: 'Donated', value: '04' },
    { label: 'Requested', value: '03' },
  ];

  const menuItems = [
    { label: 'Edit Profile', icon: UserIcon, href: '#' },
    { label: 'Donation History', icon: List, href: '#' },
    { label: 'Set Timer', icon: Timer, href: '#' },
    { label: 'Settings', icon: Settings, href: '#' },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="bg-primary pb-24 pt-6 text-primary-foreground">
        <div className="container mx-auto max-w-md px-4 text-center">
          <h2 className="text-xl font-semibold">Profile</h2>
        </div>
      </div>
      <div className="-mt-20 flex-1 bg-secondary">
        <div className="container mx-auto max-w-md p-4">
          <Card className="transform -translate-y-12 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 border-4 border-primary/50">
                  <AvatarImage
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                  />
                  <AvatarFallback className="text-3xl">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-4 text-xl font-bold">{currentUser.name}</h3>
                <div className="mt-4 flex w-full gap-2">
                  <Button className="flex-1 rounded-full">Call Now</Button>
                  <Button variant="secondary" className="flex-1 rounded-full">
                    Request
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="transform -translate-y-6">
            <Card className="rounded-2xl">
              <CardContent className="flex justify-around p-4 text-center">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-4 rounded-2xl">
              <CardContent className="p-4">
                <ul className="space-y-2">
                  <li className="flex items-center justify-between rounded-lg p-2 hover:bg-secondary">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">
                        Available for Donate
                      </span>
                    </div>
                    <Switch
                      checked={currentUser.availability === 'Available'}
                      onCheckedChange={() =>
                        toast({ title: 'Availability updated!' })
                      }
                    />
                  </li>
                  {menuItems.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-4 rounded-lg p-3 hover:bg-secondary"
                      >
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                        <span className="flex-1 font-medium">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/"
                      className="flex items-center gap-4 rounded-lg p-3 text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="flex-1 font-medium">Log out</span>
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
