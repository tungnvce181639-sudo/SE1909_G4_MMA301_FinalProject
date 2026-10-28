const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('Error connecting to MongoDB: MONGODB_URI (or MONGO_URI) is not defined in backend/.env.');
    console.error('Please add MONGODB_URI to your .env file (e.g., MONGODB_URI=mongodb://127.0.0.1:27017/smartcampus or your MongoDB Atlas connection string).');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
