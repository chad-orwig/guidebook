import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/guidebook'

let client: MongoClient | null = null

export async function connectToDatabase() {
  try {
    if (client) {
      return client
    }

    client = new MongoClient(MONGODB_URI)
    await client.connect()

    // Test the connection
    await client.db().admin().ping()

    console.log('✅ Connected to MongoDB successfully')
    return client
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

export async function getDatabase() {
  if (!client) {
    await connectToDatabase()
  }
  return client!.db()
}

export async function closeDatabaseConnection() {
  if (client) {
    await client.close()
    client = null
    console.log('🔌 MongoDB connection closed')
  }
}

export async function checkDatabaseHealth() {
  try {
    if (!client) {
      return { connected: false, message: 'Not connected' }
    }

    // Ping the database to verify connection
    await client.db().admin().ping()

    return { connected: true, message: 'Connected' }
  } catch (error) {
    return {
      connected: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
