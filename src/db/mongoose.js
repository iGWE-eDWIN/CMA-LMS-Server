const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4,
    });

    console.log(
      `✅ MongoDB Connected: ${conn.connection.host}`
    );

    return conn;
  } catch (error) {
    console.error(
      '❌ Database connection error:',
      error.message
    );

    process.exit(1);
  }
};

// Connection Events
mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('🟡 MongoDB disconnected');
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();

    console.log(
      '🔒 MongoDB connection closed due to app termination'
    );

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});

module.exports = {
  connectDB,
};