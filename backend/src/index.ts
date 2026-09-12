import app from './app.js';
import { config } from './config.js';
import { connectDatabase } from './db.js';

async function start() {
  await connectDatabase();
  app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
}

start().catch(error => {
  console.error('Backend startup failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
