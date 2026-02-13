import { createRootRoute, Outlet } from '@tanstack/react-router'
import { NavigationButtons } from '@/components/NavigationButtons'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background">
      <NavigationButtons />
      <Outlet />
    </div>
  ),
})
