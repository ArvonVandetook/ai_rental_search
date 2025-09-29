
import type { SearchCriteria, RentalProperty } from '../types';

// This function now calls our own backend proxy (the Vercel serverless function)
// instead of the Gemini API directly. This is much more secure.
export const findRentals = async (criteria: SearchCriteria): Promise<RentalProperty[]> => {
  try {
    const response = await fetch('/api/findRentals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(criteria),
    });

    if (!response.ok) {
      // Try to parse the error message from our serverless function.
      const errorData = await response.json().catch(() => ({ message: 'An unknown server error occurred' }));
      throw new Error(errorData.message || 'Failed to fetch rental properties from the server.');
    }

    const properties = await response.json();
    return properties;

  } catch (error) {
    console.error("An error occurred while calling the backend service:", error);
    // Re-throw the error so the UI can catch it and display a message.
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unexpected network error occurred.");
  }
};