import { z } from 'zod';

// Relationship type enum
export const RelationshipTypeEnum = z.enum([
  'parent',
  'child',
  'spouse',
  'sibling',
  'friend',
  'enemy',
]);

// Character relationship schema
export const CharacterRelationshipSchema = z.object({
  characterId: z.string(), // MongoDB ObjectId as hex string
  relationshipType: RelationshipTypeEnum,
});

// Base character schema (domain model, no _id)
export const CharacterSchema = z.object({
  name: z.string().min(1),
  creationDate: z.string().datetime().optional(),
  species: z.string().optional(),
  personality: z.string().optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  secondaryColors: z
    .array(z.string().regex(/^#[0-9A-Fa-f]{6}$/))
    .optional(),
  relationships: z.array(CharacterRelationshipSchema).optional(),
});

// Derived schemas
export const CharacterDocumentSchema = CharacterSchema.extend({
  _id: z.string(), // MongoDB ObjectId as hex string
});

export const CreateCharacterSchema = CharacterSchema;

export const UpdateCharacterSchema = CharacterSchema.partial();

// Export TypeScript types
export type RelationshipType = z.infer<typeof RelationshipTypeEnum>;
export type CharacterRelationship = z.infer<typeof CharacterRelationshipSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type CharacterDocument = z.infer<typeof CharacterDocumentSchema>;
export type CreateCharacter = z.infer<typeof CreateCharacterSchema>;
export type UpdateCharacter = z.infer<typeof UpdateCharacterSchema>;
