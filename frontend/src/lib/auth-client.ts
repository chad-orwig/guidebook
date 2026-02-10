import { createAuthClient } from 'better-auth/react'
import { usernameClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
  plugins: [usernameClient()],
})

export const { useSession, signIn, signOut } = authClient

// Export types for use in components
export type Session = typeof authClient.$Infer.Session
export type User = Session['user']
