import { forwardRef } from 'react';
import { useCharacter, useCharacters } from '@/hooks/useCharacters';
import { getColorClasses } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface InfoPageProps {
  characterId: string;
  shouldLoad: boolean;
  onNavigateToCharacter: (characterId: string) => void;
}

export const InfoPage = forwardRef<HTMLDivElement, InfoPageProps>(
  ({ characterId, shouldLoad, onNavigateToCharacter }, ref) => {
    const { data: character, isLoading } = useCharacter(characterId, {
      enabled: shouldLoad,
    });
    const { data: allCharacters = [] } = useCharacters();

    if (!shouldLoad || isLoading) {
      return (
        <div ref={ref} className="w-full h-full bg-muted p-8">
          <Skeleton className="w-full h-full" />
        </div>
      );
    }

    const borderColor = character?.primaryColor
      ? `border-${character.primaryColor.hue}-${character.primaryColor.shade}`
      : 'border-violet-700';

    const imageUrl = character?.activeImage
      ? `/uploads/characters/${characterId}/${character.activeImage}`
      : null;

    // Get related character names for relationships
    const getCharacterName = (charId: string) => {
      return allCharacters.find((c) => c._id === charId)?.name || 'Unknown';
    };

    return (
      <div
        ref={ref}
        className="w-full h-full p-6 md:p-8 overflow-y-auto bg-amber-50"
      >
        {/* Circular character image at top */}
        <div className="flex justify-center mb-6">
          <div
            className={cn('w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-8', borderColor)}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={character?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-4xl md:text-5xl">
                  {character?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Character name - decorative */}
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-1 uppercase tracking-wide">
          {character?.name}
        </h2>

        {/* Species - small text below name */}
        {character?.species && (
          <p className="text-base md:text-lg text-center text-muted-foreground mb-1">
            {character.species}
          </p>
        )}

        {/* Created date - below species */}
        {character?.creationDate && (
          <p className="text-sm md:text-base text-center text-muted-foreground mb-6 md:mb-8">
            {character.creationDate}
          </p>
        )}

        {/* Information sections with strong borders */}
        <div className="space-y-4">
          {/* Two-column grid for compact info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">

            {/* Color palette display */}
            {character?.primaryColor && (
              <div className={cn('border-4 p-3 rounded-lg', borderColor)}>
                <h3 className="text-base md:text-lg font-bold uppercase tracking-wider mb-2">
                  Colors
                </h3>
                <div className="flex gap-2 flex-wrap">
                  <div
                    className={cn(
                      'w-8 h-8 md:w-10 md:h-10 rounded',
                      getColorClasses(character.primaryColor)
                    )}
                  />
                  {character.secondaryColors?.map((color, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'w-8 h-8 md:w-10 md:h-10 rounded',
                        getColorClasses(color)
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {character?.relationships && character.relationships.length > 0 && (
              <div className={cn('border-4 p-3 rounded-lg', borderColor)}>
                <h3 className="text-sm md:text-base font-bold uppercase tracking-wide mb-2">
                  Relationships
                </h3>
                <ul className="space-y-1">
                  {character.relationships.map((rel, idx) => (
                    <li key={idx} className="text-xs md:text-sm">
                      <span className="font-semibold capitalize">
                        {rel.relationshipType}:
                      </span>{' '}
                      <button
                        onClick={() => onNavigateToCharacter(rel.characterId)}
                        className="text-blue-600 underline hover:text-blue-800 font-medium"
                      >
                        {getCharacterName(rel.characterId)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Personality - full width */}
          {character?.personality && (
            <div className={cn('border-4 p-3 md:p-4 rounded-lg', borderColor)}>
              <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider mb-2">
                Personality
              </h3>
              <p className="text-sm md:text-base leading-relaxed">
                {character.personality}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

InfoPage.displayName = 'InfoPage';
