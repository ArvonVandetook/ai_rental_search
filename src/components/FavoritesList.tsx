import React from 'react';
import type { RentalProperty } from '../types';
import { PropertyCard } from './PropertyCard';
import { HeartIcon } from './icons';

interface FavoritesListProps {
  favorites: RentalProperty[];
  onToggleFavorite: (property: RentalProperty) => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({ favorites, onToggleFavorite }) => {
  if (favorites.length === 0) {
    return null; // Don't render the section if there are no favorites
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Your Favorites</h2>
      <div className="space-y-6">
        {favorites.map((property) => (
          <PropertyCard
            key={property.url}
            property={property}
            isFavorited={true} // Always true for this list
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};