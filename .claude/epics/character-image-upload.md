# Character Image Upload

## Overview

This epic adds image upload and management functionality for character profiles. Users will be able to upload multiple images per character, which will be stored in filesystem directories named after each character's MongoDB ID. The system will support swapping between multiple images for display, and automatically delete all images when a character is removed. This provides visual richness to character profiles while maintaining data integrity between the database and filesystem.

## Tasks

- [x] Update character model for image tracking
- [x] Set up filesystem storage and cleanup
- [x] Create image upload API endpoint
- [x] Create image management API endpoints
- [x] Build image upload UI component
- [x] Implement image display and selection

## Task Details

### 1. Update character model for image tracking

**Requirements:**
- Add field to store array of image filenames
- Add field to track which image is currently active/primary
- Update Zod schema with proper validation
- Handle empty/undefined values in code (no defaults needed, like other optional fields)

**Implementation:**
- Update `models/src/character.ts`:
  - Add `images: z.array(z.string()).max(20).optional()` to CharacterSchema
  - Add `activeImage: z.string().optional()` to CharacterSchema
  - Add Zod refinement: validate that if `activeImage` is set, it must exist in the `images` array
  - Images array stores filenames only (e.g., `["abc123.jpg", "def456.png"]`)
  - ActiveImage stores just the filename (e.g., `"abc123.jpg"`)
  - Frontend will build full path using convention: `/uploads/characters/{characterId}/{filename}`
- Update CharacterListItemSchema to include `activeImage` field for list view
- No changes needed to CreateCharacterSchema or UpdateCharacterSchema (inherited via .partial())

### 2. Set up filesystem storage and cleanup

**Requirements:**
- Directory structure: `/uploads/characters/{characterId}/`
- Auto-create directories on first image upload
- Delete entire character directory when character is deleted
- Unique filename generation to prevent conflicts
- Allowed file types: jpg, jpeg, png, gif, webp
- File size limit: 15MB per image
- Handle filesystem errors gracefully

**Implementation:**
- Create `backend/src/lib/storage.ts` utility module with:
  - `getCharacterUploadDir(characterId: string): string` - returns relative path `./uploads/characters/{characterId}` from backend root
  - `ensureUploadDir(characterId: string): Promise<void>` - creates directory if it doesn't exist (using `fs.mkdir` with `recursive: true`)
  - `generateUniqueFilename(originalFilename: string): string` - generates unique filename using timestamp + random string + original extension (e.g., `1234567890-abc123.jpg`)
  - `deleteCharacterImages(characterId: string): Promise<void>` - deletes entire character directory (using `fs.rm` with `recursive: true, force: true`)
  - `deleteImageFile(characterId: string, filename: string): Promise<void>` - deletes specific file
  - `fileExists(characterId: string, filename: string): Promise<boolean>` - checks if file exists on filesystem
  - `validateImageType(mimetype: string): boolean` - validates MIME type against allowed list
- Use Bun's built-in `fs` module for all filesystem operations
- Handle errors with try/catch and proper error messages
- Update DELETE `/api/characters/:id` endpoint to call `deleteCharacterImages(characterId)` before deleting character document
- Create `./uploads/characters/` base directory on server startup - check Hono docs for best practices on startup initialization
- Add error handling for disk space issues (catch ENOSPC errors)
- Handle missing files: When serving images or listing character data, verify files exist and remove missing filenames from database array
- Configure Hono to serve static files from `./uploads` directory

### 3. Create image upload API endpoint

**Requirements:**
- Endpoint: `POST /api/characters/:id/images`
- Accept multipart/form-data file uploads
- Use Hono's max upload size setting to enforce file size limit (15MB)
- Stream files directly to disk (never load entire file into memory)
- Validate file type based on content (magic bytes/MIME), not just extension
- Save file to character's filesystem directory
- Generate unique, safe filename
- Add filename to character's images array in database
- Return updated character data with new image
- Error handling: invalid files, disk space, permissions

