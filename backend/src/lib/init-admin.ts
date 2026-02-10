import { getDatabase } from './db'
import { auth } from './auth'

export async function initializeAdmin() {
  const adminUsername = process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminUsername || !adminPassword) {
    console.warn('⚠️  Admin credentials not configured in environment variables')
    return
  }

  try {
    const db = await getDatabase()
    const userCollection = db.collection('user')

    // Check if admin already exists
    const existingAdmin = await userCollection.findOne({
      username: adminUsername,
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', adminUsername)
      return
    }

    // Create admin user using Better Auth
    // Note: signUpEmail is used even with username plugin, email is still required in schema
    console.log('Creating admin user:', adminUsername)

    const result = await auth.api.signUpEmail({
      body: {
        email: `${adminUsername}@localhost.local`, // Placeholder email for username-based auth
        name: 'Admin',
        password: adminPassword,
        username: adminUsername,
      },
    })

    if (!result) {
      throw new Error('Failed to create admin user')
    }

    // Update user role to admin (role field has input: false, so must be set after creation)
    await userCollection.updateOne({ username: adminUsername }, { $set: { role: 'admin' } })

    console.log('✅ Admin user created successfully:', adminUsername)
  } catch (error) {
    console.error('❌ Failed to initialize admin user:', error)
    throw error // Propagate error to stop server startup
  }
}
