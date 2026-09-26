const mongoose = require('mongoose');

let mongoMemoryServer = null;

/**
 * Connect to MongoDB with automatic fallback to in-memory server
 * if local MongoDB instance is not running.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant_db';

  try {
    // Attempt connecting to the provided MongoDB URI with a short timeout
    console.log(`Connecting to MongoDB at: ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log('MongoDB connected successfully to primary instance.');
  } catch (err) {
    console.warn('Could not connect to primary MongoDB instance.');
    console.log('Starting in-memory MongoDB fallback server...');
    
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
    } catch (memErr) {
      console.error('CRITICAL: Failed to connect to MongoDB and could not start in-memory server:', memErr.message);
      throw memErr;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('Mongoose runtime connection error:', err);
  });
}

async function closeDB() {
  await mongoose.connection.close();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}

module.exports = { connectDB, closeDB };
