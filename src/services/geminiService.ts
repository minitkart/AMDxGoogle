import { GoogleGenAI } from "@google/genai";
import { Meal, WeeklyInsight } from "../types";

// Using @google/genai 1.x pattern
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const analyzeMeal = async (input: string | { data: string, mimeType: string }): Promise<Partial<Meal>> => {
  const model = "gemini-3-flash-preview";
  
  const contents: any[] = [];
  if (typeof input === 'string') {
    contents.push({ role: 'user', parts: [{ text: `Analyze this meal: "${input}". Return the data in structured JSON format.` }] });
  } else {
    contents.push({ 
      role: 'user', 
      parts: [
        { text: "Analyze this meal image for nutritional content. Focus on molecular accuracy. Return data in structured JSON format." },
        { inlineData: input }
      ] 
    });
  }

  const result = await client.models.generateContent({
    model,
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          calories: { type: "number" },
          macros: {
            type: "object",
            properties: {
              protein: { type: "number" },
              carbs: { type: "number" },
              fat: { type: "number" }
            },
            required: ["protein", "carbs", "fat"]
          },
          score: { type: "number", description: "A health score from 0 to 100" },
          verdict: { type: "string" },
          insights: { type: "array", items: { type: "string" } },
          swaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                original: { type: "string" },
                replacement: { type: "string" },
                description: { type: "string" },
                caloriesSaved: { type: "number" }
              }
            }
          },
          micronutrients: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                percent: { type: "number" }
              },
              required: ["name", "percent"]
            },
            description: "Include percentage of RDA for Vitamin C, Iron, Calcium, Omega-3, and Sodium."
          }
        },
        required: ["name", "calories", "macros", "score", "verdict", "insights", "swaps", "micronutrients"]
      }
    }
  });

  return JSON.parse(result.text || '{}');
};

export const getRecipe = async (mealName: string): Promise<{ ingredients: string[], steps: string[] }> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Provide a detailed recipe for ${mealName}. Include exactly what's needed and the preparation protocol. Keep it expert and futuristic.`;
  
  const result = await client.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          ingredients: { type: "array", items: { type: "string" } },
          steps: { type: "array", items: { type: "string" } }
        },
        required: ["ingredients", "steps"]
      }
    }
  });
  
  return JSON.parse(result.text || '{"ingredients":[], "steps":[]}');
};

export const getSuggestions = async (profile: any): Promise<Array<{ name: string, description: string, kcal: number }>> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Based on a goal of ${profile.goal} and user stats, suggest 3 smart meals for the day.`;
  
  const result = await client.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                kcal: { type: "number" }
              },
              required: ["name", "description", "kcal"]
            }
          }
        },
        required: ["suggestions"]
      }
    }
  });
  
  const data = JSON.parse(result.text || '{"suggestions":[]}');
  return data.suggestions;
};

export const generateWeeklyReport = async (meals: Meal[], profile: any): Promise<WeeklyInsight> => {
  const model = "gemini-3-flash-preview";
  
  const mealSummary = meals.map(m => `- ${m.name}: ${m.calories}kcal, Score: ${m.score}`).join('\n');
  const prompt = `
    User Goal: ${profile.goal}
    User Stats: ${profile.weight}kg, ${profile.height}cm, ${profile.activityLevel}
    Recent Meals:
    ${mealSummary}
    
    Generate a concise weekly nutritional report.
  `;

  const result = await client.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          wins: { type: "array", items: { type: "string" } },
          improvements: { type: "array", items: { type: "string" } },
          patterns: { type: "array", items: { type: "string" } }
        },
        required: ["summary", "wins", "improvements", "patterns"]
      }
    }
  });

  return JSON.parse(result.text || '{}');
};
