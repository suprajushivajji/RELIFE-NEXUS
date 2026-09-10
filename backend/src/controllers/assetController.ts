import type { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';
import Asset from '../models/Asset.js';
import type { IAsset } from '../models/Asset.js';
import AuditLog from '../models/AuditLog.js';
import { analyzeAsset } from '../ai/decisionEngine.js';
import { requestBody, validateAssetBody } from '../utils/validation.js';

export const getAssets = async (req: Request, res: Response) => {
  try {
    const assets = await Asset.find().sort({ createdAt: -1 });
    res.json({ data: assets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
};

export const getAssetById = async (req: Request, res: Response) => {
  try {
    const asset = await Asset.findOne({ id: req.params.id } as any) as HydratedDocument<IAsset> | null;
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    res.json({ data: asset });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
};

export const createAsset = async (req: Request, res: Response) => {
  try {
    validateAssetBody(requestBody(req));
    const assetData = {
      ...req.body,
      id: `AST-${Date.now()}`,
      lifecycleStatus: "UNDER_REVIEW",
      analyzed: false
    };
    const newAsset = new Asset(assetData);
    await newAsset.save();
    res.status(201).json({ data: newAsset });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create asset' });
  }
};

export const analyzeAssetAction = async (req: Request, res: Response) => {
  try {
    const asset = await Asset.findOne({ id: req.params.id } as any) as HydratedDocument<IAsset> | null;
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    
    const recommendation = await analyzeAsset(asset);
    asset.analyzed = true;
    await asset.save();
    
    await AuditLog.create({ entityType: 'asset', entityId: asset.id, action: 'ANALYZED', metadata: { recommendationId: recommendation.id, model: process.env.AI_MODEL ?? null } });
    res.json({ data: recommendation });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to analyze asset';
    const status = /required|OpenRouter|validation|provider|timed out|timeout/i.test(message) ? 503 : 500;
    res.status(status).json({ error: message });
  }
};

export const updateAsset = async (req: Request, res: Response) => {
  try {
    validateAssetBody(requestBody(req));
    const asset = await Asset.findOneAndUpdate({ id: req.params.id } as any, requestBody(req), { new: true, runValidators: true }) as HydratedDocument<IAsset> | null;
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    await AuditLog.create({ entityType: 'asset', entityId: asset.id, action: 'UPDATED' });
    res.json({ data: asset });
  } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update asset' }); }
};

export const deleteAsset = async (req: Request, res: Response) => {
  try {
    const asset = await Asset.findOneAndDelete({ id: req.params.id } as any) as HydratedDocument<IAsset> | null;
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    await AuditLog.create({ entityType: 'asset', entityId: asset.id, action: 'DELETED' });
    res.status(204).send();
  } catch { res.status(500).json({ error: 'Failed to delete asset' }); }
};
