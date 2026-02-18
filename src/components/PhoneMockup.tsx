import { ReactNode } from 'react';

export function PhoneMockup({ children }: { children: ReactNode }) {
  return (
    <div className="hidden lg:flex items-start justify-center pt-4">
      <div className="relative w-[280px] h-[560px] bg-foreground rounded-[3rem] p-3 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-foreground rounded-b-2xl z-10" />
        {/* Screen */}
        <div className="w-full h-full bg-card rounded-[2.2rem] overflow-hidden flex flex-col items-center justify-center">
          {children}
        </div>
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-muted-foreground/40 rounded-full" />
      </div>
    </div>
  );
}
