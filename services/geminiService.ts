import { GoogleGenAI } from "@google/genai";
import type { SearchCriteria, RentalProperty } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const findRentals = async (criteria: SearchCriteria): Promise<RentalProperty[]> => {
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
    
    IMPORTANT: Provide your response as a single, clean JSON array of objects and nothing else. Each object must represent a property and include the following fields:
    - title (string)
    - price (string, e.g., "$2,500")
    - bedrooms (number)
    - bathrooms (number)
    - location (string)
    - source (string, e.g., "Zillow", "Craigslist")
    - url (string, a direct URL to the live listing)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        // Use Google Search grounding for live, real-world data.
        tools: [{googleSearch: {}}],
      },
    });
    
    // The model might return conversational text around the JSON array.
    // We need to robustly extract the JSON array from the response text.
    const textResponse = response.text.trim();
    
    const startIndex = textResponse.indexOf('[');
    const endIndex = textResponse.lastIndexOf(']');

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      console.error("Could not find a valid JSON array in the AI response. Full response:", textResponse);
      throw new Error("Could not find a valid JSON array in the AI response.");
    }
    
    const jsonString = textResponse.substring(startIndex, endIndex + 1);
    
    try {
      const properties = JSON.parse(jsonString) as RentalProperty[];
      // Post-process to ensure data types are correct, as the model can be inconsistent.
      return properties.map(p => ({
        ...p,
        bedrooms: Number(p.bedrooms) || 0,
        bathrooms: Number(p.bathrooms) || 0,
      }));
    } catch (parseError) {
      console.error("Failed to parse extracted JSON. String was:", jsonString);
      console.error("Parse Error:", parseError);
      throw new Error("The AI returned a malformed response. Please try your search again.");
    }

  } catch (error) {
    // If it's one of our custom errors, re-throw it to be displayed to the user.
    if (error instanceof Error && (error.message.includes("Could not find a valid JSON array") || error.message.includes("malformed response"))) {
        throw error;
    }

    console.error("An unexpected error occurred in geminiService:", error);
    throw new Error("Failed to fetch rental properties from the AI model.");
  }
};
