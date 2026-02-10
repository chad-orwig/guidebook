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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={cn('size-3 rounded-full flex-shrink-0', colorClasses)} />
          <span className="truncate">{character.name}</span>
        </CardTitle>
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
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to="/characters/$id/edit" params={{ id: character._id }}>
            <Pencil />
            Edit
          </Link>
        </Button>

        <Button
          variant="outline"
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
