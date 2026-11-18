import { get, set, del } from 'idb-keyval';
import { UserLocation, roundCoordinate } from '../validation/location';
import { DEFAULT_LOCATION } from './presets';

const CURRENT_LOCATION_KEY = 'aerosense_current_location';
const SAVED_LOCATIONS_KEY = 'aerosense_saved_locations';
const FIRST_VISIT_KEY = 'aerosense_has_visited';

export const MAX_SAVED_LOCATIONS = 5;

// In-memory fallback if IndexedDB is unavailable
let memoryStore: Record<string, unknown> = {};

async function safeGet<T>(key: string): Promise<T | null> {
  try {
    if (typeof window === 'undefined') return null;
    const val = await get<T>(key);
    if (val !== undefined) return val;
    const local = localStorage.getItem(key);
    return local ? (JSON.parse(local) as T) : null;
  } catch {
    return (memoryStore[key] as T) ?? null;
  }
}

async function safeSet<T>(key: string, value: T): Promise<void> {
  try {
    if (typeof window === 'undefined') return;
    await set(key, value);
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    memoryStore[key] = value;
  }
}

export async function getCurrentLocation(): Promise<UserLocation> {
  const stored = await safeGet<UserLocation>(CURRENT_LOCATION_KEY);
  if (stored) {
    return {
      ...stored,
      lat: roundCoordinate(stored.lat),
      lon: roundCoordinate(stored.lon),
    };
  }
  return {
    id: DEFAULT_LOCATION.id,
    name: DEFAULT_LOCATION.name,
    state: DEFAULT_LOCATION.state,
    country: DEFAULT_LOCATION.country,
    lat: roundCoordinate(DEFAULT_LOCATION.lat),
    lon: roundCoordinate(DEFAULT_LOCATION.lon),
    isCustom: false,
    savedAt: Date.now(),
  };
}

export async function setCurrentLocation(location: UserLocation): Promise<void> {
  const rounded: UserLocation = {
    ...location,
    lat: roundCoordinate(location.lat),
    lon: roundCoordinate(location.lon),
  };
  await safeSet(CURRENT_LOCATION_KEY, rounded);
}

export async function getSavedLocations(): Promise<UserLocation[]> {
  const stored = await safeGet<UserLocation[]>(SAVED_LOCATIONS_KEY);
  return stored ?? [];
}

export async function addSavedLocation(
  location: UserLocation
): Promise<{ success: boolean; error?: string; locations: UserLocation[] }> {
  const existing = await getSavedLocations();

  // Check duplicate by proximity or ID
  const isDuplicate = existing.some(
    (loc) =>
      loc.id === location.id ||
      (Math.abs(loc.lat - location.lat) < 0.05 && Math.abs(loc.lon - location.lon) < 0.05)
  );
  if (isDuplicate) {
    return { success: true, locations: existing };
  }

  if (existing.length >= MAX_SAVED_LOCATIONS) {
    return {
      success: false,
      error: 'Max 5 saved locations limit reached',
      locations: existing,
    };
  }

  const updated = [
    ...existing,
    {
      ...location,
      lat: roundCoordinate(location.lat),
      lon: roundCoordinate(location.lon),
    },
  ];
  await safeSet(SAVED_LOCATIONS_KEY, updated);
  return { success: true, locations: updated };
}

export async function removeSavedLocation(id: string): Promise<UserLocation[]> {
  const existing = await getSavedLocations();
  const updated = existing.filter((loc) => loc.id !== id);
  await safeSet(SAVED_LOCATIONS_KEY, updated);
  return updated;
}

export async function checkIsFirstVisit(): Promise<boolean> {
  const visited = await safeGet<boolean>(FIRST_VISIT_KEY);
  return !visited;
}

export async function markFirstVisitComplete(): Promise<void> {
  await safeSet(FIRST_VISIT_KEY, true);
}

export async function clearAllLocalData(): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      await del(CURRENT_LOCATION_KEY);
      await del(SAVED_LOCATIONS_KEY);
      await del(FIRST_VISIT_KEY);
      localStorage.clear();
    }
  } catch {
    memoryStore = {};
  }
}
