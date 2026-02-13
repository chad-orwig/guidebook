import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { LogIn, LogOut, User, Wrench, BookOpenText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession, authClient } from '@/lib/auth-client';

export function NavigationButtons() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const handleLogout = async () => {
    await authClient.signOut();
    navigate({ to: '/' });
  };

  // Don't show navigation on login page
  if (currentPath === '/login') {
    return null;
  }

  // Determine which section we're in
  const isGuidebook = currentPath === '/';
  const isProfile = currentPath === '/profile';
  const isManage = currentPath.startsWith('/characters');

  return (
    <div className="fixed bottom-4 right-4 flex gap-2 z-50">
      {session ? (
        <>
          {/* Logout button */}
          <Button
            variant="destructive"
            size="icon"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>

          {/* Show Guidebook button if NOT in Guidebook */}
          {!isGuidebook && (
            <Button
              asChild
              variant="secondary"
              size="icon"
              title="Guidebook"
            >
              <Link to="/">
                <BookOpenText className="h-4 w-4" />
              </Link>
            </Button>
          )}

          {/* Show Profile button if NOT in Profile */}
          {!isProfile && (
            <Button
              asChild
              variant="secondary"
              size="icon"
              title="Profile"
            >
              <Link to="/profile">
                <User className="h-4 w-4" />
              </Link>
            </Button>
          )}

          {/* Show Manage button if NOT in Manage */}
          {!isManage && (
            <Button
              asChild
              variant="secondary"
              size="icon"
              title="Manage Characters"
            >
              <Link to="/characters">
                <Wrench className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </>
      ) : (
        /* Login button when not authenticated */
        <Button
          asChild
          variant="default"
          size="icon"
          title="Login"
        >
          <Link to="/login">
            <LogIn className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
