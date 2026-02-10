import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { fileTypeFromBuffer } from 'file-type';
import {
  CreateCharacterSchema,
  UpdateCharacterSchema,
  type CharacterDocument,
  type CharacterListItem,
} from '@guidebook/models';
import { getDatabase } from '@/lib/db';
import {
  deleteCharacterImages,
  ensureUploadDir,
  generateUniqueFilename,
  getCharacterUploadDir,
  validateImageType,
  deleteImageFile,
  ALLOWED_MIME_TYPES,
} from '@/lib/storage';
import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';

const app = new Hono();

// Helper function to convert MongoDB document to CharacterDocument
function toCharacterDocument(doc: any): CharacterDocument {
  return {
    ...doc,
    _id: doc._id.toString(),
    relationships: doc.relationships?.map((rel: any) => ({
      ...rel,
      characterId: rel.characterId.toString(),
    })),
  };
}

// POST / - Create new character
app.post('/', zValidator('json', CreateCharacterSchema), async (c) => {
  const data = c.req.valid('json');
  const db = await getDatabase();
  const collection = db.collection('characters');

  // Convert relationship characterIds to ObjectId
  const docToInsert = {
    ...data,
    relationships: data.relationships?.map((rel) => ({
      ...rel,
      characterId: new ObjectId(rel.characterId),
    })),
  };

  const result = await collection.insertOne(docToInsert);
  const created = await collection.findOne({ _id: result.insertedId });

  return c.json(toCharacterDocument(created), 201);
});

// Query schema for list endpoint
const ListQuerySchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// GET / - List all characters (only id and name)
app.get('/', zValidator('query', ListQuerySchema), async (c) => {
  const { sortBy, sortOrder } = c.req.valid('query');
  const db = await getDatabase();
  const collection = db.collection('characters');

  // Build sort object
  const sort: any = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  }

  const characters = await collection
    .find({}, {
      projection: {
        _id: 1,
        name: 1,
        species: 1,
        creationDate: 1,
        primaryColor: 1,
        activeImage: 1,
      },
    })
    .sort(sort)
    .toArray();

  const result: CharacterListItem[] = characters.map((char) => ({
    _id: char._id.toString(),
    name: char.name,
    species: char.species,
    creationDate: char.creationDate,
    primaryColor: char.primaryColor,
    activeImage: char.activeImage,
  }));

  return c.json(result, 200);
});

// GET /:id - Get single character by ID
app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const db = await getDatabase();
  const collection = db.collection('characters');

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch (error) {
    return c.json({ error: 'Invalid character ID' }, 400);
  }

  const character = await collection.findOne({ _id: objectId });

  if (!character) {
    return c.json({ error: 'Character not found' }, 404);
  }

  return c.json(toCharacterDocument(character), 200);
});

// PUT /:id - Update existing character
app.put('/:id', zValidator('json', UpdateCharacterSchema), async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const db = await getDatabase();
  const collection = db.collection('characters');

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch (error) {
    return c.json({ error: 'Invalid character ID' }, 400);
  }

  // Convert relationship characterIds to ObjectId if present
  const updateData = {
    ...data,
    relationships: data.relationships?.map((rel) => ({
      ...rel,
      characterId: new ObjectId(rel.characterId),
    })),
  };

  const result = await collection.findOneAndUpdate(
    { _id: objectId },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  if (!result) {
    return c.json({ error: 'Character not found' }, 404);
  }

  return c.json(toCharacterDocument(result), 200);
});

