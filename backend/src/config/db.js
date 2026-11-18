const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bhojanseva';
  const fallbackUri = 'mongodb://127.0.0.1:27017/bhojanseva';

  try {
    const conn = await mongoose.connect(primaryUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.name} @ ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Primary connection failed (${primaryUri}): ${error.message}`);
    if (primaryUri !== fallbackUri) {
      console.log(`[MongoDB] Attempting fallback to local instance at ${fallbackUri}...`);
      try {
        const fallbackConn = await mongoose.connect(fallbackUri, {
          autoIndex: true,
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`[MongoDB] Fallback connected to: ${fallbackConn.connection.name} @ ${fallbackConn.connection.host}`);
        return fallbackConn;
      } catch (fbError) {
        console.error(`[MongoDB] Fallback connection failed: ${fbError.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[MongoDB] Connection closed smoothly.');
  } catch (error) {
    console.error(`[MongoDB] Error closing connection: ${error.message}`);
  }
};

module.exports = { connectDB, closeDB };
