import { createFileRoute, Link } from '@tanstack/react-router';
import { useRef, useState, useMemo, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { useCharacters } from '@/hooks/useCharacters';
import { ImagePage } from '@/components/guidebook/ImagePage';
import { InfoPage } from '@/components/guidebook/InfoPage';
import { TableOfContentsPage } from '@/components/guidebook/TableOfContentsPage';
import { EmptyPage } from '@/components/guidebook/EmptyPage';
import { FrontCover } from '@/components/guidebook/FrontCover';
import { BackCover } from '@/components/guidebook/BackCover';
import { GuidebookInstructions } from '@/components/guidebook/GuidebookInstructions';
import { Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: GuidebookPage,
});

type PageType =
  | { type: 'front-cover' }
  | { type: 'back-cover' }
  | { type: 'toc'; characters: any[]; pageOffset: number }
  | { type: 'empty' }
  | { type: 'image'; characterId: string }
  | { type: 'info'; characterId: string };

function GuidebookPage() {
  const { data: characters = [], isLoading } = useCharacters();
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [bookDimensions, setBookDimensions] = useState({
    width: 600,
    height: 800,
    usePortrait: false
  });

  // Comprehensive responsive breakpoint system
  useEffect(() => {
    const getBookConfig = (width: number) => {
      if (width < 640) {
        // Small mobile - portrait single page
        return { width: 280, height: 420, usePortrait: true };
      } else if (width < 768) {
        // Large mobile - portrait single page
        return { width: 320, height: 480, usePortrait: true };
      } else if (width < 900) {
        // Small tablet portrait - single page
        return { width: 380, height: 570, usePortrait: true };
      } else if (width < 1024) {
        // Large tablet portrait - single page
        return { width: 440, height: 660, usePortrait: true };
      } else if (width < 1280) {
        // Tablet landscape / Small desktop - two-page spread
        return { width: 450, height: 600, usePortrait: false };
      } else {
        // Desktop - two-page spread
        return { width: 600, height: 800, usePortrait: false };
      }
    };

    let timeoutId: number;
    const updateDimensions = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const config = getBookConfig(window.innerWidth);
        setBookDimensions(config);
      }, 100); // Debounce resize events
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Generate page structure
  const pages = useMemo<PageType[]>(() => {
    if (characters.length === 0) return [];

    const pageList: PageType[] = [];

    // 0. Add front cover
    pageList.push({ type: 'front-cover' });

    const charsPerTOCPage = 12;
    const tocPagesNeeded = Math.ceil(characters.length / charsPerTOCPage);

    // 1. Add TOC pages
    for (let i = 0; i < tocPagesNeeded; i++) {
      const startIdx = i * charsPerTOCPage;
      const endIdx = Math.min(startIdx + charsPerTOCPage, characters.length);
      // Page offset: front cover (1) + TOC pages + trailing blank if needed
      const pageOffset = 1 + tocPagesNeeded + (tocPagesNeeded % 2 !== 0 ? 1 : 0);
      pageList.push({
        type: 'toc',
        characters: characters.slice(startIdx, endIdx),
        pageOffset,
      });
    }

    // 2. Add empty page after TOC if TOC count is odd (ensures proper left/right alignment)
    if (tocPagesNeeded % 2 !== 0) {
      pageList.push({ type: 'empty' });
    }

    // 3. Add character pages (image on left, info on right)
    characters.forEach((char) => {
      pageList.push({ type: 'image', characterId: char._id });
      pageList.push({ type: 'info', characterId: char._id });
    });

    // 4. Add back cover
    pageList.push({ type: 'back-cover' });

    return pageList;
  }, [characters]);

  // Calculate which pages should load data
  // With two-page spread, we need to preload further ahead
  // Load: previous spread (2 pages) + current spread (2 pages) + next 2 spreads (4 pages)
  const shouldLoadPage = (pageIndex: number) => {
    return pageIndex >= currentPage - 2 && pageIndex <= currentPage + 6;
  };

  // Navigation handler for relationship links
  const handleNavigateToCharacter = (characterId: string) => {
    const charIndex = characters.findIndex((c) => c._id === characterId);
    if (charIndex === -1) return;

    const tocPages = Math.ceil(characters.length / 12);
    const emptyPagesAfterTOC = tocPages % 2 !== 0 ? 1 : 0;
    // Page calculation: front cover (1) + TOC pages + trailing blank + (charIndex * 2)
    const targetPage = 1 + tocPages + emptyPagesAfterTOC + charIndex * 2; // Jump to image page

    bookRef.current?.pageFlip()?.turnToPage(targetPage);
  };

  // Navigate to Table of Contents
  const handleNavigateToTOC = () => {
    bookRef.current?.pageFlip()?.turnToPage(1); // TOC starts at page 1
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        bookRef.current?.pageFlip()?.flipNext();
      } else if (e.key === 'ArrowLeft') {
        bookRef.current?.pageFlip()?.flipPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-900">
        <Loader2 className="w-12 h-12 animate-spin text-white mb-4" />
        <p className="text-white text-lg">Loading guidebook...</p>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-900">
        <h1 className="text-3xl font-bold mb-4 text-white">
          No Characters Yet
        </h1>
        <p className="text-gray-300 mb-6 text-center max-w-md">
          Create some characters to build your guidebook!
        </p>
        <Link
          to="/characters"
          className="text-blue-400 underline hover:text-blue-300 transition-colors"
        >
          Go to Character Management
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-8">
      <div className="relative flex items-center justify-center w-full">
        <HTMLFlipBook
          key={`${bookDimensions.usePortrait}-${bookDimensions.width}`}
          ref={bookRef}
          width={bookDimensions.width}
          height={bookDimensions.height}
          size="fixed"
          minWidth={250}
          maxWidth={2000}
          minHeight={350}
          maxHeight={2400}
          showCover={true}
          flippingTime={1000}
          usePortrait={bookDimensions.usePortrait}
          startPage={0}
          drawShadow={true}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          showPageCorners={true}
          disableFlipByClick={true}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
          mobileScrollSupport={true}
          onFlip={(e) => setCurrentPage(e.data)}
          style={{}}
          className="shadow-2xl"
        >
          {pages.map((page, idx) => {
            if (page.type === 'front-cover') {
              return <FrontCover key="front-cover" />;
            }
            if (page.type === 'back-cover') {
              return <BackCover key="back-cover" />;
            }
            if (page.type === 'toc') {
              return (
                <TableOfContentsPage
                  key={`toc-${idx}`}
                  characters={page.characters}
                  pageOffset={page.pageOffset}
                  onNavigateToCharacter={handleNavigateToCharacter}
                />
              );
            }
            if (page.type === 'empty') {
              return <EmptyPage key={`empty-${idx}`} />;
            }
            if (page.type === 'image') {
              return (
                <ImagePage
                  key={`img-${page.characterId}`}
                  characterId={page.characterId}
                  shouldLoad={shouldLoadPage(idx)}
                />
              );
            }
            if (page.type === 'info') {
              return (
                <InfoPage
                  key={`info-${page.characterId}`}
                  characterId={page.characterId}
                  shouldLoad={shouldLoadPage(idx)}
                  onNavigateToCharacter={handleNavigateToCharacter}
                />
              );
            }
            return null;
          })}
        </HTMLFlipBook>

        {/* Instructions overlay (shows on first visit) */}
        <GuidebookInstructions />

        {/* Back to TOC button - only show when not on cover or TOC pages */}
        {currentPage > 0 && pages[currentPage]?.type !== 'toc' && (
          <Button
            onClick={handleNavigateToTOC}
            variant="secondary"
            size="icon"
            className="fixed top-4 left-4 z-50 shadow-lg rounded-full"
            aria-label="Back to Table of Contents"
            title="Back to Table of Contents"
          >
            <BookOpen className="w-5 h-5" />
          </Button>
        )}

        {/* Page indicator */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm z-50">
          Page {currentPage + 1} of {pages.length}
        </div>
      </div>
    </div>
  );
}
