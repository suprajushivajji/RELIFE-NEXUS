import { config } from '../config.js';
import { validateRecommendation } from '../utils/validation.js';

export class AIProviderError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AIProviderError';
  }
}

function extractJSON(content: string): string | null {
  const trimmed = content.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
  const jsonMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) return jsonMatch[1].trim();
  const codeMatch = trimmed.match(/```\s*([\s\S]*?)\s*```/);
  if (codeMatch && codeMatch[1]) return codeMatch[1].trim();
  return null;
}

async function callOpenRouter(model: string, prompt: string, retryCount: number = 0): Promise<any> {
  const startTime = Date.now();
  console.log(`[AI] Request started - Model: ${model}, Retry: ${retryCount}/${config.aiMaxRetries}`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.aiTimeoutMs);
  
  let response: Response;
  try {
    response = await fetch(config.openRouterUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${config.aiApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": config.clientUrl,
        "X-Title": "ReLife Nexus"
      },
      body: JSON.stringify({
        model: model,
        temperature: 0,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: 'json_object' }
      })
    });
    clearTimeout(timeoutId);
  } catch (error) {
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    if (error instanceof DOMException && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      console.error(`[AI] Fetch timeout after ${duration}ms`);
      const timeoutError = new AIProviderError(`AI analysis timed out after ${Math.round(config.aiTimeoutMs / 1000)} seconds. Please retry.`, 'AI_TIMEOUT');
      
      if (retryCount < config.aiMaxRetries) {
        console.log(`[AI] Retrying after timeout (${retryCount + 1}/${config.aiMaxRetries})...`);
        return callOpenRouter(model, prompt, retryCount + 1);
      }
      throw timeoutError;
    }
    throw error;
  }

  const duration = Date.now() - startTime;
  console.log(`[AI] Response received - Status: ${response.status}, Duration: ${duration}ms`);

  try {
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[AI] HTTP Error - Status: ${response.status}, Body: ${errorBody.substring(0, 200)}`);
      throw new AIProviderError(`OpenRouter returned HTTP ${response.status}`, 'AI_PROVIDER_ERROR');
    }

    const jsonResponse = await response.json() as { choices?: { message?: { content?: string } }[]; error?: { message?: string } };
    const content = jsonResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('[AI] No content in response');
      throw new AIProviderError('OpenRouter returned no structured content', 'AI_RESPONSE_PARSE_ERROR');
    }

    console.log(`[AI] Content length: ${content.length} characters`);
    
    const jsonContent = extractJSON(content);
    if (!jsonContent) {
      console.error('[AI] Could not extract JSON from response');
      throw new AIProviderError('Could not extract JSON from AI response', 'AI_RESPONSE_PARSE_ERROR');
    }

    console.log('[AI] JSON extracted successfully');
    const parsed = JSON.parse(jsonContent);
    console.log('[AI] JSON parsed successfully');
    
    const validated = validateRecommendation(parsed);
    console.log(`[AI] Schema validation passed - Decision: ${validated.decision}, Confidence: ${validated.confidence}`);
    
    return validated;
  } catch (error) {
    if (error instanceof AIProviderError) {
      console.error(`[AI] AIProviderError - Code: ${error.code}, Message: ${error.message}`);
      
      if (retryCount < config.aiMaxRetries && (error.code === 'AI_TIMEOUT' || error.code === 'AI_PROVIDER_ERROR')) {
        console.log(`[AI] Retrying (${retryCount + 1}/${config.aiMaxRetries})...`);
        return callOpenRouter(model, prompt, retryCount + 1);
      }
      throw error;
    }
    
    if (error instanceof SyntaxError) {
      console.error(`[AI] JSON parse error: ${error.message}`);
      const parseError = new AIProviderError(`AI returned invalid JSON: ${error.message}`, 'AI_RESPONSE_PARSE_ERROR');
      
      if (retryCount < config.aiMaxRetries) {
        console.log(`[AI] Retrying after parse error (${retryCount + 1}/${config.aiMaxRetries})...`);
        return callOpenRouter(model, prompt, retryCount + 1);
      }
      throw parseError;
    }
    
    console.error(`[AI] Unexpected error: ${error instanceof Error ? error.message : 'unknown'}`);
    throw new AIProviderError(`OpenRouter response validation failed: ${error instanceof Error ? error.message : 'unknown error'}`, 'AI_RESPONSE_PARSE_ERROR');
  }
}

export const getAIRecommendation = async (assetData: unknown) => {
  if (!config.aiApiKey) throw new AIProviderError('AI_API_KEY is required for asset analysis.', 'AI_PROVIDER_ERROR');
  
  const asset = assetData as any;
  const compactPrompt = `You are an institutional asset analysis assistant. Analyze only the provided asset information. Identify observable condition and issues. Separate observations, inferences, and unknowns. Never invent model numbers, damage, warranty information, cost, or environmental impact. Return only the required JSON structure.

Asset:
- Category: ${asset.category}
- Condition: ${asset.condition}
- Reported Issue: ${asset.reportedIssue || 'None'}
- Usage Status: ${asset.usageStatus}
- Lifecycle Status: ${asset.lifecycleStatus}

Possible Actions: "REPAIR" | "REFURBISH" | "REUSE" | "REDEPLOY" | "RECYCLE" | "REPLACE" | "NEEDS_REVIEW"

Return a valid JSON object ONLY, adhering to this exact structure. Do not return markdown blocks like \`\`\`json, just the raw JSON. Evidence must be [] unless every item contains non-empty source, section, and excerpt values. Never create or guess citations:
{
  "decision": "LifecycleAction",
  "confidence": 0.8,
  "reasons": ["Reason 1", "Reason 2"],
  "evidence": [],
  "alternatives": ["RECYCLE"],
  "assumptions": ["Assumed cost is low"],
  "humanReviewRequired": true,
  "safetyNote": null
}`;
  
  try {
    return await callOpenRouter(config.aiModel, compactPrompt);
  } catch (error) {
    if (error instanceof AIProviderError && config.aiFallbackModel && config.aiFallbackModel !== config.aiModel) {
      console.log(`[AI] Primary model failed, trying fallback: ${config.aiFallbackModel}`);
      try {
        return await callOpenRouter(config.aiFallbackModel, compactPrompt);
      } catch (fallbackError) {
        console.error('[AI] Fallback model also failed');
        throw fallbackError;
      }
    }
    throw error;
  }
};
