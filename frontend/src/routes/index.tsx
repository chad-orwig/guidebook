import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: GuidebookPage,
})

function GuidebookPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold">Guidebook</h1>
    </div>
  )
}
