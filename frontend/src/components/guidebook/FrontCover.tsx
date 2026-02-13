import { forwardRef } from 'react';

export const FrontCover = forwardRef<HTMLDivElement>((_props, ref) => {
  return (
    <div
      ref={ref}
      className="w-full h-full bg-gradient-to-br from-violet-900 via-violet-800 to-violet-900 flex flex-col items-center justify-center p-8 md:p-12"
    >
      {/* Decorative border */}
      <div className="border-8 border-amber-300 w-full h-full flex flex-col items-center justify-center p-6 md:p-8">
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-amber-100 text-center mb-4 md:mb-8 uppercase tracking-widest">
          Guidebook
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-amber-200 text-center font-serif italic">
          Character Compendium
        </p>

        {/* Decorative flourish */}
        <div className="mt-12 text-amber-300 text-4xl">✦</div>
      </div>
    </div>
  );
});

FrontCover.displayName = 'FrontCover';
