import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/characters/new')({
  component: NewCharacter,
})

function NewCharacter() {
  return (
    <div className="container mx-auto p-8">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Create New Character</h1>

        <p className="text-muted-foreground">
          Character form placeholder - will be implemented in Task 4
        </p>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Test navigation:</p>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/characters">Back to Characters</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
