import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/characters/')({
  component: CharacterList,
})

function CharacterList() {
  return (
    <div className="container mx-auto p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Characters</h1>
          <Button asChild>
            <Link to="/characters/new">Create New Character</Link>
          </Button>
        </div>

        <p className="text-muted-foreground">
          Character list placeholder - will be implemented in Task 3
        </p>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Test navigation:</p>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/">Back to Home</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/characters/test-id/edit">Test Edit Route</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
