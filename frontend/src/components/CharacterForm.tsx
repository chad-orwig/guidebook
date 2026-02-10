import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  CreateCharacterSchema,
  type CreateCharacter,
  type UpdateCharacter,
} from '@guidebook/models';
import {
  useCharacter,
  useCharacters,
  useCreateCharacter,
  useUpdateCharacter,
} from '@/hooks/useCharacters';
import { debounce, cn } from '@/lib/utils';
import { getColorClasses } from '@/lib/colors';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ColorPicker } from '@/components/ColorPicker';
import { RelationshipField } from '@/components/RelationshipField';
import { Skeleton } from '@/components/ui/skeleton';

interface CharacterFormProps {
  mode: 'create' | 'edit';
  characterId?: string;
}

export function CharacterForm({ mode, characterId }: CharacterFormProps) {
  const navigate = useNavigate();

  const { data: character, isLoading: isLoadingCharacter } = useCharacter(
    characterId || ''
  );

  const { data: allCharacters = [] } = useCharacters();
  const availableCharacters = allCharacters.filter(
    (char) => char._id !== characterId
  );

  const createMutation = useCreateCharacter();
  const updateMutation = useUpdateCharacter(characterId || '');

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const form = useForm<CreateCharacter>({
    resolver: zodResolver(CreateCharacterSchema),
    defaultValues: {
      name: '',
      creationDate: new Date().toISOString().split('T')[0],
      species: '',
      personality: '',
      primaryColor: undefined,
      secondaryColors: [],
      relationships: [],
    },
  });

  useEffect(() => {
    if (mode === 'edit' && character) {
      form.reset({
        name: character.name,
        creationDate: character.creationDate?.split('T')[0],
        species: character.species,
        personality: character.personality,
        primaryColor: character.primaryColor,
        secondaryColors: character.secondaryColors || [],
        relationships: character.relationships || [],
      });
    }
  }, [character, mode, form]);

  const debouncedSave = useMemo(
    () =>
      debounce(async (data: UpdateCharacter) => {
        if (mode === 'edit') {
          setIsSaving(true);
          try {
            await updateMutation.mutateAsync(data);
            setLastSaved(new Date());
          } catch (error) {
            // Silently fail autosave
          } finally {
            setIsSaving(false);
          }
        }
      }, 300),
    [mode, updateMutation]
  );

  const handleFieldBlur = () => {
    if (mode === 'edit' && form.formState.isValid) {
      const data = form.getValues();
      debouncedSave(data);
    }
  };

  const onSubmit = async (data: CreateCharacter) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data);
        toast.success('Character created!');
      } else {
        await updateMutation.mutateAsync(data);
        toast.success('Character updated!');
      }
      navigate({ to: '/characters' });
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : 'An error occurred';
      toast.error(message);
      console.error('Form submission error:', error);
    }
  };

  if (mode === 'edit' && isLoadingCharacter) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {mode === 'edit' && (
          <div className="text-sm text-muted-foreground">
            {isSaving && 'Saving...'}
            {lastSaved && !isSaving && `Saved at ${lastSaved.toLocaleTimeString()}`}
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter character name"
                  onBlur={() => {
                    field.onBlur();
                    handleFieldBlur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="creationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Creation Date</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  onBlur={() => {
                    field.onBlur();
                    handleFieldBlur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="species"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Species</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., Human, Elf, Dragon"
                  onBlur={() => {
                    field.onBlur();
                    handleFieldBlur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="personality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Personality</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe the character's personality"
                  rows={4}
                  onBlur={() => {
                    field.onBlur();
                    handleFieldBlur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="primaryColor"
          render={({ field }) => (
            <FormItem>
              <ColorPicker
                label="Primary Color"
                value={field.value}
                onChange={(color) => {
                  field.onChange(color);
                  handleFieldBlur();
                }}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="secondaryColors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secondary Colors</FormLabel>
              <div className="space-y-2">
                {field.value?.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className={cn('w-8 h-8 rounded', getColorClasses(color))}
                    />
                    <span className="text-sm">
                      {color.hue}-{color.shade}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updated = field.value?.filter((_, i) => i !== index);
                        field.onChange(updated);
                        handleFieldBlur();
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                <ColorPicker
                  label="Add Secondary Color"
                  value={undefined}
                  onChange={(color) => {
                    if (color) {
                      field.onChange([...(field.value || []), color]);
                      handleFieldBlur();
                    }
                  }}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {availableCharacters.length > 0 && (
          <FormField
            control={form.control}
            name="relationships"
            render={({ field }) => (
              <FormItem>
                <RelationshipField
                  availableCharacters={availableCharacters}
                  value={field.value}
                  onChange={(relationships) => {
                    field.onChange(relationships);
                    handleFieldBlur();
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {mode === 'create' ? 'Create Character' : 'Save Changes'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/characters' })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
