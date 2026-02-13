import { RelationshipTypeEnum, type CharacterRelationship, type CharacterListItem } from '@guidebook/models';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface RelationshipFieldProps {
  availableCharacters: CharacterListItem[];
  value?: CharacterRelationship[];
  onChange: (relationships: CharacterRelationship[]) => void;
}

export function RelationshipField({
  availableCharacters,
  value = [],
  onChange,
}: RelationshipFieldProps) {
  const relationshipTypes = RelationshipTypeEnum.options;

  if (availableCharacters.length === 0) {
    return null;
  }

  const addRelationship = () => {
    onChange([...value, { characterId: '', relationshipType: 'friend' }]);
  };

  const removeRelationship = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateRelationship = (index: number, updated: CharacterRelationship) => {
    onChange(value.map((rel, i) => (i === index ? updated : rel)));
  };

  return (
    <div className="space-y-4">
      <Label>Relationships</Label>

      <div className="space-y-2">
        {value.map((relationship, index) => (
          <div key={index} className="flex gap-2">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={relationship.characterId}
              onChange={(e) =>
                updateRelationship(index, {
                  ...relationship,
                  characterId: e.target.value,
                })
              }
            >
              <option value="">Select character...</option>
              {availableCharacters.map((char) => (
                <option key={char._id} value={char._id}>
                  {char.name}
                </option>
              ))}
            </select>

            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={relationship.relationshipType}
              onChange={(e) =>
                updateRelationship(index, {
                  ...relationship,
                  relationshipType: e.target.value as typeof relationship.relationshipType,
                })
              }
            >
              {relationshipTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            <Button
              type="button"
              onClick={() => removeRelationship(index)}
              variant="destructive"
              size="sm"
            >
              Remove
            </Button>
          </div>
        ))}

        <Button type="button" onClick={addRelationship} variant="outline" size="sm">
          Add Relationship
        </Button>
      </div>
    </div>
  );
}
