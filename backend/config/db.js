import mongoose from 'mongoose'
import dns from 'node:dns'

export async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error('MONGODB_URI is not set. Check your .env file.')
    process.exit(1)
  }

  // Windows Node.js c-ares fallback: if DNS servers default to loopback, SRV lookups fail with ECONNREFUSED
  try {
    const servers = dns.getServers()
    if (!servers.length || servers.every((s) => s.startsWith('127.') || s === '::1')) {
      dns.setServers(['8.8.8.8', '1.1.1.1'])
    }
  } catch {
    // Ignore if setServers fails
  }

  try {
    await mongoose.connect(uri)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    if (err.name === 'MongooseServerSelectionError' || err.message.includes('whitelist') || err.message.includes('alert number 80')) {
      console.error('[MongoDB Atlas] Connection failed. Verify that your current public IP is added to MongoDB Atlas -> Network Access (or add 0.0.0.0/0 for access from anywhere).')
    }
    process.exit(1)
  }
}
