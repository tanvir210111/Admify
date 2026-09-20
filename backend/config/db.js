import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded from backend directory first, then current working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

/**
 * Sanitizes and normalizes MongoDB connection string:
 * 1. Safely percent-encodes usernames and passwords containing special characters (@, :, /, ?, #, %, etc.)
 * 2. Normalizes 'localhost' to '127.0.0.1' to prevent IPv6 (::1) socket lookup failures on Linux/Node.js 22
 * 3. Ensures 'directConnection=true' for single-host 127.0.0.1/localhost instances (matching mongosh behavior)
 * 4. Preserves SRV replica sets (mongodb+srv://) without altering topology options
 */
export function sanitizeMongoUri(rawUri) {
  if (!rawUri || typeof rawUri !== 'string') return '';
  let uri = rawUri.trim();

  // Strip wrapping quotes if any (e.g. from .env file)
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    return uri;
  }

  const isSrv = uri.startsWith('mongodb+srv://');
  const scheme = isSrv ? 'mongodb+srv://' : 'mongodb://';
  const withoutScheme = uri.substring(scheme.length);

  // Find the LAST '@' before query/path to properly isolate password from host
  const atIndex = withoutScheme.lastIndexOf('@');
  if (atIndex !== -1) {
    const authPart = withoutScheme.substring(0, atIndex);
    const hostAndRest = withoutScheme.substring(atIndex + 1);

    const colonIndex = authPart.indexOf(':');
    if (colonIndex !== -1) {
      const user = authPart.substring(0, colonIndex);
      let pass = authPart.substring(colonIndex + 1);

      // Avoid double-encoding if already encoded
      try {
        pass = decodeURIComponent(pass);
      } catch {
        // use raw pass if decode fails
      }

      let decodedUser = user;
      try {
        decodedUser = decodeURIComponent(user);
      } catch {
        // use raw user
      }

      const encodedUser = encodeURIComponent(decodedUser);
      const encodedPass = encodeURIComponent(pass);

      uri = `${scheme}${encodedUser}:${encodedPass}@${hostAndRest}`;
    }
  }

  // Normalize localhost to 127.0.0.1 to avoid IPv6 (::1) resolution when mongod is bound to 127.0.0.1
  if (!isSrv) {
    uri = uri.replace('://localhost:', '://127.0.0.1:');
    uri = uri.replace('@localhost:', '@127.0.0.1:');
    uri = uri.replace('@localhost/', '@127.0.0.1/');
  }

  // For 127.0.0.1 / localhost single host, ensure directConnection=true if not specified
  // This matches mongosh CLI default behavior for standalone local instances
  if (!isSrv && (uri.includes('127.0.0.1') || uri.includes('localhost')) && !uri.includes('directConnection=')) {
    const separator = uri.includes('?') ? '&' : '?';
    uri = `${uri}${separator}directConnection=true`;
  }

  return uri;
}

/**
 * Returns a masked connection string for safe logging (hides password)
 */
export function maskUri(uri) {
  if (!uri || typeof uri !== 'string') return '';
  return uri.replace(/:([^@]+)@/, ':***@');
}

/**
 * Resolves the active MongoDB connection URI from environment variables:
 * Supports MONGODB_URI (standard) or individual DB_* variables as a fallback
 */
export function getActiveMongoUri() {
  // Option 1: Individual environment variables (guaranteed immune to URI parsing ambiguities)
  if (process.env.DB_USER && process.env.DB_PASSWORD) {
    const user = encodeURIComponent(process.env.DB_USER);
    const pass = encodeURIComponent(process.env.DB_PASSWORD);
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = process.env.DB_PORT || '27017';
    const db = process.env.DB_NAME || 'admify';
    const authSource = process.env.DB_AUTH_SOURCE || db;
    return `mongodb://${user}:${pass}@${host}:${port}/${db}?authSource=${authSource}&directConnection=true`;
  }

  // Option 2: Full connection URI (sanitized and auto-encoded)
  if (process.env.MONGODB_URI) {
    return sanitizeMongoUri(process.env.MONGODB_URI);
  }

  return 'mongodb://127.0.0.1:27017/admify?directConnection=true';
}

const connectDB = async () => {
  const uri = getActiveMongoUri();
  const masked = maskUri(uri);

  if (!process.env.MONGODB_URI && !process.env.DB_USER && process.env.NODE_ENV === 'production') {
    console.error('[Database Fatal] Neither MONGODB_URI nor DB_USER/DB_PASSWORD environment variables are defined!');
    process.exit(1);
  }

  // Runtime connection monitors
  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB connection lost. Reconnecting...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[Database] MongoDB reconnected.');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[Database Error] Runtime error: ${err.message}`);
  });

  const isLocalHost = uri.includes('127.0.0.1') || uri.includes('localhost');
  const isSrv = uri.startsWith('mongodb+srv://');

  const mongooseOptions = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    family: isLocalHost ? 4 : undefined, // Force IPv4 for local connections
    directConnection: !isSrv && isLocalHost ? true : undefined,
  };

  try {
    console.log(`[Database] Connecting to: ${masked}`);
    const conn = await mongoose.connect(uri, mongooseOptions);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Connection Error] Failed to connect to MongoDB: ${error.message}`);

    // Graceful startup failure in production
    if (process.env.NODE_ENV === 'production') {
      console.error('[Database Fatal] Exiting process due to database connection failure.');
      process.exit(1);
    } else {
      console.warn('[Database Warning] Running in non-production mode without active MongoDB connection.');
    }
  }
};

export default connectDB;
