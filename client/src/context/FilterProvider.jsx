// src/context/FilterProvider.jsx
import React, { useState, useEffect } from "react";
import { FilterContext } from "./FilterContext";
import { DEFAULT_FILTERS, DEFAULT_SEARCH_RESULTS } from "../constants/filterDefault";

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchResults, setSearchResults] = useState(DEFAULT_SEARCH_RESULTS);
  const [availableCities, setAvailableCities] = useState([]);

  useEffect(() => {
    const savedFilters = sessionStorage.getItem("filters");
    const savedResults = sessionStorage.getItem("searchResults");
    if (savedFilters) setFilters(JSON.parse(savedFilters));
    if (savedResults) setSearchResults(JSON.parse(savedResults));
  }, []);

  useEffect(() => {
    sessionStorage.setItem("filters", JSON.stringify(filters));
    sessionStorage.setItem("searchResults", JSON.stringify(searchResults));
  }, [filters, searchResults]);

  return (
    <FilterContext.Provider
      value={{ filters, setFilters, searchResults, setSearchResults, availableCities, setAvailableCities }}
    >
      {children}
    </FilterContext.Provider>
  );
};
