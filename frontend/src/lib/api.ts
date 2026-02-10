import type {
  CharacterDocument,
  CharacterListItem,
  CreateCharacter,
  UpdateCharacter,
} from '@guidebook/models';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
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
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));

    // Extract error message from various formats
    let message = 'Request failed';
    if (typeof errorData.error === 'string') {
      message = errorData.error;
    } else if (typeof errorData.error === 'object' && errorData.error?.message) {
      message = errorData.error.message;
    } else if (typeof errorData.message === 'string') {
      message = errorData.message;
    } else if (typeof errorData.error === 'object') {
      message = JSON.stringify(errorData.error);
    }

    throw new ApiError(response.status, message);
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
