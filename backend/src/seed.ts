import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import Asset from './models/Asset.js';
import ResourceRequest from './models/ResourceRequest.js';
import Recommendation from './models/Recommendation.js';
import MaintenanceRecord from './models/MaintenanceRecord.js';
import ImpactRecord from './models/ImpactRecord.js';
import KnowledgeDocument from './models/KnowledgeDocument.js';
import AuditLog from './models/AuditLog.js';
import { connectDatabase } from './db.js';

async function load<T>(file: string): Promise<T[]> { return JSON.parse(await readFile(resolve(process.cwd(), '..', 'data', 'seed', file), 'utf8')) as T[]; }

async function seed() {
  await connectDatabase();
  await Asset.deleteMany({});
  await ResourceRequest.deleteMany({});
  await Recommendation.deleteMany({}); await MaintenanceRecord.deleteMany({}); await ImpactRecord.deleteMany({}); await KnowledgeDocument.deleteMany({}); await AuditLog.deleteMany({});
  const [assets, maintenance, requests, recommendations, impacts, documents, audits] = await Promise.all([
    load<Record<string, unknown>>('assets.json'), load<Record<string, unknown>>('maintenance_records.json'), load<Record<string, unknown>>('resource_requests.json'), load<Record<string, unknown>>('recommendations.json'), load<Record<string, unknown>>('impact_records.json'), load<Record<string, unknown>>('documents.json'), load<Record<string, unknown>>('audit_logs.json'),
  ]);
  await Asset.insertMany(assets.map(asset => ({ ...asset, reportedIssue: asset.reportedIssue ?? '', analyzed: false })));
  await MaintenanceRecord.insertMany(maintenance); await ResourceRequest.insertMany(requests.map(request => ({ ...request, createdAt: request.createdAt ?? new Date().toISOString() })));
  await Recommendation.insertMany(recommendations); await ImpactRecord.insertMany(impacts); await KnowledgeDocument.insertMany(documents);
  await AuditLog.insertMany(audits.map(audit => ({ entityType: 'asset', entityId: audit.assetId, action: audit.action, actor: audit.actor, metadata: audit.details, createdAt: audit.timestamp, updatedAt: audit.timestamp })));
  console.log(`Seeded ${assets.length} assets, ${maintenance.length} maintenance records, ${requests.length} requests, ${recommendations.length} recommendations, ${impacts.length} impacts, ${documents.length} documents, and ${audits.length} audit records.`);
  process.exit(0);
}

seed().catch(error => { console.error('Seed failed:', error instanceof Error ? error.message : error); process.exit(1); });
