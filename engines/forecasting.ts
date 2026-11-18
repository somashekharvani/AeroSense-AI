/**
 * Forecasting Evaluation Metrics & Atmospheric Adjustment Engine
 *
 * NON-NEGOTIABLE RULE from AGENTS.md:
 * "Forecast and exposure outputs show assumptions and uncertainty.
 * Do not claim a custom ML model unless one is trained and validated."
 *
 * MATHEMATICAL DEFINITIONS:
 * For forecast series Y_hat = {y_hat_1, ..., y_hat_n} and observed series Y = {y_1, ..., y_n}:
 *
 *   Mean Absolute Error (MAE):
 *     MAE = (1 / n) * ∑ |y_hat_i - y_i|
 *
 *   Root Mean Square Error (RMSE):
 *     RMSE = sqrt( (1 / n) * ∑ (y_hat_i - y_i)^2 )
 *
 *   Mean Bias Error (MBE / Bias):
 *     Bias = (1 / n) * ∑ (y_hat_i - y_i)
 *
 * INVERSION & BLH HEURISTIC CORRECTION:
 * Standard global models (e.g. CAMS / Open-Meteo) frequently underestimate peak winter surface
 * concentrations in North India due to coarse vertical grid resolution near the boundary layer.
 * A deterministic adjustment applies a trapped-volume factor based on computed inversion risk and BLH.
 */

export const ENGINE_VERSION = 'forecasting@1.0.0';

export interface BacktestMetrics {
  sampleCount: number;
  mae: number;
  rmse: number;
  bias: number;
  correlationR2: number;
  evaluationNote: string;
}

export interface PairedObservation {
  timestamp: string;
  forecast: number;
  observed: number;
}

/**
 * Calculates statistical backtest evaluation metrics between predicted and observed series
 */
export function calculateBacktestMetrics(pairs: PairedObservation[]): BacktestMetrics {
  const validPairs = pairs.filter(
    (p) => !isNaN(p.forecast) && !isNaN(p.observed) && p.forecast >= 0 && p.observed >= 0
  );

  const n = validPairs.length;
  if (n === 0) {
    return {
      sampleCount: 0,
      mae: 0,
      rmse: 0,
      bias: 0,
      correlationR2: 0,
      evaluationNote: 'Not enough data to validate yet.',
    };
  }

  let sumAbsoluteError = 0;
  let sumSquaredError = 0;
  let sumBias = 0;

  let sumObs = 0;
  let sumPred = 0;

  for (const pair of validPairs) {
    const error = pair.forecast - pair.observed;
    sumBias += error;
    sumAbsoluteError += Math.abs(error);
    sumSquaredError += error * error;

    sumObs += pair.observed;
    sumPred += pair.forecast;
  }

  const mae = sumAbsoluteError / n;
  const rmse = Math.sqrt(sumSquaredError / n);
  const bias = sumBias / n;

  // Pearson R correlation
  const meanObs = sumObs / n;
  const meanPred = sumPred / n;

  let numerator = 0;
  let denomObs = 0;
  let denomPred = 0;

  for (const pair of validPairs) {
    const dObs = pair.observed - meanObs;
    const dPred = pair.forecast - meanPred;
    numerator += dObs * dPred;
    denomObs += dObs * dObs;
    denomPred += dPred * dPred;
  }

  const r = denomObs > 0 && denomPred > 0 ? numerator / Math.sqrt(denomObs * denomPred) : 0;
  const r2 = Math.max(0, Math.min(1, r * r));

  return {
    sampleCount: n,
    mae: Math.round(mae * 10) / 10,
    rmse: Math.round(rmse * 10) / 10,
    bias: Math.round(bias * 10) / 10,
    correlationR2: Math.round(r2 * 100) / 100,
    evaluationNote:
      bias > 10
        ? 'Model has a positive bias (overpredicting concentration).'
        : bias < -10
        ? 'Model has a negative bias (underpredicting concentration).'
        : 'Model demonstrates balanced calibration against station observations.',
  };
}

/**
 * Applies deterministic physical inversion & boundary-layer compression adjustment
 * to raw baseline forecast.
 *
 * NOT an ML model. Deterministic vertical column compression scaling.
 */
export function applyInversionCompressionFactor(
  baselineForecastPm25: number,
  boundaryLayerHeightM: number,
  inversionRiskScore: number
): { adjustedPm25: number; scalingMultiplier: number; reason: string } {
  let multiplier = 1.0;
  let reason = 'Standard convective mixing';

  // If high inversion risk and compressed boundary layer
  if (inversionRiskScore >= 60 && boundaryLayerHeightM < 300) {
    // Up to 25% elevation due to vertical trapping
    multiplier = 1.0 + (inversionRiskScore / 100) * 0.25;
    reason =
      'Upward adjustment applied for severe shallow boundary layer trapping under thermal inversion';
  } else if (inversionRiskScore >= 40 && boundaryLayerHeightM < 450) {
    multiplier = 1.0 + (inversionRiskScore / 100) * 0.12;
    reason = 'Moderate adjustment for restricted atmospheric mixing volume';
  } else if (boundaryLayerHeightM > 1200) {
    multiplier = 0.92;
    reason = 'Downward adjustment for deep convective boundary-layer dilution';
  }

  const adjusted = Math.round(baselineForecastPm25 * multiplier * 10) / 10;

  return {
    adjustedPm25: adjusted,
    scalingMultiplier: Math.round(multiplier * 100) / 100,
    reason,
  };
}
