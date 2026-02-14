import { useState } from 'react';
import { X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COOKIE_NAME = 'guidebook_instructions_seen';

function checkIfSeen() {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
}

export function GuidebookInstructions() {
  const [isVisible, setIsVisible] = useState(() => !checkIfSeen());

  const handleDismiss = () => {
    // Set cookie to expire in 10 years
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 10);
    document.cookie = `${COOKIE_NAME}=true; expires=${expiryDate.toUTCString()}; path=/`;

    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-2xl p-8 max-w-md mx-4 border border-gray-700">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close instructions"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-4">
          How to Navigate
        </h2>

        <div className="text-gray-200 space-y-4">
          <p className="text-lg text-center">
            Swipe, click corners, or use arrow keys to turn pages.
          </p>

          <div className="flex items-center justify-center gap-3 text-sm">
            <span>Click</span>
            <Button
              variant="secondary"
              size="icon-sm"
              className="rounded-full pointer-events-none"
              aria-hidden="true"
            >
              <BookOpen className="w-4 h-4" />
            </Button>
            <span>in the top left to return to the table of contents.</span>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
