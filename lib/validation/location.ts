import { z } from 'zod';
import { SUPPORTED_LOCALES } from '../i18n/locales';

/**
 * Rounds coordinate to approximately 2 decimal places (~1.1 km precision) for user privacy.
 */
export function roundCoordinate(coord: number): number {
  return Math.round(coord * 100) / 100;
}

export const LocationQuerySchema = z.object({
  lat: z.coerce
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .transform(roundCoordinate),
  lon: z.coerce
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .transform(roundCoordinate),
  lang: z.enum(SUPPORTED_LOCALES).default('en'),
});

export type LocationQueryParams = z.infer<typeof LocationQuerySchema>;

export const UserLocationSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  state: z.string().optional().default(''),
  country: z.string().optional().default('India'),
  lat: z.number().min(-90).max(90).transform(roundCoordinate),
  lon: z.number().min(-180).max(180).transform(roundCoordinate),
  isCustom: z.boolean().default(false),
  savedAt: z.number().default(() => Date.now()),
});

export type UserLocation = z.infer<typeof UserLocationSchema>;