**Implementation:**
- Add endpoint `POST /:id/images` to `backend/src/routes/characters.ts`
- Configure Hono body limit middleware: `app.use('/:id/images', bodyLimit({ maxSize: 15 * 1024 * 1024 }))` (15MB)
- Use `c.req.parseBody()` to get multipart form data
- Extract file from request: `const file = await c.req.file('image')` or similar
- Validate character exists in database before processing upload
- Check if character already has 20 images (return 400 error if at limit)
- Validate file type by reading magic bytes (file signature):
  - Use `file-type` npm package to detect actual file type from buffer
  - Check detected type against allowed types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
  - Reject files that don't match allowed image types, regardless of extension or MIME type
- Generate unique filename using storage utility (preserve correct extension based on detected type)
- Ensure upload directory exists for character
- Stream file to disk using Bun's `Bun.write()` or similar streaming method
- Update character document:
  - Add filename to `images` array using `$push`
  - Set `activeImage` to this new filename (all new uploads become active)
- Return updated character document with `toCharacterDocument()` helper
- Error handling:
  - 400: Invalid file type, file too large, or at image limit
  - 404: Character not found
  - 500: Filesystem errors (disk space, permissions)
- **Research required before implementation:** Check Hono documentation for multipart/form-data file upload handling - determine if native support exists or if additional packages are needed

### 4. Create image management API endpoints

**Requirements:**
- `PATCH /api/characters/:id/images/active` - set which image is active/primary
- `DELETE /api/characters/:id/images/:filename` - delete specific image
- Update character document when active image changes
- Remove file from filesystem on delete
- Remove filename from database array on delete
- Error handling: file not found, permission denied
- Validate character ownership/existence
- Note: Image list and active image are returned in regular `GET /api/characters/:id` response

**Implementation:**
- Add endpoints to `backend/src/routes/characters.ts`:

**PATCH /:id/images/active:**
- Accept JSON body with `filename` field using zValidator
- Validate character exists
- Verify filename exists in character's images array
- Update character document: `{ $set: { activeImage: filename } }`
- Return updated character document
- Error handling: 400 (filename not in images array), 404 (character not found)

**DELETE /:id/images/:filename:**
- Extract characterId and filename from route params
- Validate character exists and fetch current character data
- Verify filename exists in character's images array
- Delete file from filesystem using storage utility
- Remove filename from images array: `{ $pull: { images: filename } }`
- If deleted image was active, set new active image:
  - After removing from array, get last image in remaining array (most recent upload)
  - If array is now empty, set `activeImage` to `undefined`
  - Use `$set: { activeImage: newActiveImage }` in same update operation
- Return updated character document
- Error handling: 404 (character or file not found), 500 (filesystem errors)

### 5. Build image upload UI component

**Requirements:**
- File input for selecting images from device
- Drag-and-drop upload support
- Upload progress indicator
- Display grid/list of uploaded images with thumbnails
- Visual indicator for which image is active
- Delete button for each image
- Integrate into character create/edit form
- Empty state message when no images
- Client-side validation (file type, size)
- Error messages for failed uploads

**Implementation:**
- Create `frontend/src/components/ImageUpload.tsx` component
- Props: `characterId: string`, `images: string[]`, `activeImage: string | undefined`, `onUploadComplete: () => void`
- Use `react-dropzone` for drag-and-drop functionality
- File input accepts: `accept="image/jpeg,image/png,image/gif,image/webp"`
- Client-side validation before upload:
  - Check file size < 15MB
  - Check file type matches accepted types
  - Check current images.length < 20
  - Show error toast if validation fails
- Upload implementation:
  - Create FormData with file: `formData.append('image', file)`
  - Use TanStack Query mutation for POST `/api/characters/:id/images`
  - Show upload progress using mutation state
  - On success: call `onUploadComplete()` to trigger parent refetch
  - On error: show error toast with message
