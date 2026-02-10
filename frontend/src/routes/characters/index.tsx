import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CharacterCard } from '@/components/CharacterCard';
import { CharacterCardSkeleton } from '@/components/CharacterCardSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { useCharacters, useDeleteCharacter, useCreateCharacter } from '@/hooks/useCharacters';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const Route = createFileRoute('/characters/')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: '/login' });
    }
  },
  component: CharacterList,
});

function CharacterList() {
  const { data: characters, isLoading, error, refetch } = useCharacters();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState('');
  const deleteMutation = useDeleteCharacter();
  const createMutation = useCreateCharacter();
  const navigate = useNavigate();

  const handleDelete = (id: string, name: string) => {
    setCharacterToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!characterToDelete) return;

    try {
      await deleteMutation.mutateAsync(characterToDelete.id);
      toast.success(`${characterToDelete.name} has been deleted`);
      setDeleteDialogOpen(false);
      setCharacterToDelete(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete character';
      toast.error(message);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setCharacterToDelete(null);
  };

  const handleCreateCharacter = async () => {
    if (!newCharacterName.trim()) {
      toast.error('Character name is required');
      return;
    }

    try {
      const result = await createMutation.mutateAsync({ name: newCharacterName });
      toast.success('Character created!');
      setCreateDialogOpen(false);
      setNewCharacterName('');
      navigate({ to: '/characters/$id/edit', params: { id: result._id } });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create character';
      toast.error(message);
    }
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
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>New Character</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Character</DialogTitle>
                <DialogDescription>
                  Enter a name for your character. You can add more details after creation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Character Name</Label>
                  <Input
                    id="name"
                    value={newCharacterName}
                    onChange={(e) => setNewCharacterName(e.target.value)}
                    placeholder="Enter character name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateCharacter();
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setNewCharacterName('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCharacter}
                  disabled={createMutation.isPending || !newCharacterName.trim()}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                onDelete={() => handleDelete(character._id, character.name)}
              />
            ))}
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Character</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{' '}
                <span className="font-semibold">{characterToDelete?.name}</span>?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDelete} disabled={deleteMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
