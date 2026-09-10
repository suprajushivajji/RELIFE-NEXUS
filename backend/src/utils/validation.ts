import type { Request } from 'express';

const categories = ['LAPTOP', 'MONITOR', 'PROJECTOR', 'PRINTER'] as const;
const conditions = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'UNSAFE'] as const;
const actions = ['REPAIR', 'REFURBISH', 'REUSE', 'REDEPLOY', 'RECYCLE', 'REPLACE', 'NEEDS_REVIEW'] as const;

export function requireFields(body: Record<string, unknown>, fields: string[]) {
  const missing = fields.filter(field => body[field] === undefined || body[field] === null || body[field] === '');
  if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);
}

export function validateAssetBody(body: Record<string, unknown>) {
  requireFields(body, ['name', 'category', 'department', 'location', 'condition', 'usageStatus', 'purchaseYear']);
  if (!categories.includes(body.category as typeof categories[number])) throw new Error('Invalid asset category.');
  if (!conditions.includes(body.condition as typeof conditions[number])) throw new Error('Invalid asset condition.');
  if (typeof body.purchaseYear !== 'number' || body.purchaseYear < 1970) throw new Error('purchaseYear must be a valid number.');
}

export function validateRequestBody(body: Record<string, unknown>) {
  requireFields(body, ['department', 'category', 'quantity', 'urgency']);
  if (!categories.includes(body.category as typeof categories[number])) throw new Error('Invalid request category.');
  if (!Number.isInteger(body.quantity) || Number(body.quantity) < 1) throw new Error('quantity must be a positive integer.');
}

export function validateRecommendation(value: unknown) {
  const result = value as Record<string, unknown>;
  if (!result || !actions.includes(result.decision as typeof actions[number])) throw new Error('AI response has an invalid decision.');
  if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) throw new Error('AI response has an invalid confidence.');
  for (const field of ['reasons', 'evidence', 'alternatives', 'assumptions']) if (!Array.isArray(result[field])) throw new Error(`AI response field ${field} must be an array.`);
  if (typeof result.humanReviewRequired !== 'boolean') throw new Error('AI response humanReviewRequired must be boolean.');
  const evidence = (result.evidence as unknown[]).filter((item): item is { source: string; section: string; excerpt: string } => {
    if (!item || typeof item !== 'object') return false;
    const candidate = item as Record<string, unknown>;
    return [candidate.source, candidate.section, candidate.excerpt].every(field => typeof field === 'string' && field.trim().length > 0);
  });
  const assumptions = [...(result.assumptions as string[])];
  if (evidence.length !== (result.evidence as unknown[]).length) assumptions.push('Some AI evidence items were incomplete and were excluded; no citation was inferred.');
  return { ...result, evidence, assumptions } as { decision: typeof actions[number]; confidence: number; reasons: string[]; evidence: { source: string; section: string; excerpt: string }[]; alternatives: string[]; assumptions: string[]; humanReviewRequired: boolean; safetyNote: string | null };
}

export function requestBody(req: Request) { return req.body as Record<string, unknown>; }
