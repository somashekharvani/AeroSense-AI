import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCurrentLocation,
  setCurrentLocation,
  getSavedLocations,
  addSavedLocation,
  removeSavedLocation,
  clearAllLocalData,
  MAX_SAVED_LOCATIONS,
} from '@/lib/location/storage';
import { DEFAULT_LOCATION, PRESET_CITIES } from '@/lib/location/presets';
import { UserLocation } from '@/lib/validation/location';

describe('Location Store & Storage Management', () => {
  beforeEach(async () => {
    await clearAllLocalData();
  });

  it('returns default location (Delhi) when storage is empty', async () => {
    const loc = await getCurrentLocation();
    expect(loc.name).toBe(DEFAULT_LOCATION.name);
    expect(loc.lat).toBe(28.61);
    expect(loc.lon).toBe(77.21);
  });

  it('persists and updates active location with rounded coordinates', async () => {
    const bengaluru: UserLocation = {
      id: 'bengaluru',
      name: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      lat: 12.9716,
      lon: 77.5946,
      isCustom: false,
      savedAt: Date.now(),
    };

    await setCurrentLocation(bengaluru);
    const retrieved = await getCurrentLocation();
    expect(retrieved.name).toBe('Bengaluru');
    expect(retrieved.lat).toBe(12.97);
    expect(retrieved.lon).toBe(77.59);
  });

  it('saves up to 5 locations and prevents exceeding the limit', async () => {
    const citiesToAdd = PRESET_CITIES.slice(0, 5);

    for (const city of citiesToAdd) {
      const res = await addSavedLocation({
        id: city.id,
        name: city.name,
        state: city.state,
        country: city.country,
        lat: city.lat,
        lon: city.lon,
        isCustom: false,
        savedAt: Date.now(),
      });
      expect(res.success).toBe(true);
    }

    const saved = await getSavedLocations();
    expect(saved.length).toBe(MAX_SAVED_LOCATIONS);

    // Attempt to add a 6th city
    const sixthCity = PRESET_CITIES[5];
    const resOver = await addSavedLocation({
      id: sixthCity.id,
      name: sixthCity.name,
      state: sixthCity.state,
      country: sixthCity.country,
      lat: sixthCity.lat,
      lon: sixthCity.lon,
      isCustom: false,
      savedAt: Date.now(),
    });

    expect(resOver.success).toBe(false);
    expect(resOver.error).toContain('Max 5');
    const finalSaved = await getSavedLocations();
    expect(finalSaved.length).toBe(MAX_SAVED_LOCATIONS);
  });

  it('removes a saved location by ID', async () => {
    const city = PRESET_CITIES[0];
    await addSavedLocation({
      id: city.id,
      name: city.name,
      state: city.state,
      country: city.country,
      lat: city.lat,
      lon: city.lon,
      isCustom: false,
      savedAt: Date.now(),
    });

    let saved = await getSavedLocations();
    expect(saved.length).toBe(1);

    const afterRemove = await removeSavedLocation(city.id);
    expect(afterRemove.length).toBe(0);
  });
});
