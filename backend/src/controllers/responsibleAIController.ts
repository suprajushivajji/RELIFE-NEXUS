import type { Request, Response } from 'express';
import { config } from '../config.js';

export const getResponsibleAIInfo = async (req: Request, res: Response) => {
  try {
    res.json({
      data: {
        aiProvider: 'OpenRouter',
        aiModel: config.aiModel,
        aiFallbackModel: config.aiFallbackModel,
        timeoutMs: config.aiTimeoutMs,
        maxRetries: config.aiMaxRetries,
        guardrails: {
          fairness: 'Decisions use objective asset criteria (category, condition, availability, specifications). Never uses employee identity, department prestige, or personal characteristics.',
          transparency: 'Every recommendation exposes decision, confidence, reasons, evidence, assumptions, and human review status.',
          privacy: 'Minimum necessary data sent to AI. API keys remain server-side. Sensitive information not exposed in frontend.',
          safety: 'Unsafe conditions trigger human review. System never generates hazardous repair instructions.',
          uncertainty: 'System supports UNKNOWN, INSUFFICIENT_EVIDENCE, NEEDS_REVIEW, IMAGE_ANALYSIS_UNAVAILABLE, AI_TIMEOUT states.',
          humanOversight: 'AI cannot autonomously dispose assets, purchase assets, approve hazardous repair, or make irreversible lifecycle decisions.',
          auditability: 'Every AI decision records timestamp, asset, model, recommendation, confidence, evidence, assumptions, and human approval/rejection.'
        },
        supportedDecisions: ['REPAIR', 'REFURBISH', 'REUSE', 'REDEPLOY', 'RECYCLE', 'REPLACE', 'NEEDS_REVIEW'],
        humanOversightRequired: true,
        dataHandling: {
          sentToAI: ['Asset category', 'Condition', 'Reported issue', 'Usage status', 'Lifecycle status'],
          notSentToAI: ['Employee identity', 'Department prestige', 'Personal characteristics', 'API keys', 'Sensitive documents']
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch responsible AI information' });
  }
};
