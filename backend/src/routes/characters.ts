import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import {
  CreateCharacterSchema,
  UpdateCharacterSchema,
  type CharacterDocument,
} from '@guidebook/models';
import { getDatabase } from '@/lib/db';

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
    .find({}, { projection: { _id: 1, name: 1 } })
    .sort(sort)
    .toArray();

  const result = characters.map((char) => ({
    _id: char._id.toString(),
    name: char.name,
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

  return c.body(null, 204);
});

export default app;
