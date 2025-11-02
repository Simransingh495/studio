import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { MainHeader } from '@/components/main-header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  HeartHandshake,
  Search,
  UserPlus,
  BarChart,
  Droplets,
  LifeBuoy,
} from 'lucide-react';
import { users, bloodRequests, donations } from '@/lib/data';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image');

  const stats = [
    {
      title: 'Donors Registered',
      value: users.filter(u => u.role === 'donor').length,
      icon: UserPlus,
    },
    {
      title: 'Blood Requests',
      value: bloodRequests.length,
      icon: LifeBuoy,
    },
    {
      title: 'Successful Donations',
      value: donations.length,
      icon: Droplets,
    },
  ];

  const howItWorks = [
    {
      icon: UserPlus,
      title: 'Register as a Donor',
      description:
        'Create a profile with your blood type and location. Your information is kept secure and private.',
    },
    {
      icon: Search,
      title: 'Find a Donor',
      description:
        'Patients in need can search for compatible blood donors in their area quickly and easily.',
    },
    {
      icon: HeartHandshake,
      title: 'Connect & Save a Life',
      description:
        'Once a match is found, parties can connect to coordinate the donation and help save a life.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex h-[60vh] min-h-[500px] w-full items-center justify-center bg-primary/10 text-center text-primary-foreground">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover object-center opacity-20"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="relative z-10 container mx-auto max-w-4xl px-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Connecting Blood Donors With Patients In Need
            </h1>
            <p className="mt-6 text-lg text-foreground/80">
              Join our community of lifesavers. Your donation can make a world
              of difference.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/register">Register as a Donor</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full"
              >
                <Link href="/app/find-donors">Find a Donor</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-background py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.title} className="flex flex-col items-center">
                  <stat.icon className="h-10 w-10 text-primary" />
                  <p className="mt-2 text-4xl font-bold tracking-tight text-foreground">
                    {stat.value}+
                  </p>
                  <p className="text-base font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-secondary/50 py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                A simple, three-step process to save lives.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3">
              {howItWorks.map((step) => (
                <div key={step.title} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-base text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-background">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
          <div className="flex flex-col items-center sm:items-start">
            <Link href="/">
              <span className="text-lg font-bold">BloodSync</span>
            </Link>
            <p className="text-sm text-muted-foreground">Saving lives, one drop at a time.</p>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BloodSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
