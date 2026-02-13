# UI Polish

## Overview

This epic focuses on professional polish and refinement across three key areas. We'll implement favicons and meta tags for proper branding and SEO. The color palette and typography will be refined for better visual appeal and consistency. Navigation will be audited and enhanced to ensure all portions of the site are reachable and the user flow makes logical sense.

## Tasks

- [ ] Implement favicons
- [ ] Fix page title and basic meta tags
- [ ] Update color palette
- [ ] Update typography and fonts
- [ ] Create site navigation map
- [ ] Implement navigation enhancements

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

### 5. Create site navigation map

#### Requirements
- Map all existing pages and routes in the application
- Document current navigation flows
- Identify gaps where pages aren't reachable or flow is unclear
- Design logical navigation structure and user flows
- Create sitemap showing how all pages connect

#### Implementation
- List all existing pages/routes in the application
- Design ideal navigation structure from user's perspective
- Create sitemap showing desired page hierarchy and connections
- Define navigation elements needed (nav bar, breadcrumbs, back buttons, etc.)
- Document the navigation design in epic file or separate diagram

### 6. Implement navigation enhancements

#### Requirements
- Add missing navigation links based on sitemap
- Implement breadcrumbs or back buttons where needed
- Ensure all sections of the site are reachable
- Verify logical user flow matches the designed sitemap

#### Implementation
- Implement navigation components based on sitemap design from Task 5
- Update layout components to include navigation elements
- Add TanStack Router `<Link>` components for navigation
- Implement nav bar, breadcrumbs, or back buttons as designed
- Test all navigation flows to ensure pages are reachable
- Verify navigation matches the designed sitemap
