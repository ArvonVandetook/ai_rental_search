import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ... (rest of your code remains the same)

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    // ... (your initial log messages and checks)

    const ai = new GoogleGenerativeAI(process.env.API_KEY as string);

    // --- TEMPORARY ADDITION: LIST AVAILABLE MODELS (Modified to use 'as any') ---
    console.log("Attempting to list available Generative AI models using 'as any' to bypass TypeScript build error...");
    let modelsList;
    try {
        // Use 'as any' to bypass TypeScript's check, assuming the method exists at runtime
        const { models } = await (ai as any).listModels();
        modelsList = models.map((model: any) => ({ // Add (model: any) for safety if model properties are also T/S errors
            name: model.name,
            supportedMethods: model.supportedGenerationMethods,
            version: model.version
        }));
        console.log("Available Models:", JSON.stringify(modelsList, null, 2));
    } catch (listError) {
        console.error("Error listing models at runtime (this means the method might genuinely not exist):", listError);
    }
    // --- END TEMPORARY ADDITION ---

    const housingTypeClause = criteria.housingType === 'any' ? '' : ` The housing type should be a ${criteria.housingType}.`;

    const prompt = `
      // ... (rest of your prompt and Gemini API call)
    `;

    console.log("Calling Gemini API with gemini-1.0-pro...");
    const model = ai.getGenerativeModel({
      model: "gemini-1.0-pro",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    const geminiResponse = await model.generateContent(prompt);
    console.log("Gemini API call successful.");

    // ... (rest of your response handling)

  } catch (error) {
    console.error("[CRITICAL] Unhandled error in serverless function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown internal server error occurred.";
    return response.status(500).json({ message: `The server encountered a critical error: ${errorMessage}` });
  }
}
