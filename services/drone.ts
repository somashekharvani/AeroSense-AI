/**
 * AeroSense Drone Hardware & Ingestion Service
 *
 * NON-NEGOTIABLE RULES from AGENTS.md:
 * "The software must work without it. Provide `/api/drone/ingest` with Zod validation
 * and a simulated-flight demo. Every simulated reading is labelled SIMULATED; the real
 * connection shows 'Not Connected' until validated data arrives.
 * MQ135 is only a relative gas-response trend and never feeds the AQI. No camera-based fire detection."
 */

import { z } from 'zod';
import globalCache from '@/lib/caching/cache';

export const DronePacketSchema = z.object({
  droneId: z.string().min(3),
  timestamp: z.string().or(z.number()),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
  }),
  altitudeM: z.number().nonnegative(),
  sensors: z.object({
    pms5003: z.object({
      pm25: z.number().nonnegative(),
      pm10: z.number().nonnegative().optional(),
    }),
    mq135: z.object({
      rawAdc: z.number().min(0).max(1023),
      trendInterpretation: z.enum(['baseline', 'elevated', 'spike']).optional(),
    }),
  }),
  batteryPct: z.number().min(0).max(100).optional().default(100),
  isSimulated: z.boolean().default(false),
});

export type DronePacket = z.infer<typeof DronePacketSchema>;

export interface DroneStatusResponse {
  connected: boolean;
  status: 'online' | 'not_connected' | 'simulated';
  badge: 'Live Connection' | 'Not Connected' | 'SIMULATED';
  lastPacket: DronePacket | null;
  notice: string;
}

const DRONE_CACHE_KEY = 'drone:latest_telemetry';

/**
 * Stores validated drone packet in cache
 */
export function storeDroneTelemetry(packet: DronePacket): void {
  // Store with 30-second TTL
  globalCache.set(DRONE_CACHE_KEY, packet, 30);
}

/**
 * Retrieves the current drone telemetry status
 */
export function getDroneTelemetryStatus(demoMode = false): DroneStatusResponse {
  if (demoMode) {
    const demoPacket: DronePacket = {
      droneId: 'AEROSENSE-UAV-DEMO',
      timestamp: new Date().toISOString(),
      coordinates: { lat: 28.61, lon: 77.21 },
      altitudeM: 45.5,
      sensors: {
        pms5003: { pm25: 112, pm10: 178 },
        mq135: { rawAdc: 420, trendInterpretation: 'elevated' },
      },
      batteryPct: 88,
      isSimulated: true,
    };

    return {
      connected: false,
      status: 'simulated',
      badge: 'SIMULATED',
      lastPacket: demoPacket,
      notice: 'Simulated flight demo telemetry. MQ135 is a relative gas response trend only and never feeds NAQI.',
    };
  }

  const cached = globalCache.get<DronePacket>(DRONE_CACHE_KEY);

  if (cached.exists && cached.data && !cached.isStale) {
    return {
      connected: true,
      status: cached.data.isSimulated ? 'simulated' : 'online',
      badge: cached.data.isSimulated ? 'SIMULATED' : 'Live Connection',
      lastPacket: cached.data,
      notice: cached.data.isSimulated
        ? 'Simulated telemetry stream active.'
        : 'Hardware link active from ESP8266 telemetry node.',
    };
  }

  return {
    connected: false,
    status: 'not_connected',
    badge: 'Not Connected',
    lastPacket: null,
    notice: 'No validated hardware packets received. Software functions fully without drone link.',
  };
}
