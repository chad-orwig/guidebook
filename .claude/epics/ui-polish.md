# UI Polish

## Overview

This epic focuses on professional polish and refinement across three key areas. We'll implement favicons and meta tags for proper branding and SEO. The color palette and typography will be refined for better visual appeal and consistency. Navigation will be audited and enhanced to ensure all portions of the site are reachable and the user flow makes logical sense.

## Tasks

- [x] Implement favicons
- [x] Fix page title and basic meta tags
- [x] Update color palette
- [x] Update typography and fonts
- [x] Redesign landing page and navigation

## Task Details

### 1. Implement favicons

#### Requirements
- Research and select appropriate Vite favicon plugin
- Install and configure the plugin
- Provide source favicon image or generate one
- Configure plugin to generate favicons for various devices and sizes

#### Implementation
- **Read documentation**: https://github.com/peterekjs/vite-plugin-favicons
- Create favicon source image from emoji (use online tool or SVG generator)
- Install: `bun add -D @peterek/vite-plugin-favicons`
- Add to `frontend/vite.config.ts`:
  ```typescript
  import favicons from '@peterek/vite-plugin-favicons'

  // In plugins array:
  favicons('src/assets/icon.svg') // or path to favicon source image
  ```
- Add `<!-- FAVICONS -->` comment in `frontend/index.html` `<head>` section as injection point
- Place generated favicon source image at specified path
- Plugin will generate multiple formats and inject favicon tags at build time

### 2. Fix page title and basic meta tags

#### Requirements
- Update page title to reflect the application name
- Add viewport meta tag for responsive design
- Add description and other basic meta tags as needed

#### Implementation
- Update `frontend/index.html` `<head>` section:
  - Change `<title>` tag to application name
  - Verify `<meta name="viewport">` exists for responsive design
  - Add `<meta name="description">` with brief app description
  - Add `<meta charset="UTF-8">` if not present
  - Consider adding theme-color meta tag for browser chrome

### 3. Update color palette

#### Requirements
- Review current color usage across the application
- Select new color palette that fits the theme/style
- Update Tailwind CSS theme configuration with new colors

#### Implementation
- Review current colors in `frontend/tailwind.config.js` (shadcn/ui theme section)
- Review existing component color usage across the app
- Select new color palette (use shadcn/ui theming guidelines: https://ui.shadcn.com/docs/theming)
- Update CSS variables in `frontend/src/index.css` (HSL color values for shadcn theme)
- Test color changes across all components

### 4. Update typography and fonts

#### Requirements
- Choose appropriate fonts for headings and body text
- Add font imports (Google Fonts, local files, etc.)
- Update Tailwind CSS theme configuration with new typography settings
- Ensure font changes are applied consistently across all components

#### Implementation
- Select fonts (Google Fonts recommended for easy integration)
- Add font imports to `frontend/index.html` `<head>` via Google Fonts link tags
- Update `frontend/tailwind.config.js` to add custom font families in `theme.extend.fontFamily`
- Update base styles or components to use new font families
- Test font rendering across all pages and components

### 5. Redesign landing page and navigation

#### Application Structure
The app has three main sections:
1. **Guidebook** (landing page) - Browse characters (public access)
2. **Profile** - Change password (requires login)
3. **Manage** - Create/edit characters (requires login)

#### Navigation Plan

**When NOT logged in:**
- Landing page shows guidebook (title only for now - viewer not yet designed)
- Small, unobtrusive login button with `LogIn` icon

**When logged in:**
- Logout button with `LogOut` icon
- Three icon-only navigation buttons to navigate between sections:
  - **Guidebook**: `BookOpenText` icon - browse/view characters
  - **Profile**: `User` icon - change password
  - **Manage**: `Wrench` icon - create/edit characters
- Only show buttons for the OTHER two sections (not current section)

#### Requirements
- Update landing page (/) to be guidebook viewer (show title for now)
- Create icon-only navigation component
- Use lucide-react icons:
  - Login: `LogIn`
  - Logout: `LogOut`
  - Profile: `User`
  - Manage: `Wrench`
  - Guidebook: `BookOpenText`
- Position navigation unobtrusively (corner or edge)
- Show/hide navigation based on auth state and current route
- Ensure buttons only show for sections user isn't currently in

#### Implementation
- Update landing page route (/) to show guidebook placeholder
- Create NavigationButtons component with icon-only buttons
- Import lucide-react icons: `LogIn`, `LogOut`, `User`, `Wrench`, `BookOpenText`
- Add conditional rendering based on auth state and current route
- Position navigation in fixed corner (top-right suggested)
- Style buttons to be small and unobtrusive
- Test navigation flow between all three sections
