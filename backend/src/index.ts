import express from 'express';
import cors from 'cors';
import assetRoutes from './routes/assetRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import impactRoutes from './routes/impactRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import responsibleAIRoutes from './routes/responsibleAIRoutes.js';
import { config, integrationStatus } from './config.js';
import { connectDatabase, databaseReady } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/assets', assetRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/responsible-ai', responsibleAIRoutes);

app.get('/api/health', (req, res) => {
  const ready = databaseReady();
  res.status(ready ? 200 : 503).json({
    status: 'ok',
    service: 'relife-nexus-backend',
    database: ready ? 'connected' : 'disconnected',
    integrations: integrationStatus(),
    timestamp: new Date().toISOString()
  });
});

app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) return next(error);
  res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
});

async function start() {
  await connectDatabase();
  app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
}

start().catch(error => {
  console.error('Backend startup failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
