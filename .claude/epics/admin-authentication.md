# Admin Authentication

## Overview

This epic adds admin authentication to secure the application. On server startup, the system will read admin credentials from environment variables and create an admin user in MongoDB if one doesn't already exist. The backend will provide login/logout endpoints with session management, and the frontend will add a login page with protected routes that require authentication. Admin users can change their password after initial login, and all character management features will be restricted to authenticated admin users only.

**Key Documentation:**
- [Better Auth Hono Integration](https://www.better-auth.com/docs/integrations/hono)
- [MongoDB Adapter](https://www.better-auth.com/docs/adapters/mongodb)
- [Email/Password Authentication](https://www.better-auth.com/docs/authentication/email-password)
- [React Client Setup](https://www.better-auth.com/docs/concepts/client)
- [Session Management](https://www.better-auth.com/docs/concepts/session-management)
- [User Schema & Additional Fields](https://www.better-auth.com/docs/concepts/users-accounts)

## Tasks

- [ ] Install and configure Better Auth dependencies
- [ ] Set up environment variables for authentication
- [ ] Configure Better Auth with MongoDB adapter and user roles
- [ ] Create admin initialization on server startup
- [ ] Mount Better Auth handler to Hono application
- [ ] Add session middleware to Hono routes
- [ ] Protect existing character API endpoints
- [ ] Set up Better Auth React client
- [ ] Build login page UI
- [ ] Add protected route components for frontend
- [ ] Update character routes to require authentication
- [ ] Create password change functionality

## Task Details

### 1. Install and configure Better Auth dependencies

**Requirements:**
- Install Better Auth package for backend
- Install Better Auth React client for frontend
- Install MongoDB driver if not already present
- Ensure all dependencies are compatible with Bun runtime
- Add type definitions for TypeScript support

**Implementation:**
- Backend (`/Users/chad/dev/guidebook/backend`):
  ```bash
  cd backend
  bun add better-auth mongodb
  ```
- Frontend (`/Users/chad/dev/guidebook/frontend`):
  ```bash
  cd frontend
  bun add better-auth
  ```
- Verify MongoDB driver is installed (likely already present from character management)
- All packages are compatible with Bun runtime (Better Auth officially supports Bun)
- TypeScript types are included with Better Auth packages

### 2. Set up environment variables for authentication

**Requirements:**
- Define authentication secret (minimum 32 characters)
- Set base URL for the application
- Configure initial admin credentials (email and password)
- Add MongoDB connection string if not already configured
- Create separate `.env.example` file for documentation
- Ensure sensitive values are not committed to version control

**Implementation:**
- Create/update `backend/.env`:
  ```bash
  # Generate secret with: openssl rand -base64 32
  BETTER_AUTH_SECRET=<generated_32+_character_secret>
  BETTER_AUTH_URL=http://localhost:3000

  # Admin initialization
  ADMIN_EMAIL=admin@example.com
  ADMIN_PASSWORD=<secure_initial_password>

  # MongoDB (likely already configured)
  MONGODB_URI=mongodb://localhost:27017/guidebook
  ```
- Create `backend/.env.example` (template without secrets):
  ```bash
  BETTER_AUTH_SECRET=your_secret_here_min_32_chars
  BETTER_AUTH_URL=http://localhost:3000
  ADMIN_EMAIL=admin@example.com
  ADMIN_PASSWORD=your_secure_password
  MONGODB_URI=mongodb://localhost:27017/guidebook
  ```
- Verify `.env` is in `.gitignore` (should already be present)
- Production values will use different secrets and URLs

### 3. Configure Better Auth with MongoDB adapter and user roles

**Requirements:**
- Create Better Auth configuration file
- Connect to existing MongoDB database
- Configure email/password authentication
- Add custom "role" field to user model (values: "user" | "admin")
- Set role field to be non-editable by users during signup
- Configure session management settings
- Enable experimental features for MongoDB performance optimization
- Set up TypeScript type inference for user model

**Implementation:**
- Create `backend/src/lib/auth.ts`
- Configure MongoDB adapter using existing connection string
- Enable email/password authentication with min 8 character password
- Add custom "role" field using `additionalFields` with `input: false` to prevent user modification
- Set session expiration to 7 days with cookie caching enabled
- Enable `experimental.joins: true` for MongoDB performance
- Export type inference: `typeof auth.$Infer.Session`
- Reference: [User Schema docs](https://www.better-auth.com/docs/concepts/users-accounts), [MongoDB adapter docs](https://www.better-auth.com/docs/adapters/mongodb)

### 4. Create admin initialization on server startup

**Requirements:**
- Read admin credentials from environment variables on server startup
- Check if an admin user already exists in the database
- If no admin exists, create one with credentials from environment variables
- Set the created user's role to "admin"
- Log initialization status (admin created vs already exists)
- Handle errors gracefully (invalid credentials, database connection issues)
- Ensure this runs before the server starts accepting requests

**Implementation:**
- Create `backend/src/lib/init-admin.ts`
- Check MongoDB `user` collection for existing admin by email
- If not found, use `auth.api.signUpEmail()` to create user
- Update user document to set `role: "admin"` using MongoDB client
- Call `initializeAdmin()` in `backend/src/index.ts` before starting server (use `await`)
- Log success/skip status, throw errors to prevent server start if initialization fails
- Reference: [Server API usage](https://www.better-auth.com/docs/concepts/api)

### 5. Mount Better Auth handler to Hono application

**Requirements:**
- Mount Better Auth authentication handler to Hono app
- Configure routes for auth endpoints (login, logout, session, etc.)
- Set up CORS middleware for auth routes to allow frontend requests
- Enable credentials (cookies) in CORS configuration
- Ensure auth routes are accessible before other middleware
- Handle both GET and POST requests for auth endpoints

**Implementation:**
- Update `backend/src/index.ts`
- Add CORS middleware BEFORE auth routes with `credentials: true`
- Mount auth handler: `app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))`
- Configure CORS origin to match frontend URL (likely `http://localhost:5173` for dev)
- Better Auth automatically handles all auth endpoints (login, logout, session, etc.)
- Reference: [Hono integration example](https://hono.dev/examples/better-auth)

### 6. Add session middleware to Hono routes

**Requirements:**
- Create middleware to retrieve session from Better Auth
- Inject user and session data into Hono context for all routes
- Make user/session data accessible in route handlers via `c.get()`
- Handle cases where no session exists (unauthenticated requests)
- Add TypeScript types for context variables
- Apply middleware globally to all routes

**Implementation:**
- Update `backend/src/index.ts`
- Add Hono type definition for context variables: `Hono<{ Variables: { user: ..., session: ... } }>`
- Create global middleware using `app.use("*", async (c, next) => {...})`
- Call `auth.api.getSession({ headers: c.req.raw.headers })` to retrieve session
- Set user and session in context: `c.set("user", session?.user ?? null)`
- Apply after CORS but before route handlers
- Reference: [Hono integration docs](https://www.better-auth.com/docs/integrations/hono)

### 7. Protect existing character API endpoints

**Requirements:**
- Verify user authentication before processing character requests
- Return 401 Unauthorized for unauthenticated requests
- Optionally check user role (admin only)
- Protect all character CRUD endpoints (Create, Read, Update, Delete, List)
- Protect character image upload and management endpoints
- Maintain existing functionality for authenticated users
- Provide clear error messages for failed authentication

**Implementation:**
- Create `backend/src/middleware/auth.ts` with `requireAuth` middleware
- Check `c.get("user")` exists, return 401 if null
- Optionally create `requireAdmin` middleware to check `user.role === "admin"`
- Update `backend/src/routes/characters.ts` to apply middleware to all character routes
- Apply to existing routes: GET list, GET by ID, POST create, PATCH update, DELETE, and all image routes
- Middleware runs before route handlers, blocking unauthenticated access

### 8. Set up Better Auth React client

**Requirements:**
- Create Better Auth client configuration in frontend
- Configure base URL to point to backend server
- Set up type inference for user model with custom role field
- Export authentication client for use in components
- Export useSession hook for accessing auth state
- Enable credentials (cookies) for cross-origin requests
- Ensure client works with existing TanStack Router setup

**Implementation:**
- Create `frontend/src/lib/auth-client.ts`
- Use `createAuthClient` from `better-auth/react`
- Set `baseURL` to backend URL (e.g., `http://localhost:3000`)
- Use `inferAdditionalFields` plugin to add role field type support
- Export `authClient` and destructure `useSession` hook
- Export types: `typeof authClient.$Infer.Session` and `User`
- Credentials are automatically included in requests
- Reference: [React client docs](https://www.better-auth.com/docs/concepts/client)

### 9. Build login page UI

**Requirements:**
- Create login route and page component
- Email input field with validation
- Password input field (secure/hidden)
- Login button with loading state
- Display error messages for failed login attempts
- Redirect to character list on successful login
- Show loading state while authenticating
- Use shadcn/ui components for consistent styling
- Prevent access to login page if already authenticated

**Implementation:**
- Create `frontend/src/routes/login.tsx` using TanStack Router file-based routing
- Use shadcn/ui components: Card, Input, Button, Label
- Call `authClient.signIn.email({ email, password })` on form submit
- Handle error states and display error messages using toast or inline error
- Use `useNavigate()` from TanStack Router to redirect to `/characters` on success
- Check `useSession()` - if already authenticated, redirect away from login page
- Add loading state during authentication attempt
- Use existing toast notification system for error messages

### 10. Add protected route components for frontend

**Requirements:**
- Create reusable component to protect routes requiring authentication
- Check authentication status using useSession hook
- Redirect unauthenticated users to login page
- Show loading state while checking authentication
- Optionally support role-based access control (admin only routes)
- Preserve intended destination for redirect after login
- Work seamlessly with TanStack Router

**Implementation:**
- Create `frontend/src/components/ProtectedRoute.tsx`
- Use `useSession()` hook to check authentication state
- Show loading skeleton/spinner while `isPending` is true
- Use TanStack Router's `Navigate` component to redirect to `/login` if no session
- Accept optional `requireRole` prop for role-based access control
- Return `children` if authenticated and authorized
- Alternatively, use TanStack Router's `beforeLoad` function in route definitions for protection
- Reference: [Protected routes pattern](https://ui.dev/react-router-protected-routes-authentication)

### 11. Update character routes to require authentication

**Requirements:**
- Wrap character list page with authentication protection
- Wrap character edit/create routes with authentication protection
- Ensure unauthenticated users cannot access character management
- Redirect to login page when accessing protected routes without auth
- Maintain existing functionality for authenticated users
- Update navigation to hide/show links based on auth state

**Implementation:**
- Update character route files: `frontend/src/routes/characters/index.tsx`, `frontend/src/routes/characters/$id/edit.tsx`
- Wrap route components with `<ProtectedRoute>` component
- Alternatively, add `beforeLoad` hook to route definitions to check authentication before loading
- Update root layout or navigation component to use `useSession()` and conditionally render navigation links
- Add logout button in navigation that calls `authClient.signOut()`
- If user is not authenticated, hide character management links and show login link

### 12. Create password change functionality

**Requirements:**
- Add password change form in user settings or profile area
- Current password field for verification
- New password field with validation (minimum length)
- Confirm new password field
- Submit button with loading state
- Display success message on successful password change
- Display error messages for incorrect current password or validation failures
- Optionally revoke other sessions when password is changed
- Use Better Auth's built-in password change functionality
- Use shadcn/ui components for UI consistency

**Implementation:**
- Create `frontend/src/routes/profile.tsx` for user profile page
- Add link to profile page from landing page navigation (only visible when authenticated)
- Use shadcn/ui components: Card, Input, Button, Label
- Display user information (email, name) and password change form
- Add three input fields: current password, new password, confirm password
- Validate new password meets minimum length (8 characters) and matches confirmation
- Call `authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })`
- Display success toast on successful change
- Display error toast if current password is incorrect or validation fails
- Add loading state during password change request
- Reference: [Email/password auth docs](https://www.better-auth.com/docs/authentication/email-password)

