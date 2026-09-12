// Vercel serverless entrypoint for the Express backend.
// Vercel invokes this file as a Node.js serverless function.
// The Express app handles all routing; MongoDB is connected lazily.
import app from '../src/app.js';
import { connectDatabase, databaseReady } from '../src/db.js';

// Lazily connect to MongoDB — re-use existing connection across warm invocations.
let dbConnected = false;
async function ensureDatabase() {
  if (dbConnected || databaseReady()) {
    dbConnected = true;
    return;
  }
  await connectDatabase();
  dbConnected = true;
}

// Wrap the Express app to ensure DB connection before handling requests.
const handler = async (req: import('http').IncomingMessage, res: import('http').ServerResponse) => {
  await ensureDatabase().catch(err => {
    console.error('DB connection failed:', err instanceof Error ? err.message : err);
  });
  // Let Express handle the request regardless — health route reports DB status.
  return new Promise<void>((resolve, reject) => {
    app(req as import('express').Request, res as import('express').Response);
    res.on('finish', resolve);
    res.on('error', reject);
  });
};

export default handler;
