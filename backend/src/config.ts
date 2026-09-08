import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 5000),
  mongodbUri: process.env.MONGODB_URI ?? '',
  aiApiKey: process.env.AI_API_KEY ?? '',
  aiModel: process.env.AI_MODEL ?? 'openai/gpt-4o-mini',
  openRouterUrl: process.env.OPENROUTER_URL ?? 'https://openrouter.ai/api/v1/chat/completions',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:3000',
};

export function integrationStatus() {
  return {
    mongodbConfigured: Boolean(config.mongodbUri),
    openRouterConfigured: Boolean(config.aiApiKey),
    aiModel: config.aiModel,
  };
}
