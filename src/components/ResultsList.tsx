import React from 'react';
import type { RentalProperty } from '../types';
import { PropertyCard } from './PropertyCard';
import { Spinner } from './Spinner';
import { EmptyStateIcon } from './icons';

interface ResultsListProps {
  properties: RentalProperty[];
  isLoading: boolean;
  error: string | null;
  favorites: RentalProperty[];
  onToggleFavorite: (property: RentalProperty) => void;
}

export const ResultsList: React.FC<ResultsListProps> = ({ properties, isLoading, error, favorites, onToggleFavorite }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <Spinner />
        <p className="mt-4 text-slate-600 font-medium">Our AI is scanning the web for you...</p>
        <p className="text-slate-500 text-sm">This may take a moment.</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-red-600 bg-red-50 p-6 rounded-lg">{error}</div>;
  }

  if (properties.length === 0 && !isLoading) {
    return (
       <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-4">
          <EmptyStateIcon />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">No results yet</h3>
        <p className="text-slate-500 mt-1">Use the form above to start your search.</p>
      </div>
    );
  }

  return (
    <div>
       <h2 className="text-2xl font-bold mb-6 text-slate-800">Search Results</h2>
       <div className="space-y-6">
        {properties.map((property, index) => {
          const isFavorited = favorites.some(fav => fav.url === property.url);
          return (
            <PropertyCard 
              key={property.url + index} 
              property={property}
              isFavorited={isFavorited}
              onToggleFavorite={onToggleFavorite} 
            />
          )
        })}
      </div>
    </div>
  );
};