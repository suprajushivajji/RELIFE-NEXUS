import type { Request, Response } from 'express';
import AuditLog from '../models/AuditLog.js';

export async function getAudit(req: Request, res: Response) {
  try { res.json({ data: await AuditLog.find({ entityId: req.params.id } as any).sort({ createdAt: -1 }) }); }
  catch { res.status(500).json({ error: 'Failed to fetch audit records' }); }
}