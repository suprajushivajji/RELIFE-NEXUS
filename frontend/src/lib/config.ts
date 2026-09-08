export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
  aiModel: process.env.AI_MODEL ?? null,
  integrations: {
    mongodb: Boolean(process.env.MONGODB_URI),
    ai: Boolean(process.env.AI_API_KEY),
    embeddings: Boolean(process.env.EMBEDDING_API_KEY && process.env.EMBEDDING_MODEL),
    vectorDb: Boolean(process.env.VECTOR_DB_URL),
  },
};
