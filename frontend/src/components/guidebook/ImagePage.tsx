import React, { forwardRef } from 'react';
import { useCharacter } from '@/hooks/useCharacters';
import { getColorClasses } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ImagePageProps {
  characterId: string;
  shouldLoad: boolean;
}

export const ImagePage = forwardRef<HTMLDivElement, ImagePageProps>(
  ({ characterId, shouldLoad }, ref) => {
    const { data: character, isLoading } = useCharacter(characterId, {
      enabled: shouldLoad,
    });

    // Wait for data before rendering (avoid flash of placeholder)
    if (!shouldLoad || isLoading) {
      return (
        <div ref={ref} className="w-full h-full bg-muted p-8">
          <Skeleton className="w-full h-full" />
        </div>
      );
    }

    const bgColor = getColorClasses(character?.primaryColor);
    const imageUrl = character?.activeImage
      ? `/uploads/characters/${characterId}/${character.activeImage}`
      : null;

    const borderColor = character?.primaryColor
      ? `border-${character.primaryColor.hue}-${character.primaryColor.shade}`
      : 'border-violet-700';

    return (
      <div ref={ref} className="w-full h-full flex items-center justify-center bg-amber-50 p-8">
        <div className="relative w-full max-w-[85%] h-[90%] flex flex-col">
          {/* Image container with arch-shaped border */}
          <div className={cn('relative flex-1 rounded-t-[50%] overflow-hidden border-8', borderColor)}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={character?.name || 'Character'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={cn(
                  'w-full h-full flex items-center justify-center',
                  bgColor
                )}
              >
                <span className="text-9xl font-bold text-white/20">
                  {character?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Name block - overlaps the image */}
          <div className={cn('relative -mt-8 mx-auto px-8 py-4 rounded-lg shadow-xl max-w-[75%] z-10', bgColor)}>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center">
              {character?.name || 'Loading...'}
            </h1>
          </div>
        </div>
      </div>
    );
  }
);

ImagePage.displayName = 'ImagePage';
