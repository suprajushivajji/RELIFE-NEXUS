import { config } from './config.js';

const models = [
  'liquid/lfm-2.5-2.6b:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'google/gemma-4-26b-a4b-it:free',
  'google/gemma-4-31b-it:free',
  'openrouter/free'
];

const testPrompt = `You are an institutional asset analysis assistant. Analyze only the provided asset information. Identify observable condition and issues. Separate observations, inferences, and unknowns. Never invent model numbers, damage, warranty information, cost, or environmental impact. Return only the required JSON structure.

Asset:
- Category: MONITOR
- Condition: GOOD
- Reported Issue: None
- Usage Status: UNUSED
- Lifecycle Status: AVAILABLE

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

async function benchmarkModel(model: string): Promise<{ model: string; success: boolean; latencyMs: number; error?: string }> {
  const startTime = Date.now();
  console.log(`\n[TEST] Testing model: ${model}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(config.openRouterUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${config.aiApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": config.clientUrl,
        "X-Title": "ReLife Nexus Benchmark"
      },
      body: JSON.stringify({
        model: model,
        temperature: 0,
        messages: [{ role: "user", content: testPrompt }],
        response_format: { type: 'json_object' }
      })
    });
    
    clearTimeout(timeoutId);
    
    const latency = Date.now() - startTime;
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[FAIL] HTTP ${response.status}: ${errorBody.substring(0, 100)}`);
      return { model, success: false, latencyMs: latency, error: `HTTP ${response.status}` };
    }
    
    const jsonResponse = await response.json() as { choices?: { message?: { content?: string } }[]; error?: { message?: string } };
    const content = jsonResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error(`[FAIL] No content in response`);
      return { model, success: false, latencyMs: latency, error: 'No content' };
    }
    
    console.log(`[SUCCESS] Latency: ${latency}ms, Content length: ${content.length}`);
    return { model, success: true, latencyMs: latency };
    
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[FAIL] Error: ${errorMessage}`);
    return { model, success: false, latencyMs: latency, error: errorMessage };
  }
}

async function runBenchmark() {
  console.log('=== MODEL BENCHMARK ===');
  console.log('Testing 5 free OpenRouter models for speed and reliability...\n');
  
  const results = [];
  
  for (const model of models) {
    const result = await benchmarkModel(model);
    results.push(result);
    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=== RESULTS ===');
  console.log('Model | Success | Latency (ms) | Error');
  console.log('------|---------|--------------|------');
  
  for (const result of results) {
    console.log(`${result.model.substring(0, 40).padEnd(40)} | ${result.success ? '✓' : '✗'} | ${result.latencyMs.toString().padEnd(12)} | ${result.error || ''}`);
  }
  
  const successful = results.filter(r => r.success);
  if (successful.length > 0) {
    successful.sort((a, b) => a.latencyMs - b.latencyMs);
    const [fastest] = successful;
    if (fastest) {
      console.log('\n=== RECOMMENDATION ===');
      console.log(`Fastest model: ${fastest.model} (${fastest.latencyMs}ms)`);
      console.log(`Set AI_MODEL=${fastest.model} in your .env file`);
    }
  } else {
    console.log('\n=== ERROR ===');
    console.log('No models succeeded. Check your API key and network connection.');
  }
}

runBenchmark().catch(console.error);
