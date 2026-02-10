import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useSession, authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const { data: session } = useSession()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authClient.signOut()
    navigate({ to: '/login' })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      {/* Logout button in header if authenticated */}
      {session && (
        <div className="absolute top-4 right-4">
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      )}

      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Guidebook
        </h1>
        {session && (
          <p className="text-sm text-muted-foreground">
            Logged in as {session.user.username}
          </p>
        )}
        <p className="text-lg text-muted-foreground">
          Choose an option to get started
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        {session ? (
          <>
            <Button asChild size="lg" className="flex-1">
              <Link to="/characters">Manage Characters</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="flex-1">
              <Link to="/profile">Profile Settings</Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild size="lg" className="flex-1">
              <Link to="/login">Admin Login</Link>
            </Button>
            <Button size="lg" variant="outline" disabled className="flex-1">
              View Guidebook
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
