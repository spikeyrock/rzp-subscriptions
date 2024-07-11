import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const options = {
  bufferCommands: false,
};

let isConnected = false;

async function dbConnect() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, options);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('MongoDB connection error');
  }
}

export default dbConnect;
