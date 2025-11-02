import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { MainHeader } from '@/components/main-header';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainHeader />
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-primary p-6 pt-10 rounded-t-3xl">
            <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-full border-4 border-white shadow-lg">
              {heroImage && (
                <Image
                  alt="Hero"
                  className="h-full w-full object-cover"
                  src={heroImage.imageUrl}
                  fill
                  data-ai-hint={heroImage.imageHint}
                />
              )}
            </div>
          </div>
          <div className="transform -translate-y-8">
            <div className="bg-card p-8 rounded-3xl shadow-lg text-center">
              <h1 className="font-headline text-3xl font-bold tracking-tight">
                Donate Blood
                <br />
                Save Life!
              </h1>
              <p className="mt-4 text-muted-foreground">
                An event during higher sense in London. We design and build
                beautiful products.
              </p>
              <Button asChild size="lg" className="mt-6 w-full rounded-full">
                <Link href="/register">Donate Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}