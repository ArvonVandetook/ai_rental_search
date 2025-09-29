
import React from 'react';
import type { SearchCriteria } from '../types';

interface SearchFormProps {
  criteria: SearchCriteria;
  setCriteria: React.Dispatch<React.SetStateAction<SearchCriteria>>;
  onSearch: () => void;
  onSave: () => void;
  isLoading: boolean;
  isSaving: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ criteria, setCriteria, onSearch, onSave, isLoading, isSaving }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCriteria(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const saveButtonClasses = isSaving
    ? 'bg-green-100 text-green-700 border-green-300 cursor-default'
    : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-300';

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <label htmlFor="location" className="block text-sm font-medium text-slate-600 mb-1">Location</label>
        <input
          type="text"
          name="location"
          id="location"
          value={criteria.location}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g., Brooklyn, NY"
        />
      </div>
      
      <div>
        <label htmlFor="minPrice" className="block text-sm font-medium text-slate-600 mb-1">Min Price ($)</label>
        <input
          type="number"
          name="minPrice"
          id="minPrice"
          value={criteria.minPrice}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="1000"
        />
      </div>

      <div>
        <label htmlFor="maxPrice" className="block text-sm font-medium text-slate-600 mb-1">Max Price ($)</label>
        <input
          type="number"
          name="maxPrice"
          id="maxPrice"
          value={criteria.maxPrice}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="3500"
        />
      </div>
      
      <div>
        <label htmlFor="bedrooms" className="block text-sm font-medium text-slate-600 mb-1">Bedrooms</label>
        <select
          name="bedrooms"
          id="bedrooms"
          value={criteria.bedrooms}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="any">Any</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4+</option>
        </select>
      </div>

      <div>
        <label htmlFor="bathrooms" className="block text-sm font-medium text-slate-600 mb-1">Bathrooms</label>
        <select
          name="bathrooms"
          id="bathrooms"
          value={criteria.bathrooms}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="any">Any</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3+</option>
        </select>
      </div>

      <div>
        <label htmlFor="housingType" className="block text-sm font-medium text-slate-600 mb-1">Housing Type</label>
        <select
          name="housingType"
          id="housingType"
          value={criteria.housingType}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="any">Any</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="condo">Condo</option>
          <option value="townhouse">Townhouse</option>
        </select>
      </div>
      
      <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex-grow justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Searching...' : 'Find Properties'}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isLoading || isSaving}
          className={`w-full sm:w-auto justify-center py-3 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-200 disabled:cursor-not-allowed transition-colors ${saveButtonClasses}`}
        >
          {isSaving ? 'Saved!' : 'Save Search'}
        </button>
      </div>
    </form>
  );
};
