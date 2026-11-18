import { z } from 'zod';

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export const ConfidenceLevelSchema = z.enum(['high', 'medium', 'low']);

export type SourceType = 'model' | 'station' | 'satellite' | 'drone' | 'simulated';
export const SourceTypeSchema = z.enum(['model', 'station', 'satellite', 'drone', 'simulated']);

/**
 * Individual pollutant reading with averaging & completeness metadata
 */
export const PollutantReadingSchema = z.object({
  value: z.number(),
  unit: z.string(),
  subIndex: z.number().optional(),
  averagingHours: z.number().default(24),
  validHoursCount: z.number().default(24),
  isCompletenessMet: z.boolean().default(true),
});
export type PollutantReading = z.infer<typeof PollutantReadingSchema>;

export const CriteriaPollutantsSchema = z.object({
  pm25: z.number().nullable().optional(),
  pm10: z.number().nullable().optional(),
  no2: z.number().nullable().optional(),
  so2: z.number().nullable().optional(),
  co: z.number().nullable().optional(), // mg/m3
  o3: z.number().nullable().optional(),
  nh3: z.number().nullable().optional(),
  pb: z.number().nullable().optional(),
});
export type CriteriaPollutants = z.infer<typeof CriteriaPollutantsSchema>;

/**
 * Hourly weather & atmospheric layer data
 */
export const WeatherHourSchema = z.object({
  timestamp: z.string(),
  temperature2m: z.number(),
  relativeHumidity: z.number(),
  windSpeed10m: z.number(), // km/h or m/s
  windDirection10m: z.number(), // degrees (0-360)
  cloudCover: z.number(), // % (0-100)
  boundaryLayerHeight: z.number(), // meters
  surfaceElevation: z.number().default(0), // meters above sea level
  pressure925Temp: z.number().nullable().optional(), // °C
  pressure925Height: z.number().nullable().optional(), // geopotential meters
  pressure850Temp: z.number().nullable().optional(), // °C
  pressure850Height: z.number().nullable().optional(), // geopotential meters
});
export type WeatherHour = z.infer<typeof WeatherHourSchema>;

/**
 * Vertical atmospheric profile for thermal gradient computation
 */
export const AtmosphereProfileSchema = z.object({
  surfaceElevation: z.number(), // meters
  surfaceTemp: z.number(), // °C
  levels: z.array(
    z.object({
      pressureHpa: z.number(),
      tempC: z.number(),
      geopotentialHeightM: z.number(),
    })
  ),
});
export type AtmosphereProfile = z.infer<typeof AtmosphereProfileSchema>;

/**
 * Specific observation from a validated data source
 */
export const SourceObservationSchema = z.object({
  value: z.number(),
  unit: z.string(),
  sourceType: SourceTypeSchema,
  sourceName: z.string(),
  timestamp: z.string(),
  distanceKm: z.number().optional(),
  qualityScore: z.number().min(0).max(1).default(1),
});
export type SourceObservation = z.infer<typeof SourceObservationSchema>;

/**
 * Fused air state combining station feeds and atmospheric models
 */
export const FusedAirStateSchema = z.object({
  pollutants: CriteriaPollutantsSchema,
  dominantSource: SourceTypeSchema,
  sourcesUsed: z.array(SourceObservationSchema),
  disagreement: z.boolean(),
  disagreementReason: z.string().optional(),
  confidence: z.object({
    level: ConfidenceLevelSchema,
    reasons: z.array(z.string()),
  }),
  timestamp: z.string(),
});
export type FusedAirState = z.infer<typeof FusedAirStateSchema>;

/**
 * Family member profile for exposure budgeting
 */
export const FamilyMemberSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  ageGroup: z.enum(['child', 'adult', 'elderly']),
  activityLevel: z.enum(['rest', 'light', 'moderate']),
  sensitivities: z
    .array(z.enum(['asthma', 'copd', 'cardiovascular', 'pregnancy', 'allergies']))
    .default([]),
});
export type FamilyMember = z.infer<typeof FamilyMemberSchema>;

/**
 * Indoor microenvironment room model
 */
export const RoomSchema = z.object({
  id: z.string(),
  name: z.string().default('Living Room'),
  volumeM3: z.number().positive(),
  leakiness: z.enum(['sealed', 'normal', 'drafty']).default('normal'),
  cadrM3h: z.number().nonnegative().default(0), // 0 if no purifier
  windowsOpen: z.boolean().default(false),
  hasCookingSource: z.boolean().default(false),
});
export type Room = z.infer<typeof RoomSchema>;

/**
 * Validated Fact Object for Gemini Prompt Injection Defense & Fact Checking
 */
export const FactItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.union([z.number(), z.string(), z.boolean()]),
  unit: z.string().optional(),
  source: z.string(),
  timestamp: z.string(),
});
export type FactItem = z.infer<typeof FactItemSchema>;

export const FactsObjectSchema = z.record(z.string(), FactItemSchema);
export type FactsObject = z.infer<typeof FactsObjectSchema>;

/**
 * Verifiable Impact Receipt Schema
 */
export const ImpactReceiptSchema = z.object({
  id: z.string(),
  recommendation: z.string(),
  action: z.string(),
  baseline: z.string(),
  alternative: z.string(),
  change: z.object({
    value: z.union([z.number(), z.string()]),
    unit: z.string(),
    direction: z.enum(['reduction', 'increase', 'neutral']),
  }),
  method: z.string(),
  assumptions: z.array(z.string()),
  dataUsed: z.array(
    z.object({
      factId: z.string(),
      source: z.string(),
      timestamp: z.string().optional(),
    })
  ),
  confidence: z.object({
    level: ConfidenceLevelSchema,
    reasons: z.array(z.string()),
  }),
  engine: z.object({
    name: z.string(),
    version: z.string(),
  }),
  aiExplanation: z.string().optional(),
});
export type ImpactReceipt = z.infer<typeof ImpactReceiptSchema>;
