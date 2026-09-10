import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 5000),
  mongodbUri: process.env.MONGODB_URI ?? '',
  aiApiKey: process.env.AI_API_KEY ?? '',
  aiModel: process.env.AI_MODEL ?? 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  aiFallbackModel: process.env.AI_FALLBACK_MODEL ?? 'openrouter/free',
  openRouterUrl: process.env.OPENROUTER_URL ?? 'https://openrouter.ai/api/v1/chat/completions',
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS ?? 60000),
  aiMaxRetries: 1,
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:3000',
};

export function integrationStatus() {
  return {
    mongodbConfigured: Boolean(config.mongodbUri),
    openRouterConfigured: Boolean(config.aiApiKey),
    aiModel: config.aiModel,
  };
}
