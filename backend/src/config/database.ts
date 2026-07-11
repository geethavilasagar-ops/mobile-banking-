import mongoose from 'mongoose';
import { ENV } from './env';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(ENV.MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.warn('⚠️  Failed to connect to primary MongoDB instance. Falling back to In-Memory DB...');
    try {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log(`✅ MongoDB connected (In-Memory Fallback)`);
    } catch (fallbackError) {
      console.error('❌ In-Memory DB also failed:', fallbackError);
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected.');
});
