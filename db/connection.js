// MongoDB connection using Mongoose
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zector-crm';

function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return mongoose.connection;
}

module.exports = connectDB;
