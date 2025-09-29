import React from 'react';
import type { RentalProperty } from '../types';
import { BedIcon, BathIcon, LocationIcon, ExternalLinkIcon, HeartIcon, HeartSolidIcon } from './icons';

interface PropertyCardProps {
  property: RentalProperty;
  isFavorited: boolean;
  onToggleFavorite: (property: RentalProperty) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, isFavorited, onToggleFavorite }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-[1.02] transition-transform duration-300 ease-in-out relative">
      <button
        onClick={() => onToggleFavorite(property)}
        title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        className="absolute top-4 right-4 p-2 bg-white/70 backdrop-blur-sm rounded-full text-slate-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
        aria-label="Toggle Favorite"
      >
        {isFavorited ? <HeartSolidIcon /> : <HeartIcon />}
      </button>
      
      <div className="p-6">
        <div className="flex justify-between items-start">
            <div className="pr-16">
                <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">{property.source}</p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{property.title}</h3>
            </div>
            <div className="text-2xl font-extrabold text-slate-800 text-right shrink-0 ml-4">
                {property.price}
                <span className="text-sm font-medium text-slate-500">/mo</span>
            </div>
        </div>

        <div className="flex items-center text-slate-500 mt-3 gap-2">
            <LocationIcon />
            <span>{property.location}</span>
        </div>

        <div className="mt-4 flex items-center space-x-6 border-t border-slate-200 pt-4">
          <div className="flex items-center text-slate-700">
            <BedIcon />
            <span className="ml-2 font-medium">{property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}</span>
          </div>
          <div className="flex items-center text-slate-700">
            <BathIcon />
            <span className="ml-2 font-medium">{property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}</span>
          </div>
        </div>
        
        <div className="mt-6">
            <a
            href={property.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
            View Listing
            <ExternalLinkIcon />
            </a>
        </div>
      </div>
    </div>
  );
};