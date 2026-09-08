import { Asset, Recommendation, ResourceRequest } from "./types";

const assets: Asset[] = [
  { id: "AST-1001", name: "Seminar Hall Projector", category: "PROJECTOR", brand: "Epson", model: "EB-X06", department: "Facilities", location: "Seminar Hall A", condition: "FAIR", reportedIssue: "Poor image quality and intermittent color shift", usageStatus: "MAINTENANCE", lifecycleStatus: "UNDER_REVIEW", purchaseYear: 2021, replacementCost: 890, specs: ["HDMI", "3600 lumens"], massKg: 2.7 },
  { id: "AST-1002", name: "Engineering Monitor 01", category: "MONITOR", brand: "Dell", model: "P2422H", department: "Engineering", location: "Store Room B", condition: "GOOD", reportedIssue: "", usageStatus: "UNUSED", lifecycleStatus: "AVAILABLE", purchaseYear: 2022, replacementCost: 230, specs: ["24-inch", "HDMI", "1080p"], massKg: 3.4 },
  { id: "AST-1003", name: "Engineering Monitor 02", category: "MONITOR", brand: "Dell", model: "P2422H", department: "Engineering", location: "Store Room B", condition: "GOOD", reportedIssue: "", usageStatus: "UNUSED", lifecycleStatus: "AVAILABLE", purchaseYear: 2022, replacementCost: 230, specs: ["24-inch", "HDMI", "1080p"], massKg: 3.4 },
  { id: "AST-1004", name: "Finance Laptop", category: "LAPTOP", brand: "Lenovo", model: "ThinkPad E14", department: "Finance", location: "Finance Office", condition: "EXCELLENT", reportedIssue: "", usageStatus: "ACTIVE", lifecycleStatus: "IN_USE", purchaseYear: 2024, replacementCost: 950, specs: ["16GB RAM", "256GB SSD"], massKg: 1.6 },
  { id: "AST-1005", name: "Reception Printer", category: "PRINTER", brand: "HP", model: "LaserJet Pro", department: "Administration", location: "Reception", condition: "POOR", reportedIssue: "Paper jams and streaking", usageStatus: "MAINTENANCE", lifecycleStatus: "UNDER_REVIEW", purchaseYear: 2018, replacementCost: 420, specs: ["A4", "Network"], massKg: 8.2 },
  { id: "AST-1006", name: "Unsafe Projector", category: "PROJECTOR", brand: "UNKNOWN", model: null, department: "Science", location: "Lab Store", condition: "UNSAFE", reportedIssue: "Burning smell and damaged power cable", usageStatus: "MAINTENANCE", lifecycleStatus: "UNDER_REVIEW", purchaseYear: 2017, replacementCost: 800, specs: [], massKg: null },
];

const requests: ResourceRequest[] = [{ id: "REQ-2001", department: "CSE", category: "MONITOR", quantity: 10, specifications: ["24-inch+", "HDMI", "working"], urgency: "MEDIUM", status: "OPEN", createdAt: new Date().toISOString() }];
const recommendations: Recommendation[] = [];

export const store = { assets, requests, recommendations };
export function seedMoreAssets() { while (assets.length < 32) { const i = assets.length + 1; assets.push({ id: `AST-${1000 + i}`, name: `Campus Monitor ${i}`, category: "MONITOR", brand: "Acer", model: "KA242Y", department: i % 2 ? "Library" : "Student Services", location: "Central Store", condition: i % 5 === 0 ? "FAIR" : "GOOD", reportedIssue: "", usageStatus: "UNUSED", lifecycleStatus: "AVAILABLE", purchaseYear: 2022, replacementCost: 180, specs: ["24-inch", "HDMI"], massKg: 3.1 }); } }
seedMoreAssets();
