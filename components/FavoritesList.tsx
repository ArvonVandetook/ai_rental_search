import React from 'react';
import type { RentalProperty } from '../types';
import { PropertyCard } from './PropertyCard';

interface FavoritesListProps {
  favorites: RentalProperty[];
  onToggleFavorite: (property: RentalProperty) => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({ favorites, onToggleFavorite }) => {
  if (favorites.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-slate-700">Your Favorites</h2>
      <div className="space-y-6">
        {favorites.map((property) => (
          <PropertyCard
            key={property.url}
            property={property}
            isFavorited={true}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};
