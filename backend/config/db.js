import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri && process.env.NODE_ENV === 'production') {
    console.error('[Database Fatal] MONGODB_URI environment variable is not defined!');
    process.exit(1);
  }

  const connectionString = uri || 'mongodb://127.0.0.1:27017/admify';

  // Monitor connection events for runtime visibility
  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB connection lost. Reconnecting...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[Database] MongoDB reconnected.');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[Database Error] Runtime error: ${err.message}`);
  });

  try {
    const conn = await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Connection Error] Failed to connect to MongoDB: ${error.message}`);

    // Graceful startup failure in production
    if (process.env.NODE_ENV === 'production') {
      console.error('[Database Fatal] Exiting application process due to unavailable database.');
      process.exit(1);
    } else {
      console.warn('[Database Warning] Running in non-production mode without active MongoDB connection.');
    }
  }
};

export default connectDB;
