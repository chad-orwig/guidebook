import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { CharacterCard } from '@/components/CharacterCard';
import { CharacterCardSkeleton } from '@/components/CharacterCardSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { useCharacters } from '@/hooks/useCharacters';

export const Route = createFileRoute('/characters/')({
  component: CharacterList,
});

function CharacterList() {
  const { data: characters, isLoading, error, refetch } = useCharacters();

  const handleDelete = (id: string) => {
    // TODO: Implement confirmation dialog in Task 5
    console.log('Delete character:', id);
  };

  return (
    <div className="container mx-auto p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Characters</h1>
            <p className="text-muted-foreground mt-1">
              Manage your characters
            </p>
          </div>
          <Button asChild>
            <Link to="/characters/new">New Character</Link>
          </Button>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CharacterCardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && <ErrorDisplay error={error} onRetry={() => refetch()} />}

        {!isLoading && !error && characters?.length === 0 && (
          <EmptyState
            title="No characters yet"
            description="Create your first character to get started"
          />
        )}

        {!isLoading && !error && characters && characters.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {characters.map((character) => (
              <CharacterCard
                key={character._id}
                character={character}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
