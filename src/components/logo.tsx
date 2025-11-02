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
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        fill-rule="evenodd"
        clip-rule="evenodd"
        stroke-linejoin="round"
        stroke-miterlimit="2"
      >
        <path
          d="M32.012 5.343c-6.895 8.95-16.32 20.72-16.32 30.655 0 8.998 7.302 16.32 16.32 16.32 9.018 0 16.32-7.322 16.32-16.32C48.332 26.062 38.907 14.293 32.012 5.343m3.881 33.213c-2.316 2.317-5.518 4.218-8.156 4.312-3.411.12-6.527-1.533-8.832-4.303-4.28-5.143 1.258-12.01 1.258-12.01s2.08-1.897 4.654-2.583c2.783-.75 5.257.02 5.257.02.01.002 4.14 1.763 6.303 4.966 2.454 3.633 1.83 9.478-1.484 12.443"
          fill="currentColor"
          fill-rule="nonzero"
        />
        <path
          d="M36.19 38.21c-2.316 2.317-5.518 4.218-8.156 4.312-3.411.12-6.527-1.533-8.832-4.303-4.28-5.143 1.258-12.01 1.258-12.01s2.08-1.897 4.654-2.583c2.783-.75 5.257.02 5.257.02.01.002 4.14 1.763 6.303 4.966 2.454 3.633 1.83 9.478-1.484 12.443z"
          fill="#fff"
        />
      </svg>
      <span className="font-headline">BloodSync</span>
    </div>
  );
}
