import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

export const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    // Mask password in logs
    const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
    console.log(`📡 Attempting to connect to: ${maskedUri}`);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority',
    });

    await conn.connection.db.admin().ping();
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('❌ MongoDB connection error details:');
    console.error(`- Message: ${err.message}`);
    console.error(`- Code: ${err.code}`);
    if (err.message.includes('IP')) {
      console.log('👉 ACTION REQUIRED: Your IP is likely not whitelisted in MongoDB Atlas.');
    }
    process.exit(1);
  }
};