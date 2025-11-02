import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center font-bold tracking-tight text-primary',
        className
      )}
    >
      <svg
        className="h-12 w-12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09"
          fill="currentColor"
        />
        <path
          d="M12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3c-1.74 0-3.41.81-4.5 2.09"
          fill="currentColor"
        />
      </svg>
      <span className="font-headline text-3xl -mt-4">BloodSync</span>
      <svg
        className="h-12 w-12 -mt-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 10h-2v2H9v2h2v2h2v-2h2v-2h-2v-2z"
          fill="currentColor"
          stroke="#FFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
