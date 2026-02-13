import React, { forwardRef } from 'react';

export const EmptyPage = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div ref={ref} className="w-full h-full bg-amber-50">
      {/* Empty page for alignment purposes */}
    </div>
  );
});

EmptyPage.displayName = 'EmptyPage';
