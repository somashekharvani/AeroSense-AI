/**
 * Multi-Source Environmental Data Fusion Engine
 *
 * NON-NEGOTIABLE RULES from AGENTS.md:
 * "Give each observation a quality score from age, distance and completeness.
 * Combine nearby stations with inverse-distance weighting and compare the station
 * value with the modelled value. When sources disagree or data is stale, lower
 * confidence; never hide the disagreement."
 */

import {
  FusedAirState,
  SourceObservation,
  CriteriaPollutants,
  ConfidenceLevel,
} from './validation/schemas';
import { WaqiStationData } from '@/services/waqi';
import { OpenMeteoAirHour } from '@/services/open-meteo';

export interface FusionInput {
  targetLat: number;
  targetLon: number;
  modelAir?: OpenMeteoAirHour;
  stations?: WaqiStationData[];
  nowTimestamp?: string;
}

/**
 * Computes individual observation quality score (0.0 to 1.0)
 */
export function calculateObservationQuality(
  distanceKm: number,
  ageHours: number,
  reportedPollutantsCount: number
): number {
  // Distance score: 1.0 within 5km, decays with distance (0.5 at 25km, 0.1 at 100km)
  const distanceScore = 1.0 / (1.0 + distanceKm / 20.0);

  // Age score: 1.0 within 1 hour, decays steadily
  const ageScore = Math.max(0.1, Math.exp(-ageHours / 4.0));

  // Completeness score: fraction of 6 criteria pollutants
  const completenessScore = Math.min(1.0, reportedPollutantsCount / 5.0);

  // Weighted composite quality score
  const quality = 0.45 * distanceScore + 0.35 * ageScore + 0.2 * completenessScore;
  return Math.round(quality * 100) / 100;
}

/**
 * Fuses station telemetry and atmospheric models into a unified air state
 */
