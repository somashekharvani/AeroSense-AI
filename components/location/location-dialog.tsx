'use client';

import * as React from 'react';
import {
  Search,
  Crosshair,
  MapPin,
  Building2,
  Bookmark,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocation } from './location-provider';
import { useLanguage } from '@/lib/i18n/context';
import { PRESET_CITIES } from '@/lib/location/presets';
import { UserLocation, roundCoordinate } from '@/lib/validation/location';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LocationDialog() {
  const t = useTranslations('location');
  const tCommon = useTranslations('common');
  const { locale } = useLanguage();
  const {
    location,
    setLocation,
    savedLocations,
    saveLocation,
    deleteSavedLocation,
    isLocationDialogOpen,
    closeLocationDialog,
  } = useLocation();

  const [activeTab, setActiveTab] = React.useState('search');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);

  const [isGpsLoading, setIsGpsLoading] = React.useState(false);
  const [gpsError, setGpsError] = React.useState<string | null>(null);

  // Geocoding search using Open-Meteo geocoding API
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          searchQuery.trim()
        )}&count=6&language=${locale}&format=json`
      );
      if (!res.ok) throw new Error('Geocoding request failed');
      const data = await res.json();
      if (!data.results || data.results.length === 0) {
        setSearchError(t('noResults'));
      } else {
        setSearchResults(data.results);
      }
    } catch {
      setSearchError('Network error while searching location. Please check connection.');
    } finally {
      setIsSearching(false);
    }
  };

  // Browser Geolocation API
  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLoading(false);
        const lat = roundCoordinate(pos.coords.latitude);
        const lon = roundCoordinate(pos.coords.longitude);
        const gpsLocation: UserLocation = {
          id: `gps-${lat}-${lon}`,
          name: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
          state: 'GPS Detected',
          country: 'India',
          lat,
          lon,
          isCustom: true,
          savedAt: Date.now(),
        };
        setLocation(gpsLocation);
      },
      (err) => {
        setIsGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError(t('gpsPermissionDenied'));
        } else {
          setGpsError('Unable to retrieve your location. Please select a city.');
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const isCurrentLocation = (lat: number, lon: number) => {
    return Math.abs(location.lat - lat) < 0.02 && Math.abs(location.lon - lon) < 0.02;
  };

  return (
    <Dialog open={isLocationDialogOpen} onOpenChange={closeLocationDialog}>
      <DialogContent onClose={closeLocationDialog} className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-400" />
            <DialogTitle>{t('title')}</DialogTitle>
          </div>
          <p className="text-xs text-slate-400">{t('coordinatesRoundedNotice')}</p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="search" className="gap-1.5 text-xs">
              <Search className="h-3.5 w-3.5" />
              <span>{t('searchTab')}</span>
            </TabsTrigger>
            <TabsTrigger value="presets" className="gap-1.5 text-xs">
              <Building2 className="h-3.5 w-3.5" />
              <span>{t('presetsTab')}</span>
            </TabsTrigger>
            <TabsTrigger value="gps" className="gap-1.5 text-xs">
              <Crosshair className="h-3.5 w-3.5" />
              <span>GPS</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-1.5 text-xs">
              <Bookmark className="h-3.5 w-3.5" />
              <span>{t('savedPlaces')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-3 pt-2">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700/80 ps-9 pe-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <Button type="submit" variant="emerald" disabled={isSearching} size="md">
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </Button>
            </form>

            {searchError && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-950/40 border border-amber-800/60 p-3 text-xs text-amber-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pt-1">
                {searchResults.map((item) => {
                  const lat = roundCoordinate(item.latitude);
                  const lon = roundCoordinate(item.longitude);
                  return (
                    <button
                      key={item.id}
                      onClick={() =>
                        setLocation({
                          id: `geo-${item.id}`,
                          name: item.name,
                          state: item.admin1 || '',
                          country: item.country || 'India',
                          lat,
                          lon,
                          isCustom: true,
                          savedAt: Date.now(),
                        })
                      }
                      className="flex w-full items-center justify-between rounded-lg bg-slate-900/60 border border-slate-800/80 p-2.5 text-start hover:bg-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">{item.name}</div>
                        <div className="text-xs text-slate-400">
                          {[item.admin1, item.country].filter(Boolean).join(', ')} •{' '}
                          <span className="font-mono text-[11px] text-slate-500">
                            {lat.toFixed(2)}°N, {lon.toFixed(2)}°E
                          </span>
                        </div>
                      </div>
                      <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Presets Tab */}
          <TabsContent value="presets" className="pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {PRESET_CITIES.map((city) => {
                const active = isCurrentLocation(city.lat, city.lon);
                return (
                  <button
                    key={city.id}
                    onClick={() =>
                      setLocation({
                        id: city.id,
                        name: city.name,
                        state: city.state,
                        country: city.country,
                        lat: roundCoordinate(city.lat),
                        lon: roundCoordinate(city.lon),
                        isCustom: false,
                        savedAt: Date.now(),
                      })
                    }
                    className={cn(
                      'flex flex-col items-start rounded-lg border p-2.5 text-start transition-all cursor-pointer',
                      active
                        ? 'bg-emerald-950/60 border-emerald-600/80 text-white'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm font-semibold">{city.name}</span>
                      {active && <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                    </div>
                    <span className="text-[11px] text-slate-400">{city.state}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-1">
                      {city.lat.toFixed(2)}°, {city.lon.toFixed(2)}°
                    </span>
                  </button>
                );
              })}
            </div>
          </TabsContent>

          {/* GPS Tab */}
          <TabsContent value="gps" className="space-y-4 pt-2">
            <div className="rounded-xl border border-white/5 bg-slate-900/60 p-4 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400">
                <Crosshair className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{t('useGps')}</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {t('coordinatesRoundedNotice')}
                </p>
              </div>
              <Button
                onClick={handleUseGps}
                variant="emerald"
                disabled={isGpsLoading}
                className="w-full max-w-xs mx-auto"
              >
                {isGpsLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('gpsPrompt')}</span>
                  </>
                ) : (
                  <span>{t('useGps')}</span>
                )}
              </Button>
            </div>

            {gpsError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-950/40 border border-red-800/60 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{gpsError}</span>
              </div>
            )}
          </TabsContent>

          {/* Saved Places Tab */}
          <TabsContent value="saved" className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {savedLocations.length} / 5 places saved
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveLocation(location)}
                className="text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t('saveThisPlace')}</span>
              </Button>
            </div>

            {savedLocations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                No saved places yet. Click &quot;Save Place&quot; to bookmark up to 5 locations for quick switching.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {savedLocations.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-slate-900/60 border border-slate-800/80 p-2.5"
                  >
                    <button
                      onClick={() => setLocation(item)}
                      className="flex-1 text-start cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <div className="text-sm font-semibold text-white">{item.name}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        {item.lat.toFixed(2)}°N, {item.lon.toFixed(2)}°E
                      </div>
                    </button>
                    <button
                      onClick={() => deleteSavedLocation(item.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      aria-label="Delete saved place"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
