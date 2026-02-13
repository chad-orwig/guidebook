# Guidebook Viewer Interface

## Overview

The Guidebook Viewer Interface is the public-facing component that displays character profiles in an interactive book format. Users will be able to browse through their created characters with intuitive navigation, viewing character information and images in a polished, book-like presentation. This interface transforms the managed character data into an engaging visual experience, serving as the primary way to explore and share the guidebook. The viewer will be accessible without authentication, providing a clean reading experience separate from the admin management interface.

## Tasks

- [x] Set up react-pageflip with demo pages
- [x] Design big image page layout
- [x] Design information page layout
- [x] Integrate real character data into pages
- [x] Create table of contents
- [x] Add navigation and extra controls
- [x] Implement responsive design for mobile and desktop

## Task Details

### 1. Set up react-pageflip with demo pages

**Requirements:**
- Install and configure react-pageflip library ([docs](https://nodlik.github.io/react-pageflip/), wraps [StPageFlip](https://nodlik.github.io/StPageFlip/))
- Create guidebook viewer route at `/` (root path)
- Set up basic react-pageflip component with demo content
- Create 4-6 placeholder demo pages to test page flipping interaction
- Verify page turning animation and controls work correctly
- Establish basic page structure and sizing

**Implementation:**
- Review [react-pageflip documentation](https://nodlik.github.io/react-pageflip/) and [StPageFlip documentation](https://nodlik.github.io/StPageFlip/) to understand API and usage patterns
- Install react-pageflip: `bun add react-pageflip` in `frontend/` directory
- Update `frontend/src/routes/index.tsx` to replace the placeholder with guidebook viewer
- Import `HTMLFlipBook` from `react-pageflip`
- Configure props:
  - `width` and `height`: Set appropriate page dimensions (e.g., `width={600}` `height={800}`)
  - `size="stretch"`: Allow responsive sizing
  - `showCover={true}`: Display first/last pages as hard covers
  - `flippingTime={1000}`: Default animation duration
- Create demo pages structure:
  - Define pages as React components wrapped with `React.forwardRef` (required by library)
  - Create 4-6 simple demo pages with distinct content (e.g., "Page 1", "Page 2", etc.)
  - Add basic styling to pages (border, padding, background)
- Verify functionality:
  - Test page flipping via mouse drag
  - Test on touch device or browser dev tools
  - Confirm animations are smooth
- Note: The root route currently exists as a simple placeholder - this task will fully replace it

### 2. Design big image page layout

**Requirements:**
- Full-page image display with proper aspect ratio handling
- Character name display (position and styling)
- Styling consistent with book/guidebook aesthetic
- Handle missing images gracefully with placeholder
- Ensure image doesn't overflow page boundaries
- Consider page margins/padding for book feel

**Implementation:**
- Review existing image handling in `frontend/src/components/CharacterCard.tsx` and `frontend/src/components/ImageUpload.tsx` for patterns
- Review `frontend/src/hooks/useCharacters.ts` for data fetching patterns
- Create new component: `frontend/src/components/guidebook/ImagePage.tsx`
- Component should use `React.forwardRef` (required for react-pageflip pages)
- Accept props: `characterId: string`, `shouldLoad: boolean` (controls when to fetch data)
- Data fetching:
  - Use `useCharacter(characterId)` hook with `enabled: shouldLoad` option for lazy loading
  - Show loading skeleton while data loads
- Image display:
  - Use `<img>` tag with `object-fit: cover` to fill the page
  - Image should take full page space (minus name block area)
  - Add subtle border/shadow for book aesthetic
- Character name block (bottom of page):
  - **Block element** with background color set to character's primary color
  - Background: Use `bg-{primaryColor.hue}-{primaryColor.shade}` from character data
  - Default background: `bg-violet-700` if no primary color
  - Text color: Use one of character's secondary colors that provides sufficient contrast
  - Contrast calculation: Check luminance and choose appropriate secondary color, or fall back to `text-violet-50` or `text-violet-950`
  - Typography: Large, bold font (e.g., `text-3xl font-bold`)
  - Padding: Adequate padding for readability (e.g., `p-4` or `p-6`)
- Missing image handling:
  - Show placeholder with character's primary color as background
  - Display a default icon from lucide-react (e.g., User, BookUser)
- Styling:
  - Use shadcn/ui theme colors
  - Ensure styling coordinates with information page (designed in next task)
- Image URL format: `/api/characters/{id}/images/{activeImage}` (from character data)

### 3. Design information page layout

**Requirements:**
- Display all character fields (name, description, age, birthday, species, gender, height, weight, occupation, etc.)
- **Strong visual borders** between sections for a stylized book aesthetic
- Layout should prioritize **fun and visual appeal** over pure readability
- Typography and spacing that feels like a character sheet or storybook page
- Styling consistent with book aesthetic and complements image page
- Handle optional/missing fields appropriately
- Page structure that keeps content within bounds

**Implementation:**
- Review character model in `models/src/character.ts` to see all available fields
- Review existing character display in `frontend/src/components/CharacterForm.tsx` for field patterns
- Create new component: `frontend/src/components/guidebook/InfoPage.tsx`
- Component should use `React.forwardRef` (required for react-pageflip pages)
- Accept props: `characterId: string`, `shouldLoad: boolean`, `onNavigateToCharacter: (characterId: string) => void` (callback to jump to character pages)
- Data fetching:
  - Use `useCharacter(characterId)` hook with `enabled: shouldLoad` option for lazy loading
  - Show loading skeleton while data loads
- Character fields to display (from model):
  - name (required)
  - creationDate (optional, format: YYYY-MM-DD)
  - species (optional)
  - personality (optional, can be long text)
  - primaryColor (optional, TailwindColor object)
  - secondaryColors (optional, array of TailwindColor objects)
  - relationships (optional, array with characterId and relationshipType)
- Page layout structure:
  - **Small circular character image** at top/middle of page
  - Image should be centered with circular frame/border (use `rounded-full`)
  - Size: modest (e.g., `w-32 h-32` or `w-40 h-40`)
  - Frame/border using character's primary color, or violet default
  - **Strong borders** around each content section using thick border classes (e.g., `border-4`, `border-8`)
  - Use character's primary color for section borders if available, otherwise violet
  - Decorative elements: corner flourishes, dividers, ornate frames
  - Section headers with bold, stylized typography
  - Content areas with distinct backgrounds (subtle shading or color tints)
- Typography:
  - Title/name: Very large and decorative (e.g., `text-4xl font-bold`)
  - Section headers: Medium-large with uppercase styling (e.g., `text-2xl uppercase tracking-wide`)
  - Content: Readable but stylized font size (e.g., `text-base` or `text-lg`)
- Color usage:
  - Use character's primary and secondary colors for accents and highlights
  - Apply color swatches display for primary/secondary colors
  - Default to violet theme if character has no colors
- Handle optional fields:
  - Only display sections that have data
  - Use placeholder text or omit section entirely if field is empty
- Relationships display:
  - Fetch related character names using their IDs (may need separate queries)
  - Display as "Parent: [Name]", "Friend: [Name]", etc.
  - **Make character names clickable** - clicking calls `onNavigateToCharacter(relatedCharacterId)` to jump to that character's pages
  - Style clickable names as links (underline, hover effects)
  - Handle case where related character may no longer exist
- Keep all content within page bounds with appropriate padding and margins

### 4. Integrate real character data into pages

**Requirements:**
- **Lazy loading approach**: Use List endpoint (`GET /api/characters`) to fetch character IDs and names only
- Generate page pairs for all characters (image page + info page) immediately using IDs
- **Lazy load full character data** only when pages are within one page of being viewed (in either direction)
- Show loading placeholder while character data loads
- Handle empty state when no characters exist
- Error handling for API failures
- Sort characters in consistent order

**Implementation:**
- Review `frontend/src/hooks/useCharacters.ts` which already provides `useCharacters()` for the list endpoint
- **IMPORTANT: Backend API endpoints must be accessible without authentication** for public guidebook viewer
  - Check `backend/src/routes/characters.ts` - currently uses `requireAuth` middleware
  - Need to either: remove auth requirement from GET endpoints, or create separate public endpoints
  - Image serving endpoint also needs to be public
- Update `frontend/src/routes/index.tsx` guidebook viewer component
- Initial data fetch:
  - Use `useCharacters()` hook to fetch character list (returns `CharacterListItem[]` with `_id`, `name`, `species`, `creationDate`, `primaryColor`, `activeImage`)
  - This provides character IDs and basic info without loading full character data
  - Sort characters by name or creation date (determine consistent order)
- Page generation:
  - Map over character list to create page pairs: `[ImagePage, InfoPage]` for each character
  - Pass `characterId` to each page component
  - Pass `shouldLoad={false}` initially for all pages
- Track current page state:
  - Use `onFlip` event from HTMLFlipBook to track current page index
  - Store current page index in state
- Lazy loading logic:
  - Calculate which pages should load based on current page
  - Pages within range: `currentPage - 2` to `currentPage + 2` (one page in either direction)
  - Update `shouldLoad` prop for pages in range to `true`
  - Pages outside range keep `shouldLoad={false}`
- Navigation callback:
  - Create `handleNavigateToCharacter(characterId)` function
  - Calculate target page index for character (find character in list, calculate page number)
  - Use HTMLFlipBook ref and call `pageFlip().turnToPage(targetPageIndex)`
  - Pass this callback to InfoPage components via `onNavigateToCharacter` prop
- Empty state handling:
  - If character list is empty, show "No characters yet" message
  - Provide link to `/characters` (admin page) to create characters
- Error handling:
  - Display error message if character list fetch fails
  - Show per-page errors if individual character data fetch fails
  - Use toast notifications for transient errors
- Loading state:
  - Show loading indicator while initial character list loads
  - Individual pages show skeleton loaders when their data is loading

### 5. Create table of contents

**Requirements:**
- **Table of contents as actual pages** in the book (not a separate overlay/modal)
- Display list of all characters as early pages in the book
- Support multiple TOC pages if needed based on number of characters
- Allow clicking character names to jump to their pages
- **Include empty page(s) as needed** to ensure character images appear on left pages and info on right pages
- Styling consistent with overall book theme and aesthetic

**Implementation:**
- Review existing page components (ImagePage, InfoPage) for styling consistency
- Create new component: `frontend/src/components/guidebook/TableOfContentsPage.tsx`
- Component should use `React.forwardRef` (required for react-pageflip pages)
- Accept props: `characters: CharacterListItem[]`, `startPage: number` (page number offset), `onNavigateToCharacter: (characterId: string) => void`
- TOC layout:
  - Title at top: "Table of Contents" or "Characters" in large, decorative font
  - List character names with page numbers
  - Clickable character names that call `onNavigateToCharacter(characterId)`
  - Style as links with hover effects
  - Consider two-column layout if space allows
  - Decorative borders and styling consistent with book theme
- Calculate pages needed:
  - Determine how many characters fit per TOC page (e.g., 10-15 depending on layout)
  - Create multiple TOC pages if character count exceeds capacity
  - Distribute characters evenly across TOC pages
- Page number display:
  - Calculate actual page number for each character in the book
  - Account for TOC pages themselves in calculation
  - Format: "Character Name ................. 15" (with dots or lines connecting to number)
- Empty page logic:
  - After TOC pages, insert empty page(s) if needed to ensure proper left/right alignment
  - Character images should appear on **left pages** (even page numbers in spread view)
  - Character info should appear on **right pages** (odd page numbers in spread view)
  - Calculate: if TOC ends on odd page, add one empty page; if even, no empty page needed
- Create empty page component: `frontend/src/components/guidebook/EmptyPage.tsx`
  - Simple page with subtle book texture or blank
  - Use `React.forwardRef`
- Integration in main viewer:
  - Insert TOC pages and empty page(s) at beginning of page array
  - Then add character page pairs (ImagePage, InfoPage)

### 6. Add navigation and extra controls

**Library Behavior** (react-pageflip provides these):
- Page flipping animation (mouse/touch drag)
- Touch gestures for mobile devices
- Programmatic navigation methods (`flipNext()`, `flipPrev()`, `turnToPage()`)
- State change events (`onFlip`, `onChangeState`)

**Custom Behavior to Add**:
- **Keyboard support** (arrow keys for page navigation) - not provided by library
- Current page indicator (e.g., "Page 5 of 24")
- Optional navigation buttons (previous/next) if desired beyond library's built-in touch/drag
- Verify library's mobile scroll support works as expected
- Controls positioned for easy access without obscuring content

**Reference**: [react-pageflip docs](https://nodlik.github.io/react-pageflip/), [StPageFlip docs](https://nodlik.github.io/StPageFlip/)

**Implementation:**
- Review HTMLFlipBook API in [react-pageflip documentation](https://nodlik.github.io/react-pageflip/) for method usage
- Update `frontend/src/routes/index.tsx` guidebook viewer component
- Create ref for HTMLFlipBook component:
  - `const bookRef = useRef<any>(null)`
  - Pass to HTMLFlipBook via `ref={bookRef}`
- Keyboard navigation:
  - Add `useEffect` to attach keyboard event listeners
  - Listen for `ArrowLeft` and `ArrowRight` keys
  - On ArrowRight: call `bookRef.current?.pageFlip()?.flipNext()`
  - On ArrowLeft: call `bookRef.current?.pageFlip()?.flipPrev()`
  - Clean up event listeners on unmount
  - Consider also supporting Space (next) and Shift+Space (prev)
- Page indicator:
  - Track current page with state: `const [currentPage, setCurrentPage] = useState(0)`
  - Use `onFlip` event from HTMLFlipBook to update: `onFlip={(e) => setCurrentPage(e.data)}`
  - Display indicator: "Page {currentPage + 1} of {totalPages}"
  - Position: bottom center of viewport, subtle styling, doesn't obscure content
  - Use fixed positioning so it stays visible during page flips
- Optional navigation buttons:
  - Create previous/next buttons positioned on left/right edges
  - Style as subtle, semi-transparent icons (e.g., ChevronLeft, ChevronRight from lucide-react)
  - Hide on mobile (touch gestures sufficient)
  - Show on hover on desktop
  - OnClick: call `flipPrev()` or `flipNext()`
- Verify library features:
  - Test `mobileScrollSupport` option works correctly
  - Test touch gestures on mobile devices
  - Verify page flip animations are smooth
- Styling:
  - Position controls to not obstruct book content
  - Use theme colors and subtle transparency
  - Ensure controls are accessible (keyboard focus, ARIA labels)

### 7. Implement responsive design for mobile and desktop

**Library Behavior** (react-pageflip provides these):
- Mobile device compatibility with touch support
- Automatic landscape and portrait orientation handling (`usePortrait` option)
- `mobileScrollSupport` option (enabled by default)
- Size modes: `fixed` or `stretch` with `autoSize` option

**Custom Behavior to Add**:
- **Verify** library's responsive behavior works as expected across devices
- **Verify** single-page view on mobile vs. two-page spread on desktop works correctly
- Test page layouts (image and info pages) render properly at various screen sizes
- Ensure text remains readable at different viewport sizes
- Adjust page content layouts for mobile if needed
- Test touch gestures work intuitively on mobile devices

**Reference**: [react-pageflip docs](https://nodlik.github.io/react-pageflip/), [StPageFlip docs](https://nodlik.github.io/StPageFlip/)

**Implementation:**
- Review [StPageFlip responsive documentation](https://nodlik.github.io/StPageFlip/) for configuration options
- Configure HTMLFlipBook props for responsive behavior:
  - `size="stretch"`: Allow book to scale with container
  - `autoSize={true}`: Automatically match parent element dimensions
  - `usePortrait={true}`: Enable portrait mode on mobile
  - `mobileScrollSupport={true}`: Allow content scrolling on mobile (default)
  - `minWidth`, `maxWidth`, `minHeight`, `maxHeight`: Set appropriate bounds for book dimensions
- Responsive container:
  - Wrap HTMLFlipBook in responsive container with max-width constraints
  - Use Tailwind classes: `container mx-auto` for centering
  - Add padding for mobile: `px-4 md:px-8`
  - Ensure container fills viewport: `min-h-screen`
- Test page content responsiveness:
  - **ImagePage component**: Verify images scale properly and maintain aspect ratio
  - **InfoPage component**: Test that content sections don't overflow at small sizes
  - **TOC pages**: Ensure character list remains readable and clickable
- Font size adjustments:
  - Use Tailwind responsive font sizes (e.g., `text-2xl md:text-4xl`)
  - Ensure minimum readable size on mobile
  - Test long character names and content wrap correctly
- Layout adjustments:
  - InfoPage: Consider single-column layout on mobile, multi-column on desktop
  - Adjust section padding/margins for smaller screens
  - Ensure circular image in InfoPage scales appropriately
- Mobile-specific testing:
  - Test touch gestures: swipe left/right for page flips
  - Verify single-page view on portrait mobile
  - Test two-page spread on landscape tablets and desktops
  - Ensure pinch-to-zoom is disabled or handled gracefully
  - Test that content doesn't trigger page scrolling when intending to flip
- Desktop testing:
  - Verify two-page spread displays correctly
  - Test keyboard navigation works
  - Ensure navigation buttons appear/hide correctly
- Cross-browser testing:
  - Test on Chrome, Firefox, Safari
  - Test on iOS Safari and Android Chrome
  - Verify page flip animations work smoothly across browsers
- Performance:
  - Monitor performance on lower-end mobile devices
  - Ensure lazy loading prevents memory issues with many characters
  - Test smooth animations even with image-heavy pages
