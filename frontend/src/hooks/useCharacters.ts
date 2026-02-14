import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CharacterListItem, CharacterDocument, UpdateCharacter } from '@guidebook/models';

export function useCharacters() {
  return useQuery<CharacterListItem[], Error>({
    queryKey: ['characters'],
    queryFn: () => api.characters.list({ sortBy: 'name', sortOrder: 'asc' }),
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

export function useCharacter(id: string, options?: { enabled?: boolean }) {
  return useQuery<CharacterDocument, Error>({
    queryKey: ['characters', id],
    queryFn: () => api.characters.get(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.characters.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
}

export function useUpdateCharacter(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCharacter) => api.characters.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['characters', id] });
    },
  });
}

export function useUploadImage(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => api.characters.uploadImage(characterId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['characters', characterId] });
    },
  });
}

export function useSetActiveImage(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filename: string) => api.characters.setActiveImage(characterId, filename),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['characters', characterId] });
    },
  });
}

export function useDeleteImage(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filename: string) => api.characters.deleteImage(characterId, filename),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['characters', characterId] });
    },
  });
}
