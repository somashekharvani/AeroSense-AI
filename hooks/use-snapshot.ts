'use client';

import * as React from 'react';
import { useLocation } from '@/components/location/location-provider';
import { useLanguage } from '@/lib/i18n/context';

import { IndianAqiResult } from '@/engines/indian-aqi';
import { InversionRiskResult } from '@/engines/inversion';
import { IncidentViewResult } from '@/engines/incident';

export interface SnapshotData {
  coordinates: { lat: number; lon: number };
  fusedAir: {
    pollutants: {
      pm25: number | null;
      pm10: number | null;
      no2: number | null;
      so2: number | null;
      co: number | null;
      o3: number | null;
    };
    dominantSource: 'model' | 'station';
    disagreement: boolean;
    disagreementReason?: string;
    confidence: {
      level: 'high' | 'medium' | 'low';
      reasons: string[];
    };
  };
  indianAqi: IndianAqiResult;
  inversionRisk: InversionRiskResult;
  atmosphere: {
    temperature2m: number;
    humidityPct: number;
    windSpeedKmh: number;
    windDirectionDeg: number;
    boundaryLayerHeightM: number;
    cloudCoverPct: number;
    surfaceElevationM: number;
  };
  incidentView: IncidentViewResult;
  sourceStatus: {
    openMeteo: {
      status: 'online' | 'offline';
      label: string;
      lastUpdated: string;
    };
    waqi: {
      status: 'online' | 'offline' | 'unconfigured';
      label: string;
      stationName?: string;
      distanceKm?: number;
      lastUpdated: string;
    };
    nasaFirms: {
      status: 'online' | 'offline' | 'unconfigured';
      label: string;
      firePointsCount: number;
      lastUpdated: string;
    };
    drone: {
      status: 'not_connected';
      label: string;
      badge: 'Not Connected';
      note: string;
    };
  };
  isStale: boolean;
  timestamp: string;
}

export function useSnapshot() {
  const { location } = useLocation();
  const { locale } = useLanguage();

  const [data, setData] = React.useState<SnapshotData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchSnapshot = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/snapshot?lat=${location.lat.toFixed(2)}&lon=${location.lon.toFixed(2)}&lang=${locale}`
      );
      if (!res.ok) {
        throw new Error(`Snapshot request failed with HTTP ${res.status}`);
      }
      const json: SnapshotData = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Unable to fetch air snapshot');
    } finally {
      setIsLoading(false);
    }
  }, [location.lat, location.lon, locale]);

  React.useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  return {
    data,
    isLoading,
    error,
    isStale: data?.isStale ?? false,
    refetch: fetchSnapshot,
  };
}
