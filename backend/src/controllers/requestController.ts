import type { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';
import ResourceRequest from '../models/ResourceRequest.js';
import type { IResourceRequest } from '../models/ResourceRequest.js';
import Asset from '../models/Asset.js';
import { requestBody, validateRequestBody } from '../utils/validation.js';

export const getRequests = async (req: Request, res: Response) => {
  try {
    const requests = await ResourceRequest.find().sort({ createdAt: -1 });
    res.json({ data: requests });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

export const createRequest = async (req: Request, res: Response) => {
  try {
    validateRequestBody(requestBody(req));
    const reqData = {
      ...req.body,
      id: `REQ-${Date.now()}`,
      status: "OPEN",
      createdAt: new Date().toISOString()
    };
    const newReq = new ResourceRequest(reqData);
    await newReq.save();
    res.status(201).json({ data: newReq });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create request' });
  }
};

export const getRequestById = async (req: Request, res: Response) => {
  try {
    const request = await ResourceRequest.findOne({ id: req.params.id } as any) as HydratedDocument<IResourceRequest> | null;
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json({ data: request });
  } catch { res.status(500).json({ error: 'Failed to fetch request' }); }
};

export const matchRequest = async (req: Request, res: Response) => {
  try {
    const request = await ResourceRequest.findOne({ id: req.params.id } as any) as HydratedDocument<IResourceRequest> | null;
    if (!request) return res.status(404).json({ error: 'Request not found' });
    
    // Simple deterministic matching for now
    const availableAssets = await Asset.find({ 
      category: request.category, 
      lifecycleStatus: "AVAILABLE" 
    });
    
    const matches = availableAssets.filter(asset => ["EXCELLENT", "GOOD"].includes(asset.condition) && request.specifications.filter(spec => !/working/i.test(spec)).every(spec => asset.specs.some(s => s.toLowerCase().includes(spec.replace('+', '').toLowerCase()))));
    
    if (matches.length > 0) {
      request.status = "MATCHED";
      await request.save();
    }
    
    res.json({ data: { requestId: request.id, matches: matches.map(asset => ({ assetId: asset.id, compatibilityScore: Math.min(0.99, 0.72 + asset.specs.length * 0.05), reasons: ['Category matches request.', 'Asset is available and in working condition.', `Recorded specifications: ${asset.specs.join(', ')}.`], condition: asset.condition, location: asset.location })) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to match request' });
  }
};
