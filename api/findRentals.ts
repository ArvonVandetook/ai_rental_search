import { GoogleGenAI } from "@google/genai";

// This function is the serverless API endpoint.
// Vercel automatically provides the request and response objects.
export default async function handler(request, response) {
  // Ensure the request is a POST request.
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    // The search criteria sent from the frontend.
    const criteria = request.body;

    // Initialize the Gemini client with the secure environment variable.
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
      
      IMPORTANT: Provide your response as a single, clean JSON array of objects and nothing else. Each object must represent a property and include the following fields:
      - title (string)
      - price (string, e.g., "$2,500")
      - bedrooms (number)
      - bathrooms (number)
      - location (string)
      - source (string, e.g., "Zillow", "Craigslist")
      - url (string, a direct URL to the live listing)
    `;

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    
    const textResponse = geminiResponse.text.trim();
    
    const startIndex = textResponse.indexOf('[');
    const endIndex = textResponse.lastIndexOf(']');

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      throw new Error("Could not find a valid JSON array in the AI response.");
    }
    
    const jsonString = textResponse.substring(startIndex, endIndex + 1);
    
    let properties = JSON.parse(jsonString);

    // Post-process to ensure data types are correct.
    properties = properties.map(p => ({
      ...p,
      bedrooms: Number(p.bedrooms) || 0,
      bathrooms: Number(p.bathrooms) || 0,
    }));
    
    // Send the successful response back to the client.
    response.status(200).json(properties);

  } catch (error) {
    console.error("Error in serverless function:", error);
    // Send a detailed error response back to the client.
    response.status(500).json({ message: error.message || "An internal server error occurred." });
  }
}
