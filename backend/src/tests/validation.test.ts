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
