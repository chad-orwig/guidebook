import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CharacterListItem } from '@guidebook/models';

export function useCharacters() {
  return useQuery<CharacterListItem[], Error>({
    queryKey: ['characters'],
    queryFn: api.characters.list,
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.characters.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
}
