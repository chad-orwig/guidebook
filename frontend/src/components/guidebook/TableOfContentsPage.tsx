import React, { forwardRef } from 'react';
import type { CharacterListItem } from '@guidebook/models';

interface TableOfContentsPageProps {
  characters: CharacterListItem[];
  pageOffset: number;
  onNavigateToCharacter: (characterId: string) => void;
}

export const TableOfContentsPage = forwardRef<
  HTMLDivElement,
  TableOfContentsPageProps
>(({ characters, pageOffset, onNavigateToCharacter }, ref) => {
  return (
    <div
      ref={ref}
      className="w-full h-full p-6 md:p-12 bg-amber-50 overflow-y-auto"
    >
      {/* Decorative title */}
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 md:mb-12 uppercase tracking-widest border-b-4 border-violet-700 pb-4">
        Characters
      </h1>

      {/* Character list */}
      <div className="space-y-3 md:space-y-4">
        {characters.map((character, idx) => {
          // Calculate page number for this character
          const pageNumber = pageOffset + idx * 2;

          return (
            <div
              key={character._id}
              className="flex items-baseline gap-2 group"
            >
              <button
                onClick={() => onNavigateToCharacter(character._id)}
                className="text-left text-base md:text-xl font-medium text-blue-700 hover:text-blue-900 underline decoration-2 underline-offset-4 transition-colors flex-shrink-0"
              >
                {character.name}
              </button>
              <div className="flex-1 border-b-2 border-dotted border-gray-300 mb-1" />
              <span className="text-base md:text-xl font-bold text-gray-600 flex-shrink-0">
                {pageNumber}
              </span>
            </div>
          );
        })}
      </div>

      {/* Decorative footer */}
      <div className="mt-8 md:mt-12 text-center text-sm text-gray-500 italic">
        ~ Guidebook ~
      </div>
    </div>
  );
});

TableOfContentsPage.displayName = 'TableOfContentsPage';
