import type { SearchCriteria, RentalProperty } from '../types';

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
      const errorData = await response.json().catch(() => ({ message: 'An unknown server error occurred' }));
      throw new Error(errorData.message || 'Failed to fetch rental properties from the server.');
    }

    const properties = await response.json();
    return properties;

  } catch (error) {
    console.error("An error occurred while calling the backend service:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unexpected network error occurred.");
  }
};
