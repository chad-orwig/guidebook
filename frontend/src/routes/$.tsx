import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/$')({
  component: NotFoundRedirect,
})

function NotFoundRedirect() {
  return <Navigate to="/" replace />
}
