import { config } from '../config.js';
import { validateRecommendation } from '../utils/validation.js';

export class AIProviderError extends Error {}

export const getAIRecommendation = async (assetData: unknown) => {
  if (!config.aiApiKey) throw new AIProviderError('AI_API_KEY is required for asset analysis.');
  
  const prompt = `
  You are an AI decision engine for ReLife Nexus.
  Given the following asset details, determine the most sustainable lifecycle action.
  Asset Details: ${JSON.stringify(assetData)}
  
  Possible Actions: "REPAIR" | "REFURBISH" | "REUSE" | "REDEPLOY" | "RECYCLE" | "REPLACE" | "NEEDS_REVIEW"
  
  Return a valid JSON object ONLY, adhering to this exact structure. Do not return markdown blocks like \`\`\`json, just the raw JSON:
  {
    "decision": "LifecycleAction",
    "confidence": 0.8,
    "reasons": ["Reason 1", "Reason 2"],
    "evidence": [],
    "alternatives": ["RECYCLE"],
    "assumptions": ["Assumed cost is low"],
    "humanReviewRequired": true,
    "safetyNote": null
  }
  `;
  
  try {
    const response = await fetch(config.openRouterUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.aiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: config.aiModel,
        temperature: 0,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: 'json_object' }
      })
    });

    const jsonResponse = await response.json() as { choices?: { message?: { content?: string } }[]; error?: { message?: string } };
    if (!response.ok) throw new AIProviderError(jsonResponse.error?.message ?? `OpenRouter returned HTTP ${response.status}.`);
    const content = jsonResponse.choices?.[0]?.message?.content;
    if (!content) throw new AIProviderError('OpenRouter returned no structured content.');
    const parsed = JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
    return validateRecommendation(parsed);
  } catch (error) {
    if (error instanceof AIProviderError) throw error;
    throw new AIProviderError(`OpenRouter response validation failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
};