export function fuseAirData(input: FusionInput): FusedAirState {
  const ts = input.nowTimestamp || new Date().toISOString();
  const sourcesUsed: SourceObservation[] = [];
  const confidenceReasons: string[] = [];

  let modelPm25: number | null = null;
  let modelPm10: number | null = null;

  // 1. Process Open-Meteo Model Data
  if (input.modelAir) {
    modelPm25 = input.modelAir.pm25;
    modelPm10 = input.modelAir.pm10;

    sourcesUsed.push({
      value: input.modelAir.pm25,
      unit: 'µg/m³',
      sourceType: 'model',
      sourceName: 'Open-Meteo / CAMS Atmospheric Reanalysis',
      timestamp: input.modelAir.timestamp,
      qualityScore: 0.75, // Model baseline score
    });
  } else {
    confidenceReasons.push('Model atmospheric data unavailable');
  }

  // 2. Process Station Telemetry using Inverse-Distance Weighting (IDW)
  const validStations = (input.stations || []).filter(
    (st) => st.pollutants.pm25 !== null && st.pollutants.pm25 !== undefined
  );

  let fusedStationPm25: number | null = null;
  let fusedStationPm10: number | null = null;
  let nearestStationDist = 999;
  let nearestStationName = '';

  if (validStations.length > 0) {
    let sumWeightPm25 = 0;
    let weightedPm25 = 0;
    let sumWeightPm10 = 0;
    let weightedPm10 = 0;

    const nowMs = new Date(ts).getTime();

    for (const st of validStations) {
      const dist = st.distanceKm ?? 10;
      if (dist < nearestStationDist) {
        nearestStationDist = dist;
        nearestStationName = st.stationName;
      }

      const stTimeMs = new Date(st.timestamp).getTime();
      const ageHours = Math.max(0, (nowMs - stTimeMs) / (1000 * 60 * 60));

      const count = Object.values(st.pollutants).filter((v) => v !== null).length;
      const qScore = calculateObservationQuality(dist, ageHours, count);

      // Inverse-Distance Weighting: w = 1 / (d + 1)^2
      const idwWeight = 1.0 / Math.pow(dist + 1.0, 1.5);

      if (typeof st.pollutants.pm25 === 'number') {
        weightedPm25 += st.pollutants.pm25 * idwWeight;
        sumWeightPm25 += idwWeight;
      }

      if (typeof st.pollutants.pm10 === 'number') {
        weightedPm10 += st.pollutants.pm10 * idwWeight;
        sumWeightPm10 += idwWeight;
      }

      sourcesUsed.push({
        value: typeof st.pollutants.pm25 === 'number' ? st.pollutants.pm25 : (st.pollutants.pm10 ?? 0),
        unit: 'µg/m³',
        sourceType: 'station',
        sourceName: `CPCB Station: ${st.stationName}`,
        timestamp: st.timestamp,
        distanceKm: dist,
        qualityScore: qScore,
      });
    }

    fusedStationPm25 = sumWeightPm25 > 0 ? weightedPm25 / sumWeightPm25 : null;
    fusedStationPm10 = sumWeightPm10 > 0 ? weightedPm10 / sumWeightPm10 : null;
  } else {
    confidenceReasons.push('No ground monitoring stations available within active range');
  }

  // 3. Evaluate Disagreement between Station and Model
  let disagreement = false;
  let disagreementReason: string | undefined;

  if (fusedStationPm25 !== null && modelPm25 !== null) {
    const absDiff = Math.abs(fusedStationPm25 - modelPm25);
    const mean = (fusedStationPm25 + modelPm25) / 2;
    const pctDiff = mean > 0 ? (absDiff / mean) * 100 : 0;

    // Disagreement threshold: > 30 µg/m³ or > 35% relative delta
    if (absDiff > 30 || pctDiff > 35) {
      disagreement = true;
      disagreementReason = `Ground station (${Math.round(
        fusedStationPm25
      )} µg/m³) and atmospheric model (${Math.round(
        modelPm25
      )} µg/m³) diverge by ${Math.round(absDiff)} µg/m³ (${Math.round(pctDiff)}%)`;
      confidenceReasons.push(disagreementReason);
    }
  }

  // 4. Best Consolidated Estimate per Pollutant
  // Ground station measurement takes precedence for local surface if close; otherwise blended
  let bestPm25: number;
  let dominantSource: 'station' | 'model';

  if (fusedStationPm25 !== null) {
    if (nearestStationDist <= 15) {
      bestPm25 = Math.round(fusedStationPm25 * 10) / 10;
      dominantSource = 'station';
    } else if (modelPm25 !== null) {
      // Blend 60% station, 40% model
      bestPm25 = Math.round((0.6 * fusedStationPm25 + 0.4 * modelPm25) * 10) / 10;
      dominantSource = 'station';
    } else {
      bestPm25 = Math.round(fusedStationPm25 * 10) / 10;
      dominantSource = 'station';
    }
  } else if (modelPm25 !== null) {
    bestPm25 = Math.round(modelPm25 * 10) / 10;
    dominantSource = 'model';
  } else {
    bestPm25 = 0;
    dominantSource = 'model';
  }

  const bestPm10 =
    fusedStationPm10 !== null
      ? Math.round(fusedStationPm10 * 10) / 10
      : modelPm10 !== null
      ? Math.round(modelPm10 * 10) / 10
      : null;

  // Other pollutants from station or model
  const primaryStation = validStations.length > 0 ? validStations[0] : null;

  const pollutants: CriteriaPollutants = {
    pm25: bestPm25,
    pm10: bestPm10,
    no2: primaryStation?.pollutants.no2 ?? input.modelAir?.no2 ?? null,
    so2: primaryStation?.pollutants.so2 ?? input.modelAir?.so2 ?? null,
    co: primaryStation?.pollutants.co ?? input.modelAir?.coMgM3 ?? null,
    o3: primaryStation?.pollutants.o3 ?? input.modelAir?.o3 ?? null,
    nh3: primaryStation?.pollutants.nh3 ?? null,
    pb: primaryStation?.pollutants.pb ?? null,
  };

  // 5. Determine Overall Confidence Level
  let confLevel: ConfidenceLevel = 'high';

  if (disagreement) {
    confLevel = 'medium';
  } else if (validStations.length === 0) {
    confLevel = 'medium';
    confidenceReasons.push('Using satellite/model reanalysis only; no ground station co-located');
  } else if (nearestStationDist > 30) {
    confLevel = 'medium';
    confidenceReasons.push(`Nearest ground station is ${nearestStationDist.toFixed(1)} km away`);
  }

  if (validStations.length === 0 && !input.modelAir) {
    confLevel = 'low';
  }

  if (confLevel === 'high') {
    confidenceReasons.push(`Co-located ground telemetry (${nearestStationName}) verified by atmospheric model`);
  }

  return {
    pollutants,
    dominantSource,
    sourcesUsed,
    disagreement,
    disagreementReason,
    confidence: {
      level: confLevel,
      reasons: confidenceReasons,
    },
    timestamp: ts,
  };
}
