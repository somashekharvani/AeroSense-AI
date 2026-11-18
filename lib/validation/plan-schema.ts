import { z } from 'zod';

export const HourlyRoutineItemSchema = z.object({
  timeSlot: z.string().describe('e.g. "06:00 - 08:00" or "08:00 - 10:00"'),
  activity: z.string().describe('Routine event or context'),
  isOutdoorSafe: z.boolean().describe('False if inversion risk is high or AQI is Poor/Severe'),
  guidance: z.string().describe('Actionable environmental advice without clinical diagnosis'),
  windowVentilation: z.enum(['seal_and_purify', 'brief_natural_ventilation', 'open']),
  citedFactIds: z.array(z.string()).describe('IDs of facts cited from the facts payload'),
});

export type HourlyRoutineItem = z.infer<typeof HourlyRoutineItemSchema>;

export const RecommendationItemSchema = z.object({
  id: z.string(),
  category: z.enum(['routine', 'indoor', 'commute', 'purifier', 'advisory']),
  title: z.string(),
  summary: z.string(),
  urgency: z.enum(['low', 'moderate', 'critical']),
  action: z.string().describe('Concrete action step for the household'),
  citedFactIds: z.array(z.string()),
});

export type RecommendationItem = z.infer<typeof RecommendationItemSchema>;

export const GeminiPlanResponseSchema = z.object({
  summary: z.string().describe('High-level executive air quality briefing citing facts'),
  dailyDecisionScoreCommentary: z.string().describe('Action evaluation commentary based solely on calculated household choices'),
  hourlyRoutine: z.array(HourlyRoutineItemSchema).min(3).max(8),
  recommendations: z.array(RecommendationItemSchema).min(2).max(6),
  cleanAirWindow: z.object({
    startHour: z.string().describe('e.g. "13:00"'),
    endHour: z.string().describe('e.g. "16:00"'),
    reason: z.string(),
    citedFactIds: z.array(z.string()),
  }),
  disclaimer: z.string().describe('Health guidance disclaimer stating this is environmental decision support, not diagnosis'),
});

export type GeminiPlanResponse = z.infer<typeof GeminiPlanResponseSchema>;
