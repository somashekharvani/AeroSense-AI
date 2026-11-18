import { describe, it, expect } from 'vitest';
import {
  calculateTransportImpact,
  calculateCookingImpact,
  calculatePurifierImpact,
} from '@/engines/impact';
import { ImpactReceiptSchema } from '@/lib/validation/schemas';

describe('Impact Engine & Auditable Receipts', () => {
  it('calculates transport impact between petrol scooter and metro', () => {
    const receipt = calculateTransportImpact({
      baselineMode: 'petrol_2w',
      alternativeMode: 'metro',
      oneWayDistanceKm: 15,
      ambientPm25UgM3: 200,
    });

    // Verify against Zod schema
    const parseRes = ImpactReceiptSchema.safeParse(receipt);
    expect(parseRes.success).toBe(true);

    expect(receipt.change.direction).toBe('reduction');
    expect(typeof receipt.change.value).toBe('number');
    expect(Number(receipt.change.value)).toBeGreaterThan(50); // Metro provides > 50% exposure reduction
    expect(receipt.assumptions.length).toBeGreaterThan(0);
    expect(receipt.dataUsed.length).toBeGreaterThan(0);
    expect(receipt.engine.name).toBe('impact');
  });

  it('yields zero change when baseline and alternative modes are identical', () => {
    const receipt = calculateTransportImpact({
      baselineMode: 'car',
      alternativeMode: 'car',
      oneWayDistanceKm: 10,
      ambientPm25UgM3: 150,
    });

    expect(receipt.change.value).toBe(0);
  });

  it('calculates cooking fuel transition impact (biomass to induction)', () => {
    const receipt = calculateCookingImpact({
      baselineFuel: 'biomass',
      alternativeFuel: 'electric',
      cookingHoursPerDay: 2,
      roomVolumeM3: 40,
    });

    const parseRes = ImpactReceiptSchema.safeParse(receipt);
    expect(parseRes.success).toBe(true);

    expect(receipt.change.direction).toBe('reduction');
    expect(Number(receipt.change.value)).toBeGreaterThan(90); // > 90% emission reduction
  });

  it('calculates purifier active impact and validates against Zod schema', () => {
    const receipt = calculatePurifierImpact({
      roomVolumeM3: 50,
      ambientPm25UgM3: 220,
      runtimeHours: 8,
      cadrM3h: 300,
    });

    const parseRes = ImpactReceiptSchema.safeParse(receipt);
    expect(parseRes.success).toBe(true);

    expect(receipt.change.direction).toBe('reduction');
    expect(Number(receipt.change.value)).toBeGreaterThan(70);
  });
});
