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

// Tailwind color enums
export const TailwindHueEnum = z.enum([
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'gray',
]);

export const TailwindShadeEnum = z.enum([
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
]);

export const TailwindColorSchema = z.object({
  hue: TailwindHueEnum,
  shade: TailwindShadeEnum,
});

export type TailwindColor = z.infer<typeof TailwindColorSchema>;

// Character relationship schema
export const CharacterRelationshipSchema = z.object({
  characterId: z.string(), // MongoDB ObjectId as hex string
  relationshipType: RelationshipTypeEnum,
});

// Base character schema (domain model, no _id)
const CharacterBaseSchema = z.object({
  name: z.string().min(1),
  creationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  species: z.string().optional(),
  personality: z.string().optional(),
  primaryColor: TailwindColorSchema.optional(),
  secondaryColors: z.array(TailwindColorSchema).optional(),
  relationships: z.array(CharacterRelationshipSchema).optional(),
  images: z.array(z.string()).max(20).optional(),
  activeImage: z.string().optional(),
});

// Character schema with validation refinement
export const CharacterSchema = CharacterBaseSchema.refine(
  (data) => {
    // If activeImage is set, it must exist in images array
    if (data.activeImage && data.images) {
      return data.images.includes(data.activeImage);
    }
    // If activeImage is set but no images array, invalid
    if (data.activeImage && !data.images) {
      return false;
    }
    return true;
  },
  {
    message: "activeImage must be one of the images in the images array",
    path: ["activeImage"],
  }
);

// Derived schemas (use base schema to maintain .extend() and .partial() methods)
export const CharacterDocumentSchema = CharacterBaseSchema.extend({
  _id: z.string(), // MongoDB ObjectId as hex string
}).refine(
  (data) => {
    // Apply same validation to documents
    if (data.activeImage && data.images) {
      return data.images.includes(data.activeImage);
    }
    if (data.activeImage && !data.images) {
      return false;
    }
    return true;
  },
  {
    message: "activeImage must be one of the images in the images array",
    path: ["activeImage"],
  }
);

export const CreateCharacterSchema = CharacterBaseSchema;

export const UpdateCharacterSchema = CharacterBaseSchema.partial();

// Character list item schema (minimal data for list view)
export const CharacterListItemSchema = z.object({
  _id: z.string(),
  name: z.string(),
  species: z.string().optional(),
  creationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  primaryColor: TailwindColorSchema.optional(),
  activeImage: z.string().optional(),
});

export type CharacterListItem = z.infer<typeof CharacterListItemSchema>;

// Export TypeScript types
export type RelationshipType = z.infer<typeof RelationshipTypeEnum>;
export type CharacterRelationship = z.infer<typeof CharacterRelationshipSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type CharacterDocument = z.infer<typeof CharacterDocumentSchema>;
export type CreateCharacter = z.infer<typeof CreateCharacterSchema>;
export type UpdateCharacter = z.infer<typeof UpdateCharacterSchema>;
