import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-lg font-bold tracking-tight text-accent',
        className
      )}
    >
      <svg
        className="h-8 w-8"
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M50 0C50 0 70 18 70 35C70 52 50 70 50 70C50 70 30 52 30 35C30 18 50 0 50 0ZM50 10C61.0457 10 70 18.9543 70 30C70 41.0457 61.0457 50 50 50C38.9543 50 30 41.0457 30 30C30 18.9543 38.9543 10 50 10Z"
          transform="translate(0, 5)"
        />
        <path d="M25 50C15 65 15 90 15 90L35 90L37 80L40 90L43 75L47 90L50 60" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M75 50C85 65 85 90 85 90L65 90L63 80L60 90L57 75L53 90L50 60" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path
          d="M20,60 C30,40 40,70 50,60"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          transform="translate(-1, 28) scale(1.1)"
        />
        <path
          d="M80,60 C70,40 60,70 50,60"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          transform="translate(1, 28) scale(1.1)"
        />
      </svg>
      <span className="font-headline">BloodSync</span>
    </div>
  );
}
