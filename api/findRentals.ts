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
      Act as an expert rental property search engine.
      Find up to 20 rental properties that match the following criteria:
      - Location: near ${criteria.location}
      - Price Range: between $${criteria.minPrice} and $${criteria.maxPrice} per month
      - Bedrooms: ${criteria.bedrooms}
      - Bathrooms: ${criteria.bathrooms}
      ${housingTypeClause}

      Search across a wide variety of sources including major rental sites like Zillow, Trulia, Rent.com, Apartments.com, as well as more disparate sources like Craigslist, Facebook Marketplace, and local classifieds.
      Return the results as a list of rental properties.
    `;

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    // With responseSchema, the output is guaranteed to be a parsable JSON string.
    const properties = JSON.parse(geminiResponse.text);
    
    response.status(200).json(properties);

  } catch (error) {
    console.error("Error in serverless function:", error);
    const errorMessage = error instanceof Error ? error.message : "An internal server error occurred.";
    response.status(500).json({ message: errorMessage });
  }
}