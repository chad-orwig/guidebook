import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun'
import 'dotenv/config'
import { connectToDatabase } from '@/lib/db'
import { initializeUploadsDir } from '@/lib/storage'
import healthRoutes from '@/routes/health'
import charactersRoutes from '@/routes/characters'
import { logger } from '@/middleware/logger'
import { errorHandler } from '@/middleware/errorHandler'

const app = new Hono()

// Initialize database connection and uploads directory
Promise.all([
  connectToDatabase(),
  initializeUploadsDir(),
]).catch((error) => {
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
