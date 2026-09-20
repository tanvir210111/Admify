import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/admify',
      {
        serverSelectionTimeoutMS: 3000,
      }
    );
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Warning] ${error.message}`);
    console.log('[Database] API server continuing. Requests requiring database will wait or report connection error.');
  }
};

export default connectDB;
