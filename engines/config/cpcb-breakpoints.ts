/**
 * CPCB National Air Quality Index (NAQI) Breakpoints & Guidelines
 *
 * OFFICIAL CITATION:
 * Central Pollution Control Board (CPCB), Ministry of Environment, Forest and Climate Change,
 * Government of India: "National Air Quality Index", October 2014.
 * Report: http://www.cpcb.nic.in/upload/NAQI_FINAL_REPORT.pdf
 */

export interface BreakpointBand {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

export interface PollutantConfig {
  name: string;
  unit: string;
  averagingHours: 24 | 8;
  minValidHours: number; // 16 for 24h, 6 for 8h
  bands: BreakpointBand[];
}

export const AQI_CATEGORY_BANDS = [
  { min: 0, max: 50, category: 'Good' },
  { min: 51, max: 100, category: 'Satisfactory' },
  { min: 101, max: 200, category: 'Moderate' },
  { min: 201, max: 300, category: 'Poor' },
  { min: 301, max: 400, category: 'Very Poor' },
  { min: 401, max: 500, category: 'Severe' },
] as const;

export type CpcbAqiCategory = (typeof AQI_CATEGORY_BANDS)[number]['category'];

export const CPCB_POLLUTANT_CONFIGS: Record<string, PollutantConfig> = {
  pm25: {
    name: 'PM2.5',
    unit: 'µg/m³',
    averagingHours: 24,
    minValidHours: 16,
    bands: [
      { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
      { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
      { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
      { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
      { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
      { cLow: 251, cHigh: 380, iLow: 401, iHigh: 500 },
    ],
  },
  pm10: {
    name: 'PM10',
    unit: 'µg/m³',
    averagingHours: 24,
    minValidHours: 16,
    bands: [
      { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
      { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
      { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
      { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
      { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
      { cLow: 431, cHigh: 510, iLow: 401, iHigh: 500 },
    ],
  },
  no2: {
    name: 'NO2',
    unit: 'µg/m³',
    averagingHours: 24,
    minValidHours: 16,
    bands: [
      { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
      { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
      { cLow: 81, cHigh: 180, iLow: 101, iHigh: 200 },
      { cLow: 181, cHigh: 280, iLow: 201, iHigh: 300 },
      { cLow: 281, cHigh: 400, iLow: 301, iHigh: 400 },
      { cLow: 401, cHigh: 500, iLow: 401, iHigh: 500 },
    ],
  },
  so2: {
    name: 'SO2',
    unit: 'µg/m³',
    averagingHours: 24,
    minValidHours: 16,
    bands: [
      { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
      { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
      { cLow: 81, cHigh: 380, iLow: 101, iHigh: 200 },
      { cLow: 381, cHigh: 800, iLow: 201, iHigh: 300 },
      { cLow: 801, cHigh: 1600, iLow: 301, iHigh: 400 },
      { cLow: 1601, cHigh: 2000, iLow: 401, iHigh: 500 },
    ],
  },
  co: {
    name: 'CO',
    unit: 'mg/m³',
    averagingHours: 8,
    minValidHours: 6,
    bands: [
      { cLow: 0, cHigh: 1.0, iLow: 0, iHigh: 50 },
      { cLow: 1.1, cHigh: 2.0, iLow: 51, iHigh: 100 },
      { cLow: 2.1, cHigh: 10.0, iLow: 101, iHigh: 200 },
      { cLow: 10.1, cHigh: 17.0, iLow: 201, iHigh: 300 },
      { cLow: 17.1, cHigh: 34.0, iLow: 301, iHigh: 400 },
      { cLow: 34.1, cHigh: 50.0, iLow: 401, iHigh: 500 },
    ],
  },
  o3: {
    name: 'O3',
    unit: 'µg/m³',
    averagingHours: 8,
    minValidHours: 6,
    bands: [
      { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
      { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
      { cLow: 101, cHigh: 168, iLow: 101, iHigh: 200 },
      { cLow: 169, cHigh: 208, iLow: 201, iHigh: 300 },
      { cLow: 209, cHigh: 748, iLow: 301, iHigh: 400 },
      { cLow: 749, cHigh: 1000, iLow: 401, iHigh: 500 },
    ],
  },
  nh3: {
    name: 'NH3',
    unit: 'µg/m³',
    averagingHours: 24,
    minValidHours: 16,
    bands: [
      { cLow: 0, cHigh: 200, iLow: 0, iHigh: 50 },
      { cLow: 201, cHigh: 400, iLow: 51, iHigh: 100 },
      { cLow: 401, cHigh: 800, iLow: 101, iHigh: 200 },
      { cLow: 801, cHigh: 1200, iLow: 201, iHigh: 300 },
      { cLow: 1201, cHigh: 1800, iLow: 301, iHigh: 400 },
      { cLow: 1801, cHigh: 2400, iLow: 401, iHigh: 500 },
    ],
  },
  pb: {
    name: 'Pb',
    unit: 'µg/m³',
    averagingHours: 24,
    minValidHours: 16,
    bands: [
      { cLow: 0, cHigh: 0.5, iLow: 0, iHigh: 50 },
      { cLow: 0.6, cHigh: 1.0, iLow: 51, iHigh: 100 },
      { cLow: 1.1, cHigh: 2.0, iLow: 101, iHigh: 200 },
      { cLow: 2.1, cHigh: 3.0, iLow: 201, iHigh: 300 },
      { cLow: 3.1, cHigh: 3.5, iLow: 301, iHigh: 400 },
      { cLow: 3.6, cHigh: 5.0, iLow: 401, iHigh: 500 },
    ],
  },
};
