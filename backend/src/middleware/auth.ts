import { Context, Next } from 'hono'
import type { User, Session } from '@/lib/auth'

type Variables = {
  user: User | null
  session: Session['session'] | null
}

export async function requireAuth(c: Context<{ Variables: Variables }>, next: Next) {
  const user = c.get('user')

  if (!user) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  await next()
}

export async function requireAdmin(c: Context<{ Variables: Variables }>, next: Next) {
  const user = c.get('user')

  if (!user) {
    return c.json({ error: 'Authentication required' }, 401)
  }

  if (user.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403)
  }

  await next()
}
