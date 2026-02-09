# Backend API

## Overview

This epic establishes the Hono-based backend API that manages character data and serves the frontend. The API will provide RESTful endpoints for creating, reading, updating, and deleting character profiles stored in MongoDB. It will handle data validation, business logic, and serve as the single source of truth for all character information in the guidebook application.

## Tasks

- [ ] Shared models package setup
- [ ] Define character model schemas
- [ ] Character CRUD endpoints
- [ ] Error handling and middleware

## Task Details

### 1. Shared models package setup
**Requirements:**
- Create new package in monorepo structure that can be imported by both frontend and backend
- Configure TypeScript for type generation from Zod schemas
- Setup build process to compile and make package available to other workspaces
- Export types and schemas for use across the application

**Implementation:**
- Run `bun init` in `models/` directory to create new package
- Update `models/package.json`:
  - Set name to `@guidebook/models`
  - Add `zod` dependency
  - Configure exports field to point to built files
- Update root `package.json` workspaces array to include `"models"`
- Add models package to frontend and backend dependencies: `"@guidebook/models": "workspace:*"`
- Create `models/src/index.ts` as main export file

### 2. Define character model schemas
**Requirements:**
- Define Zod schema for character entity with all required and optional fields
- Generate TypeScript types from schemas for type safety
- Include validation rules (required fields, string lengths, data formats)
- Character fields:
  - **name** (required, string)
  - **creationDate** (optional, date/string)
  - **species** (optional, string)
  - **personality** (optional, string, a few lines)
  - **primaryColor** (optional, string, HTML color code validation)
  - **secondaryColors** (optional, array of HTML color codes)
  - **relationships** (optional, array of objects):
    - characterId (MongoDB ObjectId reference)
    - relationshipType (enum: parent, child, spouse, sibling, friend, enemy)

**Implementation:**
- Create `models/src/character.ts`
- **Note: MongoDB ObjectIds will be represented as hex strings (24 chars) in all DTOs/schemas**
  - MongoDB stores as ObjectId, but API layer uses string representation
  - Backend handles conversion between string ↔ ObjectId at database boundary
- Define `RelationshipTypeEnum = z.enum(['parent', 'child', 'spouse', 'sibling', 'friend', 'enemy'])`
- Define `CharacterRelationshipSchema`:
  - `characterId: z.string()` (MongoDB ObjectId as hex string)
  - `relationshipType: RelationshipTypeEnum`
- Define base `CharacterSchema` (domain model, no `_id`):
  - `name: z.string().min(1)`
  - `creationDate: z.string().datetime().optional()`
  - `species: z.string().optional()`
  - `personality: z.string().optional()`
  - `primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()`
  - `secondaryColors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).optional()`
  - `relationships: z.array(CharacterRelationshipSchema).optional()`
- Create derived schemas using Zod helpers per coding standards:
  - `CharacterDocumentSchema = CharacterSchema.extend({ _id: z.string() })` (ObjectId as hex string)
  - `CreateCharacterSchema = CharacterSchema`
  - `UpdateCharacterSchema = CharacterSchema.partial()`
- Export all schemas and inferred TypeScript types
- Export from `models/src/index.ts`

### 3. Character CRUD endpoints
**Requirements:**
- POST /api/characters - Create new character
- GET /api/characters - List all characters (returns only id and name)
  - Support sorting by any single property in ascending or descending direction
  - Query params: sortBy, sortOrder (asc/desc)
- GET /api/characters/:id - Get single character by ID (full character data)
- PUT /api/characters/:id - Update existing character
- DELETE /api/characters/:id - Delete character
- Request/response validation using shared Zod schemas
- Proper HTTP status codes and response formats

**Implementation:**
- Follow [Hono Best Practices](https://hono.dev/docs/guides/best-practices) for building larger applications
- Install `@hono/zod-validator` for automatic Zod validation middleware
- Create `backend/src/routes/characters.ts` as modular route file
  - Create new Hono instance: `const app = new Hono()`
  - Import `zValidator` from `@hono/zod-validator`
  - Import schemas from `@guidebook/models`
  - Write handlers directly after route definitions (not separate controllers) for proper type inference
  - Export the Hono app: `export default app`
- **POST /** - Create character:
  - Use `zValidator('json', CreateCharacterSchema)` middleware
  - Access validated data with `c.req.valid('json')`
  - Insert into MongoDB (`insertOne` auto-generates `_id`)
  - Convert ObjectId to hex string in response
  - Return 201 with created character
- **GET /** - List characters:
  - Create schema for query validation (sortBy, sortOrder)
  - Use `zValidator('query', querySchema)` middleware
  - Get validated params with `c.req.valid('query')`
  - Query MongoDB with projection `{ _id: 1, name: 1 }` and dynamic sort
  - Convert ObjectIds to hex strings
  - Return 200 with array
- **GET /:id** - Get single character:
  - Convert ID param to ObjectId, query MongoDB
  - Return 404 if not found, otherwise 200 with full character
- **PUT /:id** - Update character:
  - Use `zValidator('json', UpdateCharacterSchema)` middleware
  - Access validated data with `c.req.valid('json')`
  - Use `findOneAndUpdate`, return 404 if not found
  - Return 200 with updated character
- **DELETE /:id** - Delete character:
  - Use `deleteOne`, return 404 if not found
  - Return 204 on success
- In `backend/src/index.ts`:
  - Separate existing health check into `backend/src/routes/health.ts`
  - Mount character routes: `app.route('/api/characters', charactersRoutes)`
  - Mount health routes: `app.route('/health', healthRoutes)`
  - Follow Hono best practice of using `app.route()` only in index.ts

### 4. Error handling and middleware
**Requirements:**
- Global error handler for consistent error responses
- Validation error handling with detailed field-level errors
- MongoDB error handling (connection issues, duplicate keys, etc.)
- Request logging middleware
- CORS configuration for frontend communication
- Type-safe error responses

**Implementation:**
- Create `backend/src/middleware/errorHandler.ts`:
  - Use Hono's `app.onError()` for global error handling
  - Check for Zod validation errors (from `zValidator` middleware)
  - Format Zod errors with field-level details
  - Handle MongoDB errors:
    - Duplicate key errors (code 11000) → 409 Conflict
    - Connection errors → 500 Internal Server Error
  - Return consistent error response format: `{ error: string, details?: any }`
  - Use appropriate HTTP status codes
- Create `backend/src/middleware/logger.ts`:
  - Use Hono's built-in logger middleware or create custom
  - Log request method, path, timestamp
  - Log response status and duration
- Configure CORS:
  - Use Hono's built-in CORS middleware
  - Allow frontend origin (localhost during development, production URL in production)
  - Configure allowed methods, headers, credentials if needed
- Apply middleware in `backend/src/index.ts`:
  - `app.use('*', logger())`
  - `app.use('*', cors({ ... }))`
  - `app.onError(errorHandler)`
- Define error response schema in `@guidebook/models` for type safety

