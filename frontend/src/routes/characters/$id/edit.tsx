import { createFileRoute, redirect } from '@tanstack/react-router';
import { CharacterForm } from '@/components/CharacterForm';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/characters/$id/edit')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: '/login' });
    }
  },
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
