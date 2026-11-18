/**
 * Incident View & Downwind Plume Sector Engine
 *
 * NON-NEGOTIABLE RULES from AGENTS.md:
 * "Plumes and downwind areas are estimates. Satellite fire points are not confirmed incidents.
 * Incident View (fire points + wind + nearby stations; downwind areas shown only as ESTIMATES)."
 */

import { calculateDistanceKm, WaqiStationData } from '@/services/waqi';
import { NasaFirePoint } from '@/services/nasa-firms';

export const ENGINE_VERSION = 'incident@1.0.0';

export interface IncidentInput {
  targetLat: number;
  targetLon: number;
  radiusKm?: number; // Search radius for nearby thermal detections (default: 100km)
  windDirectionDeg: number; // Meteorological direction wind is coming FROM (0-360)
  windSpeedKmh: number;
  fireDetections: NasaFirePoint[];
  stations: WaqiStationData[];
}

export interface DownwindSector {
  downwindBearingDeg: number; // Direction smoke travels TOWARDS (windDirection + 180) % 360
  spreadAngleDeg: number; // Angular plume spread (+- degrees)
  minBearingDeg: number;
  maxBearingDeg: number;
  plumeTransportSpeedKmh: number;
  estimatedTransitTimeHoursToTarget?: number;
}

export interface IncidentViewResult {
  searchRadiusKm: number;
  nearbyThermalDetections: Array<NasaFirePoint & { distanceKm: number; bearingDeg: number }>;
  downwindSector: DownwindSector;
  stationsInDownwindSector: Array<WaqiStationData & { distanceKm: number; bearingDeg: number }>;
  activeClusterIdentified: boolean;
  smokeTrajectoryNotice: string;
  isEstimate: true;
  engine: {
    name: 'incident';
    version: typeof ENGINE_VERSION;
  };
}

/**
 * Computes bearing in degrees from point 1 (lat1, lon1) to point 2 (lat2, lon2)
 */
export function calculateBearingDeg(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  const bearing = ((theta * 180) / Math.PI + 360) % 360;
  return Math.round(bearing);
}

/**
 * Checks if a bearing falls within an angular sector [center - spread, center + spread]
 */
export function isBearingInSector(
  bearing: number,
  centerBearing: number,
  spreadDeg: number
): boolean {
  // Normalize angular difference to [-180, 180]
  let diff = (bearing - centerBearing) % 360;
  if (diff < -180) diff += 360;
  if (diff > 180) diff -= 360;
  return Math.abs(diff) <= spreadDeg;
}

/**
 * Evaluates satellite thermal detections, wind direction, and downwind station impacts
 */
export function calculateIncidentView(input: IncidentInput): IncidentViewResult {
  const radius = input.radiusKm ?? 100;

  // In meteorology, wind direction theta is where the wind originates FROM.
  // Downwind smoke trajectory travels TOWARDS theta + 180 degrees.
  const downwindBearing = (input.windDirectionDeg + 180) % 360;
  const spreadAngle = 35; // Standard Gaussian plume horizontal dispersion cone (+- 35 deg)

  const downwindSector: DownwindSector = {
    downwindBearingDeg: downwindBearing,
    spreadAngleDeg: spreadAngle,
    minBearingDeg: (downwindBearing - spreadAngle + 360) % 360,
    maxBearingDeg: (downwindBearing + spreadAngle) % 360,
    plumeTransportSpeedKmh: Math.max(1, input.windSpeedKmh),
  };

  // 1. Filter fire detections within radius and calculate bearings
  const nearbyDetections: IncidentViewResult['nearbyThermalDetections'] = [];

  for (const fire of input.fireDetections) {
    const dist = calculateDistanceKm(input.targetLat, input.targetLon, fire.latitude, fire.longitude);
    if (dist <= radius) {
      const bearing = calculateBearingDeg(input.targetLat, input.targetLon, fire.latitude, fire.longitude);
      nearbyDetections.push({
        ...fire,
        distanceKm: dist,
        bearingDeg: bearing,
      });
    }
  }

  // Sort by closest
  nearbyDetections.sort((a, b) => a.distanceKm - b.distanceKm);

  // 2. Filter stations located in the downwind sector
  const downwindStations: IncidentViewResult['stationsInDownwindSector'] = [];

  for (const st of input.stations) {
    const dist = calculateDistanceKm(input.targetLat, input.targetLon, st.lat, st.lon);
    if (dist <= radius) {
      const bearing = calculateBearingDeg(input.targetLat, input.targetLon, st.lat, st.lon);
      if (isBearingInSector(bearing, downwindBearing, spreadAngle)) {
        downwindStations.push({
          ...st,
          distanceKm: dist,
          bearingDeg: bearing,
        });
      }
    }
  }

  const activeClusterIdentified = nearbyDetections.length >= 3;

  let trajectoryNotice: string;
  if (nearbyDetections.length === 0) {
    trajectoryNotice = 'No significant satellite thermal anomaly detections located within 100 km.';
  } else if (input.windSpeedKmh < 4) {
    trajectoryNotice = `${nearbyDetections.length} satellite thermal points detected within ${radius} km. Near-calm winds indicate localized smoke stagnation rather than directional plume transport.`;
  } else {
    trajectoryNotice = `${nearbyDetections.length} satellite thermal points detected within ${radius} km. Prevailing winds from ${Math.round(
      input.windDirectionDeg
    )}° transport smoke towards ${downwindBearing}° (downwind sector estimate).`;
  }

  return {
    searchRadiusKm: radius,
    nearbyThermalDetections: nearbyDetections,
    downwindSector,
    stationsInDownwindSector: downwindStations,
    activeClusterIdentified,
    smokeTrajectoryNotice: trajectoryNotice,
    isEstimate: true,
    engine: {
      name: 'incident',
      version: ENGINE_VERSION,
    },
  };
}
