import { createFileRoute } from '@tanstack/react-router';
import { CharacterForm } from '@/components/CharacterForm';

export const Route = createFileRoute('/characters/$id/edit')({
  component: EditCharacter,
});

function EditCharacter() {
  const { id } = Route.useParams();

  return (
    <div className="container mx-auto p-8">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Edit Character</h1>
        <CharacterForm characterId={id} />
      </div>
    </div>
  );
}
