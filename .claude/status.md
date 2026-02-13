# Project Status

## Completed Work

### Project Initialization
- ✅ Repository structure created
- ✅ Frontend scaffolding (React + TanStack Router + TanStack Query)
- ✅ Backend scaffolding (Hono + Bun)
- ✅ MongoDB connection configured
- ✅ Docker setup for deployment

### Backend API
- ✅ Shared models package (`@guidebook/models`) with Zod schemas
- ✅ Character model schemas with validation
- ✅ Full CRUD API endpoints (Create, Read, List, Update, Delete)
- ✅ Request/response validation with Zod
- ✅ Error handling middleware
- ✅ Request logging middleware
- ✅ CORS configuration
- Epic: [backend-api.md](epics/backend-api.md)

### Character Management UI
- ✅ Landing page with navigation
- ✅ Character list page with card display
- ✅ Character form for create/edit with autosave
- ✅ Character deletion with confirmation dialog
- ✅ Form validation and error handling
- ✅ Loading states and toast notifications
- Epic: [character-management-ui.md](epics/character-management-ui.md)

### Character Image Upload
- ✅ Images stored in filesystem directories matching character MongoDB ID
- ✅ Support multiple images per character for swapping
- ✅ Delete directory when character is deleted
- ✅ Max 20 images per character, 15MB file size limit
- ✅ Magic byte validation for file types
- ✅ Modal-based character creation flow
- ✅ Drag-and-drop, paste (Ctrl/Cmd+V), and URL paste support
- ✅ Square aspect ratio with crop-to-fill across all views
- ✅ Clickable images in list view to enter edit mode
- ✅ Vite proxy configuration for consistent dev/prod routing
- Epic: [character-image-upload.md](epics/character-image-upload.md)

### Admin Authentication
- ✅ Better Auth integration with MongoDB adapter
- ✅ Username-based authentication with email/password plugin
- ✅ Admin user initialization from environment variables on startup
- ✅ Login page with session management (7-day session duration)
- ✅ Protected routes with `requireAuth` middleware
- ✅ Profile page with password change functionality
- ✅ Logout functionality with navigation guards
- ✅ Route protection via TanStack Router `beforeLoad` hooks
- Epic: [admin-authentication.md](epics/admin-authentication.md)

### Production Deployment
- ✅ Docker images for frontend (Bun + Caddy) and backend (Bun)
- ✅ Kubernetes manifests for TrueNAS Scale k3s deployment
- ✅ Kustomize templates with base and production overlay structure
- ✅ Deployment preparation script (`bun run deploy:prepare`)
- ✅ Comprehensive deployment documentation (DEPLOYMENT.md)
- Epic: [production-deployment.md](epics/production-deployment.md)

### UI Polish
- ✅ Professional polish and refinement across favicons, meta tags, colors, typography, and navigation
- Epic: [ui-polish.md](epics/ui-polish.md)

### Guidebook Viewer Interface
- ✅ Interactive book interface using react-pageflip
- ✅ Character image and info pages with lazy loading
- ✅ Table of contents with navigation
- ✅ Keyboard and touch controls
- ✅ Responsive design for mobile and desktop
- ✅ Public read-only access without authentication
- Epic: [guidebook-viewer-interface.md](epics/guidebook-viewer-interface.md)

## In Progress

## Not Started

## Known Bugs

### Date Input Calendar Widget - Cursor Not Showing (Firefox)
- **Severity**: Low (UI/UX polish)
- **Description**: Date input field calendar widget does not show pointer cursor on hover in Firefox
- **Browser Support**: Confirmed broken in Firefox; behavior unknown in Safari and other browsers
- **Attempted Fixes**:
  - Added global CSS rules for `input[type="date"]` with `cursor: pointer`
  - Added WebKit-specific pseudo-element styling for `::-webkit-calendar-picker-indicator`
  - Added `cursor: pointer` to Button component base classes
  - Implemented `showPicker()` on click (working correctly)
- **Impact**: Calendar widget opens correctly on click, but visual cursor feedback is missing
- **Next Steps**: May require browser-specific CSS or accept as browser limitation

---

*Last updated: 2026-02-13 - Guidebook Viewer Interface Epic Completed*
