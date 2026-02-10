import { createFileRoute } from '@tanstack/react-router';
import { CharacterForm } from '@/components/CharacterForm';

export const Route = createFileRoute('/characters/new')({
  component: NewCharacter,
});

function NewCharacter() {
  return (
    <div className="container mx-auto p-8">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Create New Character</h1>
        <CharacterForm mode="create" />
      </div>
    </div>
  );
}
