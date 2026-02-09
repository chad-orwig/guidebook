import { Hono } from 'hono';
import { checkDatabaseHealth } from '@/lib/db';

const app = new Hono();

app.get('/', async (c) => {
  const dbHealth = await checkDatabaseHealth();

  const response = {
    status: dbHealth.connected ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: dbHealth,
  };

  // Return 503 if database is not connected (for k8s health checks)
  if (!dbHealth.connected) {
    return c.json(response, 503);
  }

  return c.json(response, 200);
});

export default app;
