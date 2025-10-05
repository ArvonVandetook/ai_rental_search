import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    console.log("Serverless function started for ListModels.");

    if (!process.env.API_KEY) {
      console.error("API_KEY not found in environment variables.");
      return response.status(500).json({ message: "Server configuration error: The API_KEY environment variable is not set." });
    }
    console.log("API key check passed.");

    // New URL to list models
    const LIST_MODELS_API_URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.API_KEY}`;

    console.log("Calling Google Generative Language API ListModels...");
    const fetchResponse = await fetch(LIST_MODELS_API_URL, {
      method: 'GET', // ListModels uses GET
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!fetchResponse.ok) {
      const errorBody = await fetchResponse.text();
      console.error("ListModels API fetch failed:", fetchResponse.status, fetchResponse.statusText, errorBody);
      let parsedError = errorBody;
      try {
        parsedError = JSON.parse(errorBody);
      } catch (e) {
        // Not JSON, keep as text
      }
      throw new Error(`ListModels API Error (${fetchResponse.status}): ${JSON.stringify(parsedError)}`);
    }

    const modelsData = await fetchResponse.json();
    console.log("ListModels API direct call successful. Raw response:", JSON.stringify(modelsData, null, 2));

    // Filter and present only relevant model info for clarity
    const availableModels = modelsData.models.map((model: any) => ({
      name: model.name,
      displayName: model.displayName,
      version: model.version,
      supportedMethods: model.supportedMethods,
      inputTokenLimit: model.inputTokenLimit,
      outputTokenLimit: model.outputTokenLimit,
    }));

    console.log("SUCCESSFULLY listed models. Sending response.");
    return response.status(200).json(availableModels);

  } catch (error) {
    console.error("[CRITICAL] Unhandled error in serverless function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown internal server error occurred.";
    return response.status(500).json({ message: `The server encountered a critical error: ${errorMessage}` });
  }
}
