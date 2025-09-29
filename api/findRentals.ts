import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define the schema for the AI's response to ensure consistent JSON output.
const schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      price: { type: Type.STRING },
      bedrooms: { type: Type.NUMBER },
      bathrooms: { type: Type.NUMBER },
      location: { type: Type.STRING },
      source: { type: Type.STRING },
      url: { type: Type.STRING },
    },
    required: ['title', 'price', 'bedrooms', 'bathrooms', 'location', 'source', 'url'],
  },
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    const criteria = request.body;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const housingTypeClause = criteria.housingType === 'any' ? '' : ` The housing type should be a ${criteria.housingType}.`;

    const prompt = `
      Generate a list of up to 15 fictional, but realistic, rental properties that match the following criteria.
      The data should be plausible for the requested location.
      - Location: ${criteria.location}
      - Price Range: between $${criteria.minPrice} and $${criteria.maxPrice} per month
      - Bedrooms: ${criteria.bedrooms}
      - Bathrooms: ${criteria.bathrooms}
      ${housingTypeClause}

      For each property, provide a realistic-sounding title, price, location, source (like 'Zillow' or 'Apartments.com'), and a placeholder URL (e.g., 'https://example.com/listing/123').
      Do not add any commentary or introductory text before or after the JSON list.
    `;

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    // The response text is a JSON string. Add robust parsing to handle potential markdown wrappers.
    let jsonText = geminiResponse.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7, -3).trim();
    }
    
    const properties = JSON.parse(jsonText);
    
    response.status(200).json(properties);

  } catch (error) {
    console.error("Error in serverless function:", error);
    const errorMessage = error instanceof Error ? error.message : "An internal server error occurred.";
    response.status(500).json({ message: errorMessage });
  }
}