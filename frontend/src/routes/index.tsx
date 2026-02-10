import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Guidebook
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose an option to get started
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button asChild size="lg" className="flex-1">
          <Link to="/characters">
            Manage Characters
          </Link>
        </Button>

        <Button
          size="lg"
          variant="outline"
          disabled
          className="flex-1"
        >
          View Guidebook
        </Button>
      </div>
    </div>
  )
}
