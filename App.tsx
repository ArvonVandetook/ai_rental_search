import React, { useState, useCallback, useEffect } from 'react';
import type { SearchCriteria, RentalProperty, SavedSearch } from './types';
import { findRentals } from './services/geminiService';
import { SearchForm } from './components/SearchForm';
import { ResultsList } from './components/ResultsList';
import { SavedSearchesList } from './components/SavedSearchesList';
import { FavoritesList } from './components/FavoritesList';
import { LogoIcon } from './components/icons';

const App: React.FC = () => {
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    location: 'San Francisco, CA',
    minPrice: '1000',
    maxPrice: '3500',
    bedrooms: '2',
    bathrooms: '1',
    housingType: 'apartment',
  });
  const [results, setResults] = useState<RentalProperty[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [favorites, setFavorites] = useState<RentalProperty[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    try {
      const storedSearches = localStorage.getItem('rental-finder-searches');
      if (storedSearches) {
        setSavedSearches(JSON.parse(storedSearches));
      }
      const storedFavorites = localStorage.getItem('rental-finder-favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
    }
  }, []);

  const handleSearch = useCallback(async (criteria: SearchCriteria) => {
    setSearchCriteria(criteria);
    setIsLoading(true);
    setError(null);
    setResults([]);
    try {
      const properties = await findRentals(criteria);
      setResults(properties);
    } catch (err) {
      console.error(err);
       if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while fetching rental properties.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSaveSearch = () => {
    const newSearch: SavedSearch = { ...searchCriteria, id: Date.now() };
    const updatedSearches = [...savedSearches, newSearch];
    setSavedSearches(updatedSearches);
    localStorage.setItem('rental-finder-searches', JSON.stringify(updatedSearches));
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 2000);
  };

  const handleDeleteSearch = (id: number) => {
    const updatedSearches = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updatedSearches);
    localStorage.setItem('rental-finder-searches', JSON.stringify(updatedSearches));
  };
  
  const handleLoadSearch = (search: SavedSearch) => {
    const { id, ...criteria } = search;
    setSearchCriteria(criteria);
    handleSearch(criteria);
  };

  const handleToggleFavorite = (property: RentalProperty) => {
    setFavorites(prevFavorites => {
      const isFavorited = prevFavorites.some(fav => fav.url === property.url);
      let updatedFavorites;
      if (isFavorited) {
        updatedFavorites = prevFavorites.filter(fav => fav.url !== property.url);
      } else {
        updatedFavorites = [...prevFavorites, property];
      }
      localStorage.setItem('rental-finder-favorites', JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <LogoIcon />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Rental Finder</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">Find your next home</h2>
            <p className="text-slate-500 mb-6">Enter your criteria below and our AI will search across dozens of platforms to find the perfect rental for you.</p>
            <SearchForm
              initialCriteria={searchCriteria}
              onSearch={handleSearch}
              onSave={handleSaveSearch}
              isLoading={isLoading}
              isSaving={isSaving}
            />
          </div>
          
          {(savedSearches.length > 0 || favorites.length > 0) && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <SavedSearchesList 
                    searches={savedSearches}
                    onLoad={handleLoadSearch}
                    onDelete={handleDeleteSearch}
                />
                <FavoritesList 
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                />
             </div>
          )}
          
          <ResultsList 
            properties={results} 
            isLoading={isLoading} 
            error={error} 
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      </main>
      
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>Powered by Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;
