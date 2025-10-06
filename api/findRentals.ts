import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    console.log("Serverless function 'findRentals' started.");

    if (!process.env.API_KEY) {
      console.error("API_KEY not found in environment variables.");
      return response.status(500).json({ message: "Server configuration error: The API_KEY environment variable is not set." });
    }
    console.log("API key check passed.");

    // Ensure the request method is POST
    if (request.method !== 'POST') {
      console.warn(`Method Not Allowed: ${request.method}`);
      return response.status(405).json({ message: 'Method Not Allowed. This endpoint only supports POST requests.' });
    }

    // Extract the prompt from the request body
    const { prompt } = request.body;

    if (!prompt) {
      console.warn("Missing 'prompt' in request body.");
      return response.status(400).json({ message: "Bad Request: 'prompt' is required in the request body." });
    }
    console.log("Received prompt:", prompt);

    // --- Configuration for Gemini API call ---
    const MODEL_NAME = "models/gemini-2.5-pro"; // Using the newly identified model
    const GENERATE_CONTENT_API_URL = `https://generativelanguage.googleapis.com/v1beta/${MODEL_NAME}:generateContent?key=${process.env.API_KEY}`;

    const requestPayload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7, // Adjust as needed for creativity vs. consistency
        topP: 0.95,
        topK: 60,
        maxOutputTokens: 1024, // Adjust based on expected response length
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
      ],
    };

    console.log(`Calling Gemini API (${MODEL_NAME})...`);
    const geminiResponse = await fetch(GENERATE_CONTENT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error(`Gemini API call failed for ${MODEL_NAME}:`, geminiResponse.status, geminiResponse.statusText, errorBody);
      let parsedError = errorBody;
      try {
        parsedError = JSON.parse(errorBody);
      } catch (e) {
        // Not JSON, keep as text
      }
      throw new Error(`Gemini API Error (${geminiResponse.status}): ${JSON.stringify(parsedError)}`);
    }

    const geminiData = await geminiResponse.json();
    console.log("Gemini API call successful. Raw response:", JSON.stringify(geminiData, null, 2));

    // Extract the generated text (assuming it's in a specific format)
    const generatedText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated.";
    console.log("Generated text:", generatedText);

    // Send the generated text back to the client
    return response.status(200).json({ generatedText });

  } catch (error) {
    console.error("[CRITICAL] Unhandled error in 'findRentals' serverless function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown internal server error occurred.";
    return response.status(500).json({ message: `The server encountered a critical error: ${errorMessage}` });
  }
}
