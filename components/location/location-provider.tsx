'use client';

import * as React from 'react';
import { UserLocation, roundCoordinate, LocationQuerySchema } from '@/lib/validation/location';
import {
  getCurrentLocation,
  setCurrentLocation,
  getSavedLocations,
  addSavedLocation,
  removeSavedLocation,
  checkIsFirstVisit,
  markFirstVisitComplete,
  MAX_SAVED_LOCATIONS,
} from '@/lib/location/storage';
import { DEFAULT_LOCATION } from '@/lib/location/presets';

interface LocationContextType {
  location: UserLocation;
  savedLocations: UserLocation[];
  isLoading: boolean;
  isFirstVisit: boolean;
  setLocation: (loc: UserLocation) => Promise<void>;
  saveLocation: (loc: UserLocation) => Promise<{ success: boolean; error?: string }>;
  deleteSavedLocation: (id: string) => Promise<void>;
  completeFirstVisit: () => Promise<void>;
  openLocationDialog: () => void;
  closeLocationDialog: () => void;
  isLocationDialogOpen: boolean;
}

const LocationContext = React.createContext<LocationContextType | null>(null);

export function useLocation() {
  const context = React.useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = React.useState<UserLocation>({
    id: DEFAULT_LOCATION.id,
    name: DEFAULT_LOCATION.name,
    state: DEFAULT_LOCATION.state,
    country: DEFAULT_LOCATION.country,
    lat: roundCoordinate(DEFAULT_LOCATION.lat),
    lon: roundCoordinate(DEFAULT_LOCATION.lon),
    isCustom: false,
    savedAt: Date.now(),
  });
  const [savedLocations, setSavedLocations] = React.useState<UserLocation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFirstVisit, setIsFirstVisit] = React.useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = React.useState(false);

  // Initialize from storage or URL query parameters
  React.useEffect(() => {
    async function init() {
      try {
        const firstVisit = await checkIsFirstVisit();
        setIsFirstVisit(firstVisit);

        const saved = await getSavedLocations();
        setSavedLocations(saved);

        // Check if URL has valid ?lat= and ?lon=
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const rawLat = params.get('lat');
          const rawLon = params.get('lon');

          if (rawLat && rawLon) {
            const parsed = LocationQuerySchema.safeParse({
              lat: rawLat,
              lon: rawLon,
              lang: params.get('lang') || 'en',
            });
            if (parsed.success) {
              const urlLocation: UserLocation = {
                id: `custom-${parsed.data.lat}-${parsed.data.lon}`,
                name: `${parsed.data.lat.toFixed(2)}°N, ${parsed.data.lon.toFixed(2)}°E`,
                state: 'Custom',
                lat: parsed.data.lat,
                lon: parsed.data.lon,
                country: 'India',
                isCustom: true,
                savedAt: Date.now(),
              };
              setLocationState(urlLocation);
              await setCurrentLocation(urlLocation);
              setIsLoading(false);
              return;
            }
          }
        }

        // Otherwise load from device storage
        const current = await getCurrentLocation();
        setLocationState(current);
        syncUrlParams(current.lat, current.lon);
      } catch (err) {
        console.error('Failed to initialize location:', err);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  const syncUrlParams = (lat: number, lon: number) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('lat', lat.toFixed(2));
      url.searchParams.set('lon', lon.toFixed(2));
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleSetLocation = async (newLocation: UserLocation) => {
    const rounded: UserLocation = {
      ...newLocation,
      lat: roundCoordinate(newLocation.lat),
      lon: roundCoordinate(newLocation.lon),
    };
    setLocationState(rounded);
    await setCurrentLocation(rounded);
    syncUrlParams(rounded.lat, rounded.lon);
    setIsLocationDialogOpen(false);
  };

  const handleSaveLocation = async (newLocation: UserLocation) => {
    const res = await addSavedLocation(newLocation);
    if (res.success) {
      setSavedLocations(res.locations);
    }
    return { success: res.success, error: res.error };
  };

  const handleDeleteSavedLocation = async (id: string) => {
    const updated = await removeSavedLocation(id);
    setSavedLocations(updated);
  };

  const completeFirstVisit = async () => {
    await markFirstVisitComplete();
    setIsFirstVisit(false);
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        savedLocations,
        isLoading,
        isFirstVisit,
        setLocation: handleSetLocation,
        saveLocation: handleSaveLocation,
        deleteSavedLocation: handleDeleteSavedLocation,
        completeFirstVisit,
        openLocationDialog: () => setIsLocationDialogOpen(true),
        closeLocationDialog: () => setIsLocationDialogOpen(false),
        isLocationDialogOpen,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}
