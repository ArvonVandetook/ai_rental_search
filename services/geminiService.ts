import type { SearchCriteria, RentalProperty } from '../types';

export const findRentals = async (criteria: SearchCriteria): Promise<RentalProperty[]> => {
  try {
    // 1. Construct the prompt string from the criteria object
    const prompt = `Find rental properties in ${criteria.location} 
      with ${criteria.bedrooms} bedrooms, ${criteria.bathrooms === 'any' ? 'any' : criteria.bathrooms} bathrooms, 
      and a housing type of ${criteria.housingType}. 
      The price range should be between $${criteria.minPrice} and $${criteria.maxPrice}.
      Please provide the response in a JSON array format, where each object has 'address', 'price', 'bedrooms', 'bathrooms', 'type', 'url', and 'description' fields.`;

    console.log("Frontend sending constructed prompt to backend:", prompt); // Added for debugging

    const response = await fetch('/api/findRentals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // 2. Send an object with a 'prompt' key containing the constructed string
      body: JSON.stringify({ prompt: prompt }), // <-- THIS IS THE CRUCIAL CHANGE
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An unknown server error occurred' }));
      throw new Error(errorData.message || 'Failed to fetch rental properties from the server.');
    }

    // 3. The backend will return an object like { generatedText: "..." }
    const responseData = await response.json();
    console.log("Raw response from backend:", responseData); // Added for debugging

    // Parse the generatedText assuming it's a JSON string of properties
    const generatedText = responseData.generatedText;
    let properties: RentalProperty[] = [];
    
    try {
        // Attempt to parse the generated text as a JSON array of RentalProperty
        properties = JSON.parse(generatedText);
    } catch (parseError) {
        console.warn("Could not parse AI response as JSON. Returning an empty array for now.", parseError, generatedText);
        // If the AI doesn't return perfect JSON, we might want to handle this gracefully
        // For now, we'll log it and proceed with an empty array or a single error property
        return [{
          id: 'error-id',
          address: 'Parsing Error',
          price: `$${criteria.minPrice} - $${criteria.maxPrice}`,
          bedrooms: criteria.bedrooms,
          bathrooms: criteria.bathrooms,
          type: criteria.housingType,
          url: '#',
          description: `The AI response could not be parsed as valid JSON. Raw response: ${generatedText.substring(0, 200)}...`,
          imageUrl: ''
        }];
    }

    return properties;

  } catch (error) {
    console.error("An error occurred while calling the backend service:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unexpected network error occurred.");
  }
};
