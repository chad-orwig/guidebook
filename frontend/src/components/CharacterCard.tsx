import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Pencil, Trash2 } from 'lucide-react';
import type { CharacterListItem } from '@guidebook/models';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getColorClasses } from '@/lib/colors';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CharacterCardProps {
  character: CharacterListItem;
  onDelete: (id: string) => void;
}

export function CharacterCard({ character, onDelete }: CharacterCardProps) {
  const colorClasses = getColorClasses(character.primaryColor);
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="overflow-hidden pt-0">
      {/* Active image or placeholder - clickable to edit */}
      <Link
        to="/characters/$id/edit"
        params={{ id: character._id }}
        className="relative block w-full aspect-square bg-muted flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
      >
        {character.activeImage && !imageError ? (
          <img
            src={`/uploads/characters/${character._id}/${character.activeImage}`}
            alt={character.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-6xl text-muted-foreground">
            {character.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Color indicator overlay */}
        {character.primaryColor && (
          <div
            className={cn(
              'absolute top-2 right-2 size-3 rounded-full',
              colorClasses
            )}
          />
        )}
      </Link>

      <CardHeader>
        <CardTitle className="truncate">{character.name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {character.species && (
          <div className="text-sm">
            <span className="text-muted-foreground">Species:</span>{' '}
            <span className="font-medium">{character.species}</span>
          </div>
        )}

        {character.creationDate && (
          <div className="text-sm text-muted-foreground">
            Created {formatDate(character.creationDate)}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button asChild variant="secondary" size="sm" className="flex-1">
          <Link to="/characters/$id/edit" params={{ id: character._id }}>
            <Pencil />
            Edit
          </Link>
        </Button>

        <Button
          variant="destructive"
          size="sm"
          className="flex-1"
          onClick={() => onDelete(character._id)}
        >
          <Trash2 />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
