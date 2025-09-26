export interface SearchCriteria {
  location: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  housingType: 'any' | 'apartment' | 'house' | 'condo' | 'townhouse';
}

export interface SavedSearch extends SearchCriteria {
  id: number;
}

export interface RentalProperty {
  title: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  location: string;
  source: string;
  url: string;
}