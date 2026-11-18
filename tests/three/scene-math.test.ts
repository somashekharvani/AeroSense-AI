import { describe, it, expect } from 'vitest';
import {
  getAqiParticleColor,
  calculateAtmosphereParticles,
  calculateIndoorFlowDynamics,
} from '@/components/three/scene-math';

describe('3D Scene Mathematical Mappings & Color Dynamics', () => {
  it('correctly maps CPCB NAQI values to accessible particle color codes', () => {
    expect(getAqiParticleColor(30)).toBe('#10b981'); // Emerald (Good)
    expect(getAqiParticleColor(75)).toBe('#84cc16'); // Lime (Satisfactory)
    expect(getAqiParticleColor(150)).toBe('#f59e0b'); // Amber (Moderate)
    expect(getAqiParticleColor(250)).toBe('#f97316'); // Orange (Poor)
    expect(getAqiParticleColor(350)).toBe('#ef4444'); // Red (Very Poor)
    expect(getAqiParticleColor(450)).toBe('#9333ea'); // Purple (Severe)
  });

  it('calculates atmosphere particle count and ceiling height based on PM2.5 and BLH', () => {
    // Clean air: PM2.5 = 15 ug/m3, BLH = 800m, normal convective atmosphere
    const cleanConfig = calculateAtmosphereParticles(15, 800, false);
    expect(cleanConfig.count).toBeLessThan(300);
    expect(cleanConfig.speed).toBe(1.2);
    expect(cleanConfig.heightRange[1]).toBe(6.0); // Convective dispersion ceiling

    // Severe smog in winter: PM2.5 = 350 ug/m3, BLH = 150m, thermal inversion active
    const smogConfig = calculateAtmosphereParticles(350, 150, true);
    expect(smogConfig.count).toBeGreaterThan(800);
    expect(smogConfig.speed).toBe(0.3); // Stagnant
    expect(smogConfig.heightRange[1]).toBeLessThanOrEqual(3.5); // Trapped under inversion lid
  });

  it('models indoor smoke reduction and infiltration dynamics accurately', () => {
    // Baseline: Window closed, Purifier running at 300 m3/h, no cooking
    const filteredRoom = calculateIndoorFlowDynamics(false, 300, false);
    expect(filteredRoom.indoorSmokeDensity).toBeLessThan(0.15);
    expect(filteredRoom.purifierStreamVelocity).toBeGreaterThan(1.0);
    expect(filteredRoom.infiltrationRate).toBe(0.1);

    // Active cooking with window open and no purifier
    const cookingRoom = calculateIndoorFlowDynamics(true, 0, true);
    expect(cookingRoom.indoorSmokeDensity).toBeGreaterThan(0.8);
    expect(cookingRoom.purifierStreamVelocity).toBe(0);
    expect(cookingRoom.infiltrationRate).toBe(1.5);
  });
});
