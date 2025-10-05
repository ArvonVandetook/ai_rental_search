import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    console.log("Serverless function started for ListModels (filtered).");

    if (!process.env.API_KEY) {
      console.error("API_KEY not found in environment variables.");
      return response.status(500).json({ message: "Server configuration error: The API_KEY environment variable is not set." });
    }
    console.log("API key check passed.");

    const LIST_MODELS_API_URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.API_KEY}`;

    console.log("Calling Google Generative Language API ListModels...");
    const fetchResponse = await fetch(LIST_MODELS_API_URL, {
      method: 'GET',
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
    console.log("ListModels API direct call successful. Raw response received (will be filtered)."); // Don't log full raw here

    // Filter and present only models relevant to text generation and containing "gemini" or "bison"
    const relevantModels = modelsData.models
      .filter((model: any) => {
        // Ensure model, name, and supportedGenerationMethods exist before processing
        if (!model || !model.name || !model.supportedGenerationMethods) {
          console.warn("Skipping malformed or incomplete model entry:", model);
          return false;
        }

        const isGeminiOrBison = model.name.includes("gemini") || model.name.includes("bison");
        // Check for 'generateContent' OR 'generateText' in the correct property
        const supportsGeneration = model.supportedGenerationMethods.includes("generateContent") || model.supportedGenerationMethods.includes("generateText");

        return isGeminiOrBison && supportsGeneration;
      })
      .map((model: any) => ({
        name: model.name,
        displayName: model.displayName,
        version: model.version,
        // Use supportedGenerationMethods here too for consistency if we display it
        supportedMethods: model.supportedGenerationMethods,
        inputTokenLimit: model.inputTokenLimit,
        outputTokenLimit: model.outputTokenLimit,
      }));

    console.log("Filtered relevant models:", JSON.stringify(relevantModels, null, 2)); // Log filtered output
    console.log("SUCCESSFULLY listed and filtered models. Sending response.");
    return response.status(200).json(relevantModels);

  } catch (error) {
    console.error("[CRITICAL] Unhandled error in serverless function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown internal server error occurred.";
    return response.status(500).json({ message: `The server encountered a critical error: ${errorMessage}` });
  }
}
