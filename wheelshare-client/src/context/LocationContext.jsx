import { createContext, useContext, useState, useCallback } from 'react';
import { CITIES_WITH_STATE, getCityState } from '../data/cities';

const LocationContext = createContext(null);

const STORAGE_KEY = 'userLocation';

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch { return null; }
}

export function LocationProvider({ children }) {
  const [location, setLocationState] = useState(loadSaved);

  const setLocation = useCallback((loc) => {
    setLocationState(loc);
    if (loc) localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const clearLocation = useCallback(() => {
    setLocationState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation, clearLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation_ = () => useContext(LocationContext);