// POST /:id/images - Upload image
app.post('/:id/images', async (c) => {
  const id = c.req.param('id');
  const db = await getDatabase();
  const collection = db.collection('characters');

  // Validate character ID format
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch (error) {
    return c.json({ error: 'Invalid character ID' }, 400);
  }

  // Check if character exists and get current data
  const character = await collection.findOne({ _id: objectId });
  if (!character) {
    return c.json({ error: 'Character not found' }, 404);
  }

  // Check image limit (max 20 images per character)
  const currentImages = character.images || [];
  if (currentImages.length >= 20) {
    return c.json(
      {
        error: 'Maximum image limit reached (20 images per character)',
      },
      400
    );
  }

  // Parse multipart form data
  const body = await c.req.parseBody();
  const file = body['image'];

  if (!file || typeof file === 'string') {
    return c.json({ error: 'No image file provided' }, 400);
  }

  // Check file size (15MB limit)
  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes
  if (file.size > MAX_FILE_SIZE) {
    return c.json(
      {
        error: 'File size exceeds 15MB limit',
      },
      400
    );
  }

  // Read file buffer for magic byte validation
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Detect actual file type using magic bytes
  const detectedType = await fileTypeFromBuffer(buffer);

  if (!detectedType || !validateImageType(detectedType.mime)) {
    return c.json(
      {
        error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      },
      400
    );
  }

  try {
    // Generate unique filename based on detected type
    const filename = generateUniqueFilename(detectedType.mime);

    // Ensure upload directory exists
    await ensureUploadDir(id);

    // Write file to disk
    const uploadDir = getCharacterUploadDir(id);
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Update character document: add to images array and set as active
    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      {
        $push: { images: filename },
        $set: { activeImage: filename },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      // Clean up uploaded file if database update fails
      try {
        await deleteImageFile(id, filename);
      } catch (e) {
        console.error('Failed to clean up file after db error:', e);
      }
      return c.json({ error: 'Failed to update character' }, 500);
    }

    return c.json(toCharacterDocument(result), 200);
  } catch (error) {
    console.error('Upload error:', error);

    // Handle disk space errors
    if ((error as NodeJS.ErrnoException).code === 'ENOSPC') {
      return c.json({ error: 'Insufficient disk space' }, 500);
    }

    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

// PATCH /:id/images/active - Set active image
app.patch(
  '/:id/images/active',
  zValidator('json', z.object({ filename: z.string() })),
  async (c) => {
    const id = c.req.param('id');
    const { filename } = c.req.valid('json');
    const db = await getDatabase();
    const collection = db.collection('characters');

    // Validate character ID
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return c.json({ error: 'Invalid character ID' }, 400);
    }

    // Get character to verify filename exists in images array
    const character = await collection.findOne({ _id: objectId });
    if (!character) {
      return c.json({ error: 'Character not found' }, 404);
    }

    // Check if filename exists in images array
    const images = character.images || [];
    if (!images.includes(filename)) {
      return c.json(
        {
          error: 'Image not found in character images',
        },
        400
      );
    }

    // Update active image
    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: { activeImage: filename } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return c.json({ error: 'Failed to update active image' }, 500);
    }

    return c.json(toCharacterDocument(result), 200);
  }
);

// DELETE /:id/images/:filename - Delete specific image
app.delete('/:id/images/:filename', async (c) => {
  const id = c.req.param('id');
  const filename = c.req.param('filename');
  const db = await getDatabase();
  const collection = db.collection('characters');

  // Validate character ID
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch (error) {
    return c.json({ error: 'Invalid character ID' }, 400);
  }

  // Get character to verify filename exists
  const character = await collection.findOne({ _id: objectId });
  if (!character) {
    return c.json({ error: 'Character not found' }, 404);
  }

  const images = character.images || [];
  if (!images.includes(filename)) {
    return c.json({ error: 'Image not found' }, 404);
  }

  // Delete file from filesystem
  try {
    await deleteImageFile(id, filename);
  } catch (error) {
    console.error('Failed to delete file:', error);
    // Continue with database update even if file deletion fails
  }

  // Remove from images array and update activeImage if needed
  const remainingImages = images.filter((img: string) => img !== filename);
  const wasActive = character.activeImage === filename;

  // Determine new active image
  let newActiveImage: string | undefined;
  if (wasActive && remainingImages.length > 0) {
    // Set last image (most recent) as new active
    newActiveImage = remainingImages[remainingImages.length - 1];
  } else if (!wasActive) {
    // Keep current active image
    newActiveImage = character.activeImage;
  }
  // else: no images left, activeImage becomes undefined

  // Update database
  const result = await collection.findOneAndUpdate(
    { _id: objectId },
    {
      $pull: { images: filename },
      $set: { activeImage: newActiveImage },
    },
    { returnDocument: 'after' }
  );

  if (!result) {
    return c.json({ error: 'Failed to update character' }, 500);
  }

  return c.json(toCharacterDocument(result), 200);
});

// DELETE /:id - Delete character
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const db = await getDatabase();
  const collection = db.collection('characters');

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch (error) {
    return c.json({ error: 'Invalid character ID' }, 400);
  }

  const result = await collection.deleteOne({ _id: objectId });

  if (result.deletedCount === 0) {
    return c.json({ error: 'Character not found' }, 404);
  }

  // Delete character images from filesystem
  try {
    await deleteCharacterImages(id);
  } catch (error) {
    console.error('Failed to delete character images:', error);
    // Don't fail the request if image deletion fails
  }

  return c.body(null, 204);
});

export default app;