- Display uploaded images as thumbnails in horizontal row:
  - Map over `images` array to render thumbnails
  - Build image URL: `/uploads/characters/${characterId}/${filename}`
  - Use shadcn/ui Card or similar for thumbnail container
  - Highlight active image thumbnail with border/background
  - Add delete button (trash icon) on each thumbnail
  - Click thumbnail to set as active (call PATCH endpoint)
  - Delete button calls DELETE endpoint with confirmation
- Add upload button at end of thumbnail row:
  - Render as empty box with plus sign icon (same size as thumbnails)
  - Clicking opens file picker or drag-and-drop activates
  - Keep upload functionality and display in same component
- If no images exist, show just the upload box with plus sign
- Loading states: Skeleton or spinner while uploading
- Use shadcn/ui components: Button, Card, Skeleton
- Integrate into CharacterForm component (add after other form fields)

### 6. Implement image display and selection

**Requirements:**

Character List Page (`/characters`):
- Display active/primary image in each character card
- Show placeholder/default if character has no images
- Handle broken/missing images gracefully
- Responsive image sizing for card layout
- Consider aspect ratio handling (crop, contain, cover)

Character Create/Edit Form (`/characters/new` and `/characters/:id/edit`):
- Display active/primary image prominently in top left (dossier-style)
- Show all uploaded images as clickable thumbnails in a horizontal row below the active image
- Visual highlight on thumbnail indicating which image is currently active
- Click thumbnail to set as active image (updates the large preview)
- Loading states while images load
- Handle broken/missing images gracefully
- Show placeholder in top left if no active image set

**Implementation:**

**Character List Page:**
- Update `frontend/src/routes/characters/index.tsx`
- Update CharacterListItemSchema in models to include `activeImage` field
- Update backend list endpoint projection to include `activeImage`
- In character card component:
  - If `character.activeImage` exists, display image: `<img src={`/uploads/characters/${character._id}/${character.activeImage}`} />`
  - If no activeImage, show placeholder using shadcn/ui Avatar or similar with initials/icon
  - Use CSS `object-fit: cover` for consistent aspect ratio
  - Add `onError` handler to show placeholder if image fails to load
  - Style image to fit card layout (e.g., fixed height, responsive width)
- Card design is flexible - decide on image placement during implementation (top with overlay, left side, etc.)

**Character Creation Flow Changes:**
- Remove `/characters/new` route entirely
- Update character list page to replace "New Character" link with modal dialog:
  - Create `CreateCharacterModal` component using shadcn/ui Dialog
  - Modal contains single input field for character name (required)
  - Save button creates character with just the name
  - On successful creation, navigate to `/characters/:id/edit` with new character ID
  - Cancel button closes modal
- Add shadcn/ui Dialog component if not already installed

**Character Edit Form:**
- Update `frontend/src/components/CharacterForm.tsx` - remove create mode, only handle edit mode
- CharacterForm now only accepts edit mode with required `characterId` prop
- Layout: Flexible layout with image section in top left area
- Large active image display (dossier-style):
  - If `character.activeImage` exists, show large preview (e.g., 200x300px or similar)
  - Build URL: `/uploads/characters/${characterId}/${character.activeImage}`
  - Use `object-fit: cover` or `object-fit: contain` for aspect ratio
  - Show placeholder (avatar with icon) if no active image
  - Add `onError` handler for broken images
- Thumbnail row below large image:
  - Map over `character.images` array
  - Render horizontal row of thumbnails (flexbox with gap)
  - Each thumbnail: small image (e.g., 60x60px), clickable
  - Highlight active thumbnail with border (e.g., `border-2 border-primary`)
  - Click handler calls PATCH endpoint to set as active
  - Use cursor-pointer for clickable indication
  - Show loading state on thumbnail being set as active
- Integrate ImageUpload component at end of thumbnail row (plus sign box)
- Use shadcn/ui components: Card, AspectRatio, Dialog for images
- Remove all create mode logic from CharacterForm

