import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun'
import 'dotenv/config'
import { connectToDatabase } from '@/lib/db'
import { initializeUploadsDir } from '@/lib/storage'
import { auth, type User, type Session } from '@/lib/auth'
import { initializeAdmin } from '@/lib/init-admin'
import healthRoutes from '@/routes/health'
import charactersRoutes from '@/routes/characters'
import { logger } from '@/middleware/logger'
import { errorHandler } from '@/middleware/errorHandler'

type Variables = {
  user: User | null
  session: Session['session'] | null
}

const app = new Hono<{ Variables: Variables }>()

// Initialize database connection and uploads directory
Promise.all([connectToDatabase(), initializeUploadsDir()])
  .then(() => initializeAdmin())
  .catch((error) => {
    console.error('Failed to initialize server:', error)
    process.exit(1)
  })

// Apply middleware
app.use('*', logger)
app.use(
  '*',
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
)

// Mount Better Auth handler (handles all /api/auth/* routes)
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

// Session middleware - inject user and session into context
app.use('*', async (c, next) => {
  const sessionData = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  c.set('user', sessionData?.user ?? null)
  c.set('session', sessionData?.session ?? null)

  await next()
})

// Serve static files from uploads directory (must be before routes)
app.use('/uploads/*', serveStatic({ root: './' }))

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Mount routes
app.route('/health', healthRoutes)
app.route('/api/characters', charactersRoutes)

// Error handling
app.onError(errorHandler)

export default app
