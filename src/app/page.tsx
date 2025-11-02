import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { MainHeader } from '@/components/main-header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  HeartHandshake,
  Search,
  UserPlus,
  LifeBuoy,
  BrainCircuit,
  Bell,
  MapPin,
  Quote,
} from 'lucide-react';
import { users, bloodRequests, donations } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/logo';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image');
  const communityImage = PlaceHolderImages.find(
    (img) => img.id === 'community-image'
  );

  const stats = [
    {
      title: 'Donors Registered',
      value: users.filter((u) => u.role === 'donor').length,
      icon: UserPlus,
    },
    {
      title: 'Blood Requests',
      value: bloodRequests.length,
      icon: LifeBuoy,
    },
    {
      title: 'Lives Saved',
      value: donations.length,
      icon: HeartHandshake,
    },
  ];

  const aboutSteps = [
    {
      icon: UserPlus,
      title: 'Register Seamlessly',
      description:
        'Create your secure profile in minutes. Add your blood type, location, and availability to join our network of lifesavers. Our guided process makes it easy to get started, and your information is kept secure and private.',
    },
    {
      icon: Search,
      title: 'Find or Request Blood',
      description:
        'Patients can instantly search for nearby donors using our map-based interface. In urgent situations, our system broadcasts requests to all available and compatible donors in the area, ensuring rapid response times.',
    },
    {
      icon: HeartHandshake,
      title: 'Connect and Save Lives',
      description:
        'Our platform facilitates a direct and secure connection between donors and recipients. Once a match is found, you can communicate to coordinate the donation, ensuring a timely and life-saving contribution.',
    },
  ];

  const features = [
    {
      icon: BrainCircuit,
      title: 'AI Smart Matching',
      description:
        'Our advanced AI algorithm instantly finds the most compatible donors based on blood type, location, availability, and donation history, ensuring the best match in critical situations. This intelligent system significantly reduces the time to find a suitable donor.',
    },
    {
      icon: MapPin,
      title: 'Geolocation-Based Search',
      description:
        'Quickly find donors in your immediate vicinity with our automatic location detection and interactive map. This feature minimizes travel time and accelerates the donation process when every second counts.',
    },
    {
      icon: Bell,
      title: 'Real-time Notifications',
      description:
        'Receive instant push notifications and alerts for urgent blood requests in your area. This allows you to respond quickly and make a timely, life-saving impact, whether you are at home or on the go.',
    },
    {
      icon: LifeBuoy,
      title: 'Urgent Request Broadcasting',
      description:
        'In an emergency, post an urgent blood request and have it instantly broadcast to all suitable donors nearby. This powerful feature maximizes the chances of a quick response from our community of heroes.',
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
                <Link href="/app/request-blood">Request Blood</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full"
              >
                <Link href="/register">Donate Blood</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-secondary/50 py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.title} className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <stat.icon className="h-8 w-8" />
                  </div>
                  <p className="mt-4 text-4xl font-bold tracking-tight text-foreground">
                    {stat.value}+
                  </p>
                  <p className="mt-1 text-base font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Our Mission Section */}
        <section id="mission" className="bg-background py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                Our Mission
              </h2>
              <p className="mt-4 text-xl text-muted-foreground">
                To build a future where every person has access to safe and timely blood transfusions. We are on a relentless mission to eliminate blood shortages by creating an intelligent, compassionate, and interconnected global network of donors and recipients.
              </p>
               <p className="mt-4 text-muted-foreground">
                BloodSync is more than just an app; it's a movement. We harness the power of AI to not only connect people but to predict needs, optimize supply chains, and foster a culture of giving. Every drop counts, and every connection saves a life.
              </p>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="bg-secondary/50 py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                About Us
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our mission is to create a seamless, efficient, and community-driven network to save lives. We believe that technology can solve the critical problem of blood shortages by connecting people in a timely and intelligent manner. Our platform is built on three simple principles.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3">
              {aboutSteps.map((step) => (
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

        {/* Quote Section */}
        <section className="relative bg-primary/5 py-16 sm:py-24">
           {communityImage && (
            <Image
              src={communityImage.imageUrl}
              alt={communityImage.description}
              fill
              className="object-cover object-center opacity-10"
              data-ai-hint={communityImage.imageHint}
            />
          )}
          <div className="relative z-10 container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <Quote className="mx-auto h-12 w-12 text-primary" />
              <blockquote className="mt-4">
                <p className="text-2xl font-medium text-foreground">
                  "The gift of blood is a gift to someone's life. It costs nothing but means everything."
                </p>
              </blockquote>
              <cite className="mt-4 block text-base font-semibold text-muted-foreground not-italic">
                - Anonymous Donor
              </cite>
            </div>
          </div>
        </section>


        {/* Features Section */}
        <section id="features" className="bg-background py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Powerful Platform Features
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We've built a suite of powerful tools designed to make the process of donating and receiving blood simpler and more efficient than ever before. Explore how our technology is making a difference.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-y-12 gap-x-8 md:grid-cols-2 lg:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-base text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        

        {/* Join Community Section */}
        <section className="relative bg-primary/5 py-16 sm:py-24">
          {communityImage && (
            <Image
              src={communityImage.imageUrl}
              alt={communityImage.description}
              fill
              className="object-cover object-center opacity-10"
              data-ai-hint={communityImage.imageHint}
            />
          )}
          <div className="relative container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Join Our Community of Lifesavers
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Become a registered donor on BloodSync today and be a hero in someone's story. Your single act of kindness can save up to three lives. Together, we can build a network of hope.
              </p>
              <div className="mt-8">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/register">Register to Donate</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-background">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
          <div className="flex flex-col items-center sm:items-start">
            <Link href="/">
                <Logo className="text-primary" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Saving lives, one drop at a time.
            </p>
          </div>
          <nav className="flex gap-4">
            <Link
              href="#about"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              About
            </Link>
            <Link
              href="#features"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Features
            </Link>
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Login
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BloodSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
