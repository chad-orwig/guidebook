# Character Management UI

## Overview

This epic builds the frontend interface for managing characters in the guidebook application. Users will be able to create new characters, view a list of all characters, edit existing character details, and delete characters. The UI will integrate with the existing backend CRUD API and provide form validation, error handling, and a smooth user experience using React, TanStack Router, and TanStack Query.

## Tasks

- [ ] Create landing page
- [ ] Set up character management routes
- [ ] Create character list page
- [ ] Create character form (create/edit)
- [ ] Implement character deletion

## Task Details

### 1. Create landing page

**Requirements:**
- Route at `/` (root path)
- Two main navigation options:
  - "Manage Characters" button/link (navigates to `/characters`)
  - "View Guidebook" button/link (disabled/placeholder for now)
- Default/catch-all route handling - unknown routes should redirect to `/` and update URL
- Check TanStack Router documentation for built-in catch-all or fallback route features

**Implementation:**
- Create `frontend/src/routes/index.tsx` for root route using TanStack Router file-based routing
- Use shadcn/ui Button components for navigation options
- Use TanStack Router `<Link>` for navigation to `/characters`
- Research and implement TanStack Router catch-all route (likely `frontend/src/routes/$.tsx` or similar)
- Add redirect logic in catch-all route to navigate to `/` and replace URL

### 2. Set up character management routes

**Requirements:**
- Route for character list page (`/characters`)
- Route for creating a new character (`/characters/new`)
- Route for editing a character (`/characters/:id/edit`)
- Proper route configuration using TanStack Router
- Create dummy/placeholder pages for each route to verify routing works
- Navigation structure between routes

**Implementation:**
- Create route files using TanStack Router file-based routing:
  - `frontend/src/routes/characters/index.tsx` (list page)
  - `frontend/src/routes/characters/new.tsx` (create page)
  - `frontend/src/routes/characters/$id/edit.tsx` (edit page with dynamic id param)
- Add placeholder components with simple text/heading to verify routing
- Use TanStack Router `<Link>` components for navigation between routes
- Test all routes work and params are passed correctly

### 3. Create character list page

**Requirements:**
- Update character model to use Tailwind color names instead of hex values
- Update backend list endpoint to return additional fields: `species`, `creationDate`, `primaryColor`
- Display all characters fetched from `GET /api/characters`
- Card design:
  - Card background set to character's primary color using Tailwind classes
  - Card header: character name
  - Card content: species and creation date
  - Edit and Delete buttons
- Loading state while fetching data
- Empty state when no characters exist ("No characters yet, create one!")
- Button/link to navigate to create new character (always visible)
- Error handling for failed API requests

**Implementation:**
- Update character model `models/src/character.ts`:
  - Change `primaryColor` and `secondaryColors` validation from hex regex to Tailwind color name format (e.g., `red-600`, `violet-300`)
  - Add Zod enum or regex pattern to validate Tailwind color names
- Update backend `backend/src/routes/characters.ts` list endpoint:
  - Change projection from `{ _id: 1, name: 1 }` to `{ _id: 1, name: 1, species: 1, creationDate: 1, primaryColor: 1 }`
  - Return these fields in the response
- Update `frontend/src/routes/characters/index.tsx` with full implementation
- Use TanStack Query `useQuery` to fetch characters from `GET /api/characters`
- Use shadcn/ui components:
  - Card/CardHeader/CardContent for character items
  - Button for actions (Create, Edit, Delete)
  - Skeleton for loading state
- Card styling:
  - Use Tailwind classes for background color: `bg-${character.primaryColor}` or default
  - Add Tailwind safelist configuration if needed for dynamic color classes
  - **NOTE**: Manual testing needed to decide between colored background, border, or color indicator for best readability
- Layout: "New Character" button at top, always visible
- Display in card header: character name
- Display in card content: species (hidden if empty), creation date (formatted, hidden if empty)
- Show empty state message when no characters ("No characters yet, create one!")
- Use TanStack Router `<Link>` to navigate to edit page
- Pass delete handler as prop (implementation in task 5)
- Show error message if query fails

### 4. Create character form (create/edit)

**Requirements:**
- Form fields for all character properties:
  - Name (required text input)
  - Creation date (optional date picker)
  - Species (optional text input)
  - Personality (optional textarea)
  - Primary color (optional Tailwind color selector)
  - Secondary colors (optional, allow adding/removing multiple Tailwind colors)
  - Relationships (optional, select character + relationship type)
- Form validation matching backend Zod schemas
- Handle both create mode (POST to `/api/characters`) and edit mode (PATCH to `/api/characters/:id`)
- Pre-populate form with existing data in edit mode
- Submit button with loading state
- Cancel button to navigate back
- Success message/redirect on successful submission
- Error handling and display validation errors

**Implementation:**
- Create shared form component in `frontend/src/components/CharacterForm.tsx`
- Use react-hook-form with Zod resolver for validation
- Import character schemas from `@guidebook/models` for validation
- Use shadcn/ui form components:
  - Form, FormField, FormItem, FormLabel, FormControl, FormMessage
  - Input for name, species
  - Textarea for personality (no character limit)
  - Custom color selector: grid of Tailwind color swatches (like Tailwind's color page, no gaps, clickable squares)
  - Date picker (may need to add shadcn component) - defaults to today's date but editable
  - Select for relationship type (parent, child, spouse, sibling, friend, enemy)
- Color picker implementation:
  - Create color grid component showing all Tailwind colors
  - Layout: colors arranged with no gaps, each square clickable
  - Accept any valid Tailwind color name (no predefined list restriction)
- Implement mode detection: check if route param `id` exists for edit mode
- Use TanStack Query:
  - `useQuery` to fetch character data in edit mode (`GET /api/characters/:id`)
  - `useMutation` for create (POST) and update (PATCH)
- **Autosave**: Save form data when user unfocuses a field (onBlur event)
- Handle form submission:
  - Call appropriate mutation based on mode
  - On success: show toast notification and navigate to `/characters`
  - On error: display validation errors in form
- Cancel button uses TanStack Router navigation to go back to `/characters`
- Secondary colors: dynamic field array with add/remove buttons
- Relationships:
  - Fetch character list for selection
  - **Hide relationships field if no other characters exist**
  - Show character name + relationship type selector

### 5. Implement character deletion

**Requirements:**
- Confirmation dialog before deletion ("Are you sure you want to delete [character name]?")
- Call DELETE endpoint (`/api/characters/:id`)
- Loading state during deletion
- Success feedback after deletion
- Error handling if deletion fails
- Automatically refresh character list after successful deletion

**Implementation:**
- Use shadcn/ui AlertDialog component for confirmation:
  - AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel
- Create delete handler in character list page:
  - Use TanStack Query `useMutation` for DELETE request to `/api/characters/:id`
  - Pass character id and name to dialog
  - Show loading state on delete button during mutation
- On mutation success:
  - Invalidate character list query to trigger refetch: `queryClient.invalidateQueries(['characters'])`
  - Show success toast notification
- On mutation error:
  - Show error toast notification with error message
- Dialog content: "Are you sure you want to delete {character.name}? This action cannot be undone."
- Action button: "Delete" (destructive variant)
- Cancel button: "Cancel"

