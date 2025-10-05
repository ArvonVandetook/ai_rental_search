import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define the schema for the AI's response (kept for reference, not directly used in fetch)
const schema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      title: { type: "string" },
      price: { type: "string" },
      bedrooms: { type: "number" },
      bathrooms: { type: "number" },
      location: { type: "string" },
      source: { type: "string" },
      url: { type: "string" },
    },
    required: ['title', 'price', 'bedrooms', 'bathrooms', 'location', 'source', 'url'],
  },
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
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

    // --- Removed listModels attempt as it's not working ---
    // console.log("Attempting to list available Generative AI models...");
    // try {
    //     // ... (removed)
    // } catch (listError) {
    //     console.error("Error listing models at runtime (method might genuinely not exist):", listError);
    // }
    // --- END Removed temporary addition ---

    const housingTypeClause = criteria.housingType === 'any' ? '' : ` The housing type should be a ${criteria.housingType}.`;

    const promptText = `
      Generate a list of up to 10 fictional, but realistic, rental properties that match the following criteria.
      The data should be plausible for the requested location.
      - Location: ${criteria.location}
      - Price Range: between $${criteria.minPrice} and $${criteria.maxPrice} per month
      - Bedrooms: ${criteria.bedrooms}
      - Bathrooms: ${criteria.bathrooms}
      ${housingTypeClause}

      For each property, provide a realistic-sounding title, price, location, source (like 'Zillow' or 'Apartments.com'), and a placeholder URL (e.g., 'https://example.com/listing/123').
      The output MUST be a JSON array of objects, each matching the structure:
      {
        "title": "string",
        "price": "string",
        "bedrooms": number,
        "bathrooms": number,
        "location": "string",
        "source": "string",
        "url": "string"
      }
      Do not add any commentary or introductory text before or after the JSON list.
    `;

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.API_KEY}`;
    // If gemini-1.0-pro continues to fail with direct fetch, we can try 'gemini-pro' here as well.

    console.log("Calling Gemini API directly via fetch with gemini-1.0-pro...");
    const fetchResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: promptText
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
        }
      }),
    });

    if (!fetchResponse.ok) {
      const errorBody = await fetchResponse.text();
      console.error("Gemini API fetch failed:", fetchResponse.status, fetchResponse.statusText, errorBody);
      // Attempt to parse error as JSON if possible, otherwise return raw text
      let parsedError = errorBody;
      try {
        parsedError = JSON.parse(errorBody);
      } catch (e) {
        // Not JSON, keep as text
      }
      throw new Error(`Gemini API Error (${fetchResponse.status}): ${JSON.stringify(parsedError)}`);
    }

    const geminiData = await fetchResponse.json();
    console.log("Gemini API direct call successful. Raw response:", JSON.stringify(geminiData, null, 2));

    const responseContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!responseContent) {
      console.error("Gemini response text was empty or undefined.");
      return response.status(500).json({ message: "AI did not return any text content." });
    }

    const jsonText = responseContent.trim();
    const properties = JSON.parse(jsonText);
    console.log("Parsed Properties:", JSON.stringify(properties, null, 2));
    console.log("First Property URL:", properties.length > 0 ? properties[0].url : "No properties found or no URL property on first.");

    console.log("SUCCESSFULLY parsed properties. Sending response.");
    return response.status(200).json(properties);

  } catch (error) {
    console.error("[CRITICAL] Unhandled error in serverless function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown internal server error occurred.";
    return response.status(500).json({ message: `The server encountered a critical error: ${errorMessage}` });
  }
}
