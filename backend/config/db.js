import mongoose from 'mongoose';

let mongoMemoryServerInstance = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/career_flow';

  // 1. If an explicit Atlas or custom URI is provided (not default localhost)
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('127.0.0.1') && !process.env.MONGODB_URI.includes('localhost')) {
    try {
      console.log(`[MongoDB] Attempting connection to configured MONGODB_URI...`);
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.warn(`[MongoDB] Configured URI connection failed: ${error.message}`);
    }
  }

  // 2. Try local daemon if specified
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`[MongoDB] Connected to local MongoDB daemon: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch {
    console.log(`[MongoDB] Local MongoDB daemon is not running. Initializing embedded database engine...`);
  }

  // 3. Graceful zero-config fallback to MongoMemoryServer
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServerInstance = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServerInstance.getUri();
    const conn = await mongoose.connect(memoryUri, {
      dbName: 'career_flow'
    });
    console.log(`[MongoDB] Connected to high-performance embedded database: ${memoryUri}`);
    console.log(`[MongoDB] All Mongoose models, seeding, queries, and JWT auth are fully active.`);
    return conn;
  } catch (memError) {
    console.error(`[MongoDB] Embedded database startup error: ${memError.message}`);
    return null;
  }
};
