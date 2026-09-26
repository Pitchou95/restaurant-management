const mongoose = require('mongoose');

let mongoMemoryServer = null;
let lastConnectionAttempt = 0;
let lastConnectionError = null;
const RETRY_COOLDOWN_MS = 30000; // 30 seconds cooldown before retrying if DB failed

/**
 * Connect to MongoDB with connection reuse for serverless (Vercel)
 * and automatic fallback to in-memory server during local development.
 */
async function connectDB() {
  // If already connected, reuse connection (critical for Serverless functions)
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Throttle connection retries if previously failed to prevent request latency
  if (lastConnectionError && Date.now() - lastConnectionAttempt < RETRY_COOLDOWN_MS) {
    throw lastConnectionError;
  }

  // Check both MONGODB_URI and MONGO_URI
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant_db';

  lastConnectionAttempt = Date.now();
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log('MongoDB connected successfully.');
    lastConnectionError = null;
    return mongoose.connection;
  } catch (err) {
    lastConnectionError = err;
    console.warn(`Could not connect to MongoDB instance: ${err.message}`);

    // In production or on Vercel, do NOT attempt in-memory server (not supported in serverless)
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      console.error('CRITICAL: MongoDB connection failed in production/Vercel. Please check MONGODB_URI and Atlas Network Access.');
      throw err;
    }

    // Local development fallback to in-memory MongoDB
    console.log('Attempting local in-memory MongoDB fallback server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();

      await mongoose.connect(memoryUri);
      console.log(`In-memory MongoDB started and connected at: ${memoryUri}`);

      // Automatically seed if memory database is active
      const seedDatabase = require('./seed/seed');
      if (typeof seedDatabase.seedData === 'function') {
        console.log('Auto-populating in-memory database with sample data...');
        await seedDatabase.seedData();
      }
      return mongoose.connection;
    } catch (memErr) {
      console.error('CRITICAL: Failed to connect to MongoDB and could not start in-memory server:', memErr.message);
      throw err;
    }
  }
}

async function closeDB() {
  await mongoose.connection.close();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}

module.exports = { connectDB, closeDB };
