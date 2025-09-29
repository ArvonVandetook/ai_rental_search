import React from 'react';
import type { SavedSearch } from '../types';
import { TrashIcon, LoadIcon } from './icons';

interface SavedSearchesListProps {
  searches: SavedSearch[];
  onLoad: (search: SavedSearch) => void;
  onDelete: (id: number) => void;
}

const formatCriteria = (search: SavedSearch): string => {
  const parts = [];
  if (search.bedrooms !== 'any') parts.push(`${search.bedrooms} bed${search.bedrooms !== '1' ? 's' : ''}`);
  if (search.bathrooms !== 'any') parts.push(`${search.bathrooms !== 'any' ? search.bathrooms : '1'} bath${search.bathrooms !== '1' ? 's' : ''}`);
  if (search.minPrice || search.maxPrice) {
    const priceRange = `$${search.minPrice || '0'} - $${search.maxPrice || '∞'}`;
    parts.push(priceRange);
  }
  if (search.housingType !== 'any') parts.push(search.housingType);
  return parts.join(', ');
}

export const SavedSearchesList: React.FC<SavedSearchesListProps> = ({ searches, onLoad, onDelete }) => {
  if (searches.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-slate-700">Saved Searches</h2>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <ul className="space-y-3">
          {searches.map(search => (
            <li 
              key={search.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border border-slate-200 rounded-md bg-slate-50"
            >
              <div className="mb-3 sm:mb-0">
                <p className="font-semibold text-slate-800">{search.location}</p>
                <p className="text-sm text-slate-500">{formatCriteria(search)}</p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button 
                  onClick={() => onLoad(search)}
                  title="Load Search and Find Properties"
                  className="p-2 text-slate-600 hover:bg-slate-200 hover:text-indigo-600 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <LoadIcon />
                </button>
                <button 
                  onClick={() => onDelete(search.id)}
                  title="Delete Search"
                  className="p-2 text-slate-600 hover:bg-slate-200 hover:text-red-600 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
