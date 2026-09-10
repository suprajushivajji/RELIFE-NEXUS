import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAssetBody, validateRecommendation, validateRequestBody } from '../utils/validation.js';

test('asset validation rejects missing required fields', () => {
  assert.throws(() => validateAssetBody({}), /Missing required fields/);
});

test('request validation accepts a monitor request', () => {
  assert.doesNotThrow(() => validateRequestBody({ department: 'CSE', category: 'MONITOR', quantity: 10, urgency: 'MEDIUM' }));
});

test('AI validation rejects unsupported decisions', () => {
  assert.throws(() => validateRecommendation({ decision: 'BUY', confidence: 1, reasons: [], evidence: [], alternatives: [], assumptions: [], humanReviewRequired: true }), /invalid decision/);
});

test('AI validation excludes incomplete evidence without inventing citations', () => {
  const result = validateRecommendation({ decision: 'REPAIR', confidence: 0.8, reasons: ['Reported issue may be repairable.'], evidence: [{ source: 'Manual' }, { source: 'Policy', section: 'Safety', excerpt: 'Inspect professionally.' }], alternatives: [], assumptions: [], humanReviewRequired: true, safetyNote: null });
  assert.equal(result.evidence.length, 1);
  assert.match(result.assumptions.join(' '), /incomplete/);
});
