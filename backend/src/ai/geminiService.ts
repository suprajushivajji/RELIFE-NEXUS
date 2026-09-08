import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? '' });

export const getGeminiRecommendation = async (assetData: any): Promise<any> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }
  
  const prompt = `
  You are an AI decision engine for ReLife Nexus.
  Given the following asset details, determine the most sustainable lifecycle action.
  Asset Details: ${JSON.stringify(assetData)}
  
  Possible Actions: "REPAIR" | "REFURBISH" | "REUSE" | "REDEPLOY" | "RECYCLE" | "REPLACE" | "NEEDS_REVIEW"
  
  Return a valid JSON object ONLY, adhering to this structure:
  {
    "decision": "LifecycleAction",
    "confidence": 0.0 to 1.0,
    "reasons": ["string array"],
    "evidence": [{"source": "string", "section": "string", "excerpt": "string"}],
    "alternatives": ["string array"],
    "assumptions": ["string array"],
    "humanReviewRequired": boolean,
    "safetyNote": "string or null"
  }
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response from Gemini");
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback to deterministic if Gemini fails
    throw error;
  }
};
