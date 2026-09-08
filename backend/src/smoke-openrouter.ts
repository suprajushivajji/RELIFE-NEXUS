import { getAIRecommendation } from './ai/openRouterService.js';

const result = await getAIRecommendation({
  id: 'TEST-1',
  category: 'MONITOR',
  condition: 'GOOD',
  reportedIssue: '',
  lifecycleStatus: 'AVAILABLE',
  specs: ['24-inch', 'HDMI'],
});

console.log(JSON.stringify({
  decision: result.decision,
  confidenceType: typeof result.confidence,
  evidenceIsArray: Array.isArray(result.evidence),
  humanReviewRequired: result.humanReviewRequired,
}));
