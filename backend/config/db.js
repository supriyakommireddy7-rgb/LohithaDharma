const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lohitha_dharma';
  try {
    console.log(`Attempting to connect to MongoDB at: ${mongoUri}...`);
    // Connect with a 3-second timeout for quick fallback
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Could not connect to standard MongoDB: ${error.message}`);
    
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: Cannot connect to MongoDB in production. Please configure a valid MONGO_URI in your Render environment variables (e.g. MongoDB Atlas).');
      console.error('The server will continue running to serve the frontend, but API requests requiring the database will fail.');
      return;
    }

    console.log('Starting in-memory MongoDB fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      console.log(`In-memory MongoDB Server started at: ${uri}`);
      
      const conn = await mongoose.connect(uri);
      console.log(`Mongoose connected to In-Memory MongoDB: ${conn.connection.host}`);
      
      // Keep reference to the mongod instance to shut it down gracefully
      mongoose.connection.mongodInstance = mongod;
    } catch (innerError) {
      console.error(`Failed to start in-memory MongoDB fallback: ${innerError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
