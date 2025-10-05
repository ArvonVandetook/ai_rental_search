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
    }
    console.log("API key check passed.");

    const criteria = request.body;
    console.log("Received criteria:", criteria);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    console.log("Gemini API call successful.");
    
// ... (previous code)

68 });
69
70 console.log("Gemini API call successful.");
71 // FIX: Removed unnecessary markdown stripping. With `responseMimeType: "application/json"`
72 // and a `responseSchema`, the API should return a clean JSON string, making this
73 // defensive code redundant. The outer try/catch block will handle any parsing errors.
74
75 try { // This try block starts here
76   const responseContent = geminiResponse.text; // Assign to a temporary variable

77   if (!responseContent) { // Check if it's undefined
78     console.error("Gemini response text was empty or undefined.");
79     // You can throw an error here to catch it in the outer block,
80     // or return an appropriate response for an empty AI reply.
81     return response.status(500).json({ message: "AI did not return any text content." });
82   }
83
84   const jsonText = responseContent.trim(); // Now safely trim it
85   const properties = JSON.parse(jsonText);
86
87   console.log("SUCCESSFULLY parsed properties. Sending response.");
88   return response.status(200).json(properties);
89
90 } catch (error) { // This is the catch block that handles parsing errors
91   // This block will now catch ANY error, guaranteeing a useful response.
92   console.error("[CRITICAL] Unhandled error in serverless function:", error);
93   const errorMessage = error instanceof Error ? error.message : "An unknown internal server error occurred.";
94   return response.status(500).json({ message: `The server encountered a critical error: ${errorMessage}` });
95 }
