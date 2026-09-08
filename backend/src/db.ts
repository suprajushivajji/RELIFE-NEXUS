import mongoose from 'mongoose';
import { config } from './config.js';

export async function connectDatabase() {
  if (!config.mongodbUri) throw new Error('MONGODB_URI is required.');
  await mongoose.connect(config.mongodbUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    maxPoolSize: 10,
    maxIdleTimeMS: 300000,
  });
}

export function databaseReady() {
  return mongoose.connection.readyState === 1;
}
