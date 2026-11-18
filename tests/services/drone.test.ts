import { describe, it, expect, beforeEach } from 'vitest';
import {
  DronePacketSchema,
  storeDroneTelemetry,
  getDroneTelemetryStatus,
  DronePacket,
} from '@/services/drone';
import globalCache from '@/lib/caching/cache';

describe('AeroSense Drone Ingest & Telemetry Service', () => {
  beforeEach(() => {
    globalCache.clear();
  });

  it('validates a correct hardware packet with PMS5003 and MQ135', () => {
    const validPacket = {
      droneId: 'UAV-DELHI-01',
      timestamp: '2026-11-18T10:00:00Z',
      coordinates: { lat: 28.61, lon: 77.21 },
      altitudeM: 52.4,
      sensors: {
        pms5003: { pm25: 145, pm10: 210 },
        mq135: { rawAdc: 450, trendInterpretation: 'elevated' },
      },
      batteryPct: 92,
      isSimulated: false,
    };

    const parsed = DronePacketSchema.safeParse(validPacket);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid sensor ranges, such as MQ135 ADC outside 0-1023', () => {
    const invalidAdcPacket = {
      droneId: 'UAV-DELHI-01',
      timestamp: '2026-11-18T10:00:00Z',
      coordinates: { lat: 28.61, lon: 77.21 },
      altitudeM: 50,
      sensors: {
        pms5003: { pm25: 100 },
        mq135: { rawAdc: 9999 }, // Invalid: ADC is 10-bit (0-1023)
      },
    };

    const parsed = DronePacketSchema.safeParse(invalidAdcPacket);
    expect(parsed.success).toBe(false);
  });

  it('returns "Not Connected" badge when no hardware packets have been received', () => {
    const status = getDroneTelemetryStatus(false);
    expect(status.connected).toBe(false);
    expect(status.badge).toBe('Not Connected');
    expect(status.lastPacket).toBeNull();
  });

  it('returns "SIMULATED" badge when in demo mode or when packet is simulated', () => {
    const demoStatus = getDroneTelemetryStatus(true);
    expect(demoStatus.badge).toBe('SIMULATED');
    expect(demoStatus.status).toBe('simulated');
    expect(demoStatus.lastPacket).toBeDefined();
    expect(demoStatus.lastPacket?.isSimulated).toBe(true);
  });

  it('stores and retrieves live hardware telemetry packet cleanly', () => {
    const livePacket: DronePacket = {
      droneId: 'UAV-LIVE-NODE',
      timestamp: new Date().toISOString(),
      coordinates: { lat: 28.61, lon: 77.21 },
      altitudeM: 30,
      sensors: {
        pms5003: { pm25: 88 },
        mq135: { rawAdc: 310 },
      },
      batteryPct: 95,
      isSimulated: false,
    };

    storeDroneTelemetry(livePacket);
    const status = getDroneTelemetryStatus(false);

    expect(status.connected).toBe(true);
    expect(status.badge).toBe('Live Connection');
    expect(status.lastPacket?.droneId).toBe('UAV-LIVE-NODE');
    expect(status.lastPacket?.sensors.pms5003.pm25).toBe(88);
  });
});
