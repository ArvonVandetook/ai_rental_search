import { GoogleGenerativeAI, Type } from "@google/generative-ai"; // Corrected import from GoogleGenAI to GoogleGenerativeAI
import { Type } from "@google/generative-ai/server";
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
  // Wrap the entire function body in a try-catch block to guarantee a JSON error response,
  // preventing silent crashes from timeouts or initialization errors.
  try {
    console.log("Serverless function started.");

    if (request.method !== 'POST') {
      console.log("Invalid method:", request.method);
      return response.status(405).json({ message: 'Only POST requests are allowed' });
    }
    console.log("Method check passed.");

    if (!process.env.API_KEY) {
      console.error("API_KEY not found in environment variables.");
      return response.status(500).json({ message: "Server configuration error: The API_KEY environment variable is not set. Please check your Vercel project settings." });
    } // CORRECTED: Removed extra '}' here.
    console.log("API key check passed.");

    const criteria = request.body;
    console.log("Received criteria:", criteria);

    // Corrected import: GoogleGenerativeAI instead of GoogleGenAI
    const ai = new GoogleGenerativeAI(process.env.API_KEY as string); // API key is passed directly to the constructor

    const housingTypeClause = criteria.housingType === 'any' ? '' : ` The housing type should be a ${criteria.housingType}.`;

    const prompt = `
      Generate a list of up to 10 fictional, but realistic, rental properties that match the following criteria.
      The data should be plausible for the requested location.
      - Location: ${criteria.location}
      - Price Range: between $${criteria.minPrice} and $${criteria.maxPrice} per month
      - Bedrooms: ${criteria.bedrooms}
      - Bathrooms: ${criteria.bathrooms}
      ${housingTypeClause}

      For each property, provide a realistic-sounding title, price, location, source (like 'Zillow' or 'Apartments.com'), and a placeholder URL (e.g., 'https://example.com/listing/123').
      Do not add any commentary or introductory text before or after the JSON list.
    `;

    console.log("Calling Gemini API...");
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json", responseSchema: schema } }); // Updated model usage
    const geminiResponse = await model.generateContent(prompt); // Removed 'contents' property, passed prompt directly
    console.log("Gemini API call successful.");

    // Removed the nested try block, relying on the outer try-catch for robustness.
    // Also applied the nullish coalescing operator for 'text' property.
    const responseContent = await geminiResponse.response.text() ?? '';

    if (!responseContent) { // Check if it's undefined or empty
      console.error("Gemini response text was empty or undefined.");
      return response.status(500).json({ message: "AI did not return any text content." });
    }

    const jsonText = responseContent.trim(); // Now safely trim it
    const properties = JSON.parse(jsonText);
    console.log("Parsed Properties:", JSON.stringify(properties, null, 2));
    console.log("First Property URL:", properties.length > 0 ? properties[0].url : "No properties found or no URL property on first.");

    console.log("SUCCESSFULLY parsed properties. Sending response.");
    return response.status(200).json(properties);

  } catch (error) { // This is the catch block for the entire function
    console.error("[CRITICAL] Unhandled error in serverless function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown internal server error occurred.";
    return response.status(500).json({ message: `The server encountered a critical error: ${errorMessage}` });
  }
}
