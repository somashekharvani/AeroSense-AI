import { describe, it, expect } from 'vitest';
import {
  calculateBacktestMetrics,
  applyInversionCompressionFactor,
} from '@/engines/forecasting';

describe('Forecasting Metrics & Atmospheric Adjustments Engine', () => {
  it('accurately computes MAE, RMSE, and Bias for known paired observation series', () => {
    // Known series:
    // Forecast: [100, 110, 120]
    // Observed: [90, 115, 130]
    // Errors: [10, -5, -10]
    // Abs Errors: [10, 5, 10] -> Mean = 25/3 ≈ 8.33
    // Sq Errors: [100, 25, 100] -> Mean = 225/3 = 75 -> RMSE = sqrt(75) ≈ 8.66
    // Bias: (10 - 5 - 10) / 3 = -5/3 ≈ -1.67
    const pairs = [
      { timestamp: '2026-11-18T00:00:00Z', forecast: 100, observed: 90 },
      { timestamp: '2026-11-18T01:00:00Z', forecast: 110, observed: 115 },
      { timestamp: '2026-11-18T02:00:00Z', forecast: 120, observed: 130 },
    ];

    const metrics = calculateBacktestMetrics(pairs);
    expect(metrics.sampleCount).toBe(3);
    expect(metrics.mae).toBe(8.3);
    expect(metrics.rmse).toBe(8.7);
    expect(metrics.bias).toBe(-1.7);
  });

  it('handles empty or zero valid observations gracefully', () => {
    const metrics = calculateBacktestMetrics([]);
    expect(metrics.sampleCount).toBe(0);
    expect(metrics.evaluationNote).toContain('Not enough data to validate yet');
  });

  it('applies atmospheric column compression factor when inversion risk is high and boundary layer is low', () => {
    // Forecast 100 ug/m3 with severe winter inversion (Score 80) and low BLH (200m)
    const res = applyInversionCompressionFactor(100, 200, 80);
    expect(res.scalingMultiplier).toBeGreaterThan(1.0);
    expect(res.adjustedPm25).toBeGreaterThan(100);
    expect(res.reason).toContain('trapping');
  });
});
