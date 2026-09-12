// Vercel serverless entrypoint.
// This file is at backend/src/handler.ts so all imports stay within src/.
// @vercel/node bundles this file and its transitive imports using esbuild.
import app from './app.js';
import { connectDatabase, databaseReady } from './db.js';
import type { IncomingMessage, ServerResponse } from 'http';

// Re-use the DB connection across warm Lambda invocations.
let dbConnected = false;

async function ensureDatabase() {
  if (dbConnected || databaseReady()) {
    dbConnected = true;
    return;
  }
  await connectDatabase();
  dbConnected = true;
}

// Vercel calls this function for every request.
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ensureDatabase().catch(err => {
    console.error('DB connection failed:', err instanceof Error ? err.message : err);
  });
  return new Promise<void>((resolve, reject) => {
    app(req as import('express').Request, res as import('express').Response);
    res.on('finish', resolve);
    res.on('error', reject);
  });
}
