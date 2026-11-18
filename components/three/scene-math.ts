/**
 * 3D Scene Mathematical Mapping & Particle Color Utilities
 * Pure deterministic mapping from atmospheric science to 3D rendering parameters.
 */

export interface ParticleConfig {
  count: number;
  color: string;
  speed: number;
  size: number;
  heightRange: [number, number];
}

/**
 * Maps CPCB AQI value to an accessible particle hex color
 */
export function getAqiParticleColor(aqi: number): string {
  if (aqi <= 50) return '#10b981'; // Emerald (Good)
  if (aqi <= 100) return '#84cc16'; // Lime (Satisfactory)
  if (aqi <= 200) return '#f59e0b'; // Amber (Moderate)
  if (aqi <= 300) return '#f97316'; // Orange (Poor)
  if (aqi <= 400) return '#ef4444'; // Red (Very Poor)
  return '#9333ea'; // Purple (Severe)
}

/**
 * Calculates 3D particle parameters from PM2.5 concentration and Boundary Layer Height
 */
export function calculateAtmosphereParticles(
  pm25UgM3: number,
  blhM: number,
  isInverted: boolean
): ParticleConfig {
  // Clamp PM2.5 between 5 and 500 for visualization scaling
  const clampedPm = Math.max(5, Math.min(500, pm25UgM3));
  // Scale particle count between 150 (clean) and 1200 (dense winter smog)
  const count = Math.round(150 + (clampedPm / 500) * 1050);

  // Inverted atmosphere traps particles below the BLH ceiling (e.g. Y: 0.2 to 2.5)
  // Convective atmosphere allows particles to disperse vertically (Y: 0.2 to 6.0)
  const ceilingY = isInverted ? Math.max(1.2, Math.min(3.5, blhM / 200)) : 6.0;

  // Inversion slows dispersion velocity
  const speed = isInverted ? 0.3 : 1.2;

  // Particle size slightly expands in smog
  const size = Math.max(0.04, Math.min(0.12, 0.04 + (clampedPm / 500) * 0.08));

  return {
    count,
    color: getAqiParticleColor(clampedPm * 1.5),
    speed,
    size,
    heightRange: [0.2, ceilingY],
  };
}

/**
 * Maps room purifier CADR and window state to indoor particle reduction speed
 */
export function calculateIndoorFlowDynamics(
  windowOpen: boolean,
  purifierCadrM3h: number,
  cookingActive: boolean
): {
  indoorSmokeDensity: number; // 0 (clean) to 1 (saturated)
  purifierStreamVelocity: number;
  infiltrationRate: number;
} {
  let smoke = 0.2; // Baseline
  if (windowOpen) smoke += 0.45;
  if (cookingActive) smoke += 0.55;

  const reduction = Math.min(0.85, (purifierCadrM3h / 500) * 0.85);
  smoke = Math.max(0.05, Math.min(1.0, smoke - reduction));

  return {
    indoorSmokeDensity: smoke,
    purifierStreamVelocity: purifierCadrM3h > 0 ? Math.min(2.5, 0.5 + purifierCadrM3h / 200) : 0,
    infiltrationRate: windowOpen ? 1.5 : 0.1,
  };
}
