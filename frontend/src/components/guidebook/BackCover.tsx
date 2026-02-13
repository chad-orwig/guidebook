import { forwardRef } from 'react';

export const BackCover = forwardRef<HTMLDivElement>((_props, ref) => {
  return (
    <div
      ref={ref}
      className="w-full h-full bg-gradient-to-br from-violet-900 via-violet-800 to-violet-900 flex items-center justify-center p-8 md:p-12"
    >
      {/* Decorative border */}
      <div className="border-8 border-amber-300 w-full h-full flex items-center justify-center">
        {/* Simple decorative element */}
        <div className="text-amber-300 text-6xl md:text-8xl">✦</div>
      </div>
    </div>
  );
});

BackCover.displayName = 'BackCover';
