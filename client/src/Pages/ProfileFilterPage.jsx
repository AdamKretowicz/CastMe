// src/pages/ProfileFilterPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPhotoUrl, filterUsers } from "../utils/api";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import { 
  Search, Filter, MapPin, Users, Camera, X, RefreshCw, ChevronDown, ChevronUp 
} from "lucide-react";
import { useFilter } from '../hooks/useFilter';

const FILTER_OPTIONS = {
  hairColors: ['Blonde', 'Brown', 'Black', 'Red', 'Gray', 'White', 'Other'],
  clothingSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
};

export default function ProfileFilterPage() {
  const navigate = useNavigate();
  const { accessToken, currentUser } = useAuth();
  const { filters, setFilters, searchResults, setSearchResults } = useFilter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);
  const [cityInput, setCityInput] = useState(filters.cities.join(", "));

  const handleSearch = useCallback(async (resetPage = false) => {
  if (!accessToken) return;
  setLoading(true);
  setError(null);

  try {
    const searchFilters = { ...filters, pageNumber: resetPage ? 1 : filters.pageNumber };
    if (resetPage && filters.pageNumber !== 1) {
      setFilters(prev => ({ ...prev, pageNumber: 1 }));
    }

    const results = await filterUsers(searchFilters, accessToken);
    setSearchResults(results);
  } catch (err) {
    setError(err.message || "Błąd wyszukiwania profili");
  } finally {
    setLoading(false);
  }
}, [filters, accessToken, setFilters, setSearchResults]);


  // Redirect if not logged in
    useEffect(() => {
      if (!currentUser || !accessToken) {
        navigate("/login");
        return;
      }

      // Only fetch if searchResults are empty (first visit)
      if (!initialLoad && (!searchResults || searchResults.users.length === 0)) {
        handleSearch();
        setInitialLoad(true);
      }
    }, [accessToken, currentUser, handleSearch, navigate, searchResults, initialLoad]);

    // sync cityInput when filters.cities change externally
    useEffect(() => {
      setCityInput(filters.cities.join(", "));
    }, [filters.cities]);

  // Trigger search on page change
  useEffect(() => {
    if (filters.pageNumber !== 1) handleSearch();
  }, [filters.pageNumber, handleSearch]);

  // Filter helpers
  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const handleArrayFilterChange = (key, value, checked) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked ? [...prev[key], value] : prev[key].filter(item => item !== value)
    }));
  };
  const clearFilters = () => {
    setFilters({
      minAge: '', maxAge: '',
      minHeight: '', maxHeight: '',
      minWeight: '', maxWeight: '',
      hairColors: [], clothingSizes: [], cities: [],
      pageNumber: 1, pageSize: 12
    });
    setCityInput(""); 
  };

  const handlePageChange = newPage => setFilters(prev => ({ ...prev, pageNumber: newPage }));
  const handleUserClick = userId => navigate(`/profile/${userId}`);

  const calculateAge = dateOfBirth => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getProfileDistinguishers = user => {
    const distinguishers = [];
    if (user.city) distinguishers.push(user.city);
    if (user.hairColor) distinguishers.push(user.hairColor);
    if (user.clothingSize) distinguishers.push(`Size: ${user.clothingSize}`);
    const age = calculateAge(user.dateOfBirth);
    if (age) distinguishers.push(`${age} lat`);
    if (user.height) distinguishers.push(`${user.height}cm`);
    return distinguishers.slice(0, 3);
  };

  const hasActiveFilters = useMemo(() => {
    return filters.minAge || filters.maxAge || filters.minHeight || filters.maxHeight ||
          filters.minWeight || filters.maxWeight || filters.hairColors.length > 0 ||
          filters.clothingSizes.length > 0 || filters.cities.length > 0;
  }, [filters]);

  return (
    <div className="bg-white text-[#2b2628] min-h-screen p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold flex items-center justify-center">
            <Search size={32} className="mr-3 text-[#EA1A62]" />
            Wyszukiwanie profili
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Znaleziono: {searchResults.totalCount} {searchResults.totalCount === 1 ? 'profil' : 'profili'}
          </p>
        </div>

        {/* Search Controls */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center"
                  variant={hasActiveFilters ? "primary" : "secondary"}
                >
                  <Filter size={16} className="mr-2" />
                  Filtry
                  {hasActiveFilters && (
                    <span className="ml-2 bg-white text-[#EA1A62] px-2 py-1 rounded-full text-xs">
                      Aktywne
                    </span>
                  )}
                  {showFilters ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
                </Button>

                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline" size="sm">
                    <X size={16} className="mr-2" />
                    Wyczyść filtry
                  </Button>
                )}
              </div>

              <Button onClick={() => handleSearch(true)} disabled={loading}>
                <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Szukaj
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Age Range */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Wiek</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Od"
                        value={filters.minAge}
                        onChange={(e) => handleFilterChange('minAge', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EA1A62]"
                      />
                      <input
                        type="number"
                        placeholder="Do"
                        value={filters.maxAge}
                        onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EA1A62]"
                      />
                    </div>
                  </div>

                  {/* Height Range */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Wzrost (cm)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Od"
                        value={filters.minHeight}
                        onChange={(e) => handleFilterChange('minHeight', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EA1A62]"
                      />
                      <input
                        type="number"
                        placeholder="Do"
                        value={filters.maxHeight}
                        onChange={(e) => handleFilterChange('maxHeight', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EA1A62]"
                      />
                    </div>
                  </div>

                  {/* Weight Range */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Waga (kg)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Od"
                        value={filters.minWeight}
                        onChange={(e) => handleFilterChange('minWeight', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EA1A62]"
                      />
                      <input
                        type="number"
                        placeholder="Do"
                        value={filters.maxWeight}
                        onChange={(e) => handleFilterChange('maxWeight', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EA1A62]"
                      />
                    </div>
                  </div>

                  {/* Hair Colors */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Kolor włosów</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {FILTER_OPTIONS.hairColors.map(color => (
                        <label key={color} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.hairColors.includes(color)}
                            onChange={(e) => handleArrayFilterChange('hairColors', color, e.target.checked)}
                            className="mr-2 text-[#EA1A62] focus:ring-[#EA1A62]"
                          />
                          {color}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Clothing Sizes */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Rozmiar ubrań</label>
                    <div className="space-y-2">
                        {FILTER_OPTIONS.clothingSizes.map(size => (
                          <label key={size} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.clothingSizes.includes(size)}
                            onChange={(e) => handleArrayFilterChange('clothingSizes', size, e.target.checked)}
                            className="mr-2 text-[#EA1A62] focus:ring-[#EA1A62]"
                          />
                          {size}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Cities */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Miasto</label>
                    <div>
                      <input
                        type="text"
                        placeholder="np. Warsaw, Krakow"
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        onBlur={() => {
                          const citiesArray = cityInput
                            .split(",")
                            .map(city => city.trim())
                            .filter(city => city.length > 0);
                          setFilters(prev => ({ ...prev, cities: citiesArray }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EA1A62]"
                      />

                    </div>

                  </div>
                </div>
              </div>
            )}

          </div>
        </Card>

        {/* Loading, Error, and Results */}
        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA1A62] mx-auto"></div>
            <p className="mt-2">Wyszukiwanie profili...</p>
          </div>
        )}

        {error && (
          <Card className="p-8 text-center">
            <div className="text-red-500 py-10">{error}</div>
          </Card>
        )}

        {!loading && !error && (
          <>
            {searchResults.users.length === 0 ? (
              <Card className="p-8 text-center">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold mb-2 text-gray-600">Brak wyników</h2>
                <p className="text-gray-500">
                  {hasActiveFilters 
                    ? "Nie znaleziono profili spełniających wybrane kryteria. Spróbuj zmienić filtry."
                    : "Nie znaleziono żadnych profili."
                  }
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.users.map(user => {
                    const distinguishers = getProfileDistinguishers(user);
                    const location = user.city && user.country ? 
                      `${user.city}, ${user.country}` : 
                      user.city || user.country || null;

                    return (
                      <Card 
                        key={user.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleUserClick(user.id)}
                      >
                        <div className="relative">
                          <div className="w-full h-48 bg-gray-200 overflow-hidden">
                            {user.mainPhoto ? (
                              <img
                                src={getPhotoUrl(user.mainPhoto.url)}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <Camera size={32} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold text-lg hover:text-[#EA1A62] transition-colors">
                            {user.firstName} {user.lastName}
                          </h3>
                          
                          {location && (
                            <p className="text-gray-600 text-sm flex items-center mt-1">
                              <MapPin size={14} className="mr-1" />
                              {location}
                            </p>
                          )}

                          {distinguishers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {distinguishers.map((feature, index) => (
                                <span 
                                  key={index}
                                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          )}

                          {user.description && (
                            <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                              {user.description}
                            </p>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {searchResults.totalPages > 1 && (
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Strona {searchResults.currentPage} z {searchResults.totalPages}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handlePageChange(searchResults.currentPage - 1)}
                          disabled={searchResults.currentPage <= 1}
                          variant="outline"
                          size="sm"
                        >
                          Poprzednia
                        </Button>
                        
                        {Array.from({ length: Math.min(5, searchResults.totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, searchResults.currentPage - 2) + i;
                          if (pageNum > searchResults.totalPages) return null;
                          
                          return (
                            <Button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              variant={pageNum === searchResults.currentPage ? "primary" : "outline"}
                              size="sm"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        
                        <Button
                          onClick={() => handlePageChange(searchResults.currentPage + 1)}
                          disabled={searchResults.currentPage >= searchResults.totalPages}
                          variant="outline"
                          size="sm"
                        >
                          Następna
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
