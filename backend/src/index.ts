import { Hono } from 'hono'
import 'dotenv/config'
import { connectToDatabase, checkDatabaseHealth } from '@/lib/db'

const app = new Hono()

// Initialize database connection
connectToDatabase().catch((error) => {
  console.error('Failed to connect to MongoDB:', error)
  process.exit(1)
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/health', async (c) => {
  const dbHealth = await checkDatabaseHealth()

  const response = {
    status: dbHealth.connected ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: dbHealth
  }

  // Return 503 if database is not connected (for k8s health checks)
  if (!dbHealth.connected) {
    return c.json(response, 503)
  }

  return c.json(response, 200)
})

export default app
