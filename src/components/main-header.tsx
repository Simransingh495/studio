import Link from 'next/link';
import { Button } from './ui/button';
import { Logo } from './logo';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';

export function MainHeader() {
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#features', label: 'Features' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <Link href="/" className="mb-6 flex items-center">
              <Logo />
            </Link>
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-lg font-medium transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-2">
               <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-primary text-foreground/80"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Centered Logo for Desktop */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
           <Link href="/">
             <Logo />
           </Link>
        </div>
        
        {/* Auth buttons */}
        <div className="hidden items-center space-x-2 md:flex">
           <Button asChild variant="ghost">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>

        {/* Mobile Logo */}
         <div className="md:hidden">
           <Link href="/">
             <Logo />
           </Link>
        </div>

      </div>
    </header>
  );
}
