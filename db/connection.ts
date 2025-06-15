import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zector-crm';

export function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as any);
  return mongoose.connection;
}
