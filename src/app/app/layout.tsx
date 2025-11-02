'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  HeartHandshake,
  LayoutDashboard,
  Search,
  User,
  Droplets,
  Bell,
  Loader2,
} from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const menuItems = [
  {
    href: '/app/overview',
    label: 'Home',
    icon: LayoutDashboard,
  },
  {
    href: '/app/find-donors',
    label: 'Search',
    icon: Search,
  },
  {
    href: '/app/request-blood',
    label: 'Donate',
    icon: HeartHandshake,
  },
  {
    href: '/app/profile',
    label: 'Profile',
    icon: User,
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);

  const isLoading = isUserLoading || isUserDataLoading;
  const userName = userData ? userData.firstName : 'User';

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
        {isLoading ? (
           <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <h1 className="font-headline text-xl font-semibold">Hello {userName}!</h1>
        )}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6" />
            <span className="sr-only">Notifications</span>
          </Button>
          <UserNav />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      <footer className="sticky bottom-0 z-10 mt-auto border-t bg-background">
        <nav className="mx-auto flex max-w-md items-center justify-around gap-2 px-4 py-2">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-md p-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive && 'text-primary'
                )}
              >
                <item.icon className="h-6 w-6" />
                <span>{item.label}</span>
              </Link>
            );
          })}
           <Link
            href="/app/request-blood"
            className="group relative flex items-center justify-center"
            >
            <div className="absolute -top-8 flex h-16 w-16 items-center justify-center rounded-full bg-background">
                 <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
                    <Droplets className="h-8 w-8" />
                </div>
            </div>
            <span className="sr-only">Request Blood</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
}
