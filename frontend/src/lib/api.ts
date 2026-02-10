import type {
  CharacterDocument,
  CharacterListItem,
  CreateCharacter,
  UpdateCharacter,
} from '@guidebook/models';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, error.error || 'Request failed');
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const api = {
  characters: {
    list: () => fetchApi<CharacterListItem[]>('/api/characters'),
    get: (id: string) => fetchApi<CharacterDocument>(`/api/characters/${id}`),
    create: (data: CreateCharacter) =>
      fetchApi<CharacterDocument>('/api/characters', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateCharacter) =>
      fetchApi<CharacterDocument>(`/api/characters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/api/characters/${id}`, {
        method: 'DELETE',
      }),
  },
};

export { ApiError };
