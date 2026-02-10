import { mkdir, rm, unlink, access } from 'node:fs/promises';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { constants } from 'node:fs';

const UPLOADS_BASE_DIR = './uploads/characters';

// Allowed MIME types for validation
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

// Extension mapping for detected MIME types
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

/**
 * Get the upload directory path for a character
 */
export function getCharacterUploadDir(characterId: string): string {
  return join(UPLOADS_BASE_DIR, characterId);
}

/**
 * Ensure upload directory exists for a character
 */
export async function ensureUploadDir(characterId: string): Promise<void> {
  const dir = getCharacterUploadDir(characterId);
  await mkdir(dir, { recursive: true });
}

/**
 * Generate unique filename with timestamp and random string
 */
export function generateUniqueFilename(detectedMimeType: string): string {
  const timestamp = Date.now();
  const randomString = randomBytes(8).toString('hex');
  const extension = MIME_TO_EXT[detectedMimeType] || 'bin';
  return `${timestamp}-${randomString}.${extension}`;
}

/**
 * Delete entire character directory with all images
 */
export async function deleteCharacterImages(characterId: string): Promise<void> {
  const dir = getCharacterUploadDir(characterId);
  try {
    await rm(dir, { recursive: true, force: true });
  } catch (error) {
    // Ignore errors if directory doesn't exist
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Delete a specific image file
 */
export async function deleteImageFile(
  characterId: string,
  filename: string
): Promise<void> {
  const filePath = join(getCharacterUploadDir(characterId), filename);
  await unlink(filePath);
}

/**
 * Check if image file exists on filesystem
 */
export async function fileExists(
  characterId: string,
  filename: string
): Promise<boolean> {
  const filePath = join(getCharacterUploadDir(characterId), filename);
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate MIME type against allowed list
 */
export function validateImageType(mimetype: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimetype);
}

/**
 * Initialize uploads directory on server startup
 */
export async function initializeUploadsDir(): Promise<void> {
  await mkdir(UPLOADS_BASE_DIR, { recursive: true });
  console.log('✅ Uploads directory initialized');
}
