import { z } from 'zod';

// Match status constant (values in lowercase)
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

// Helper: ISO 8601 (UTC) date-time with optional fractional seconds, e.g. 2023-01-01T12:00:00Z or 2023-01-01T12:00:00.123Z
const isoUtcRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const isValidIsoString = (s) => typeof s === 'string' && isoUtcRegex.test(s) && !Number.isNaN(Date.parse(s));

// Query schema: optional limit coerced to positive integer, max 100
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// Params schema: required id coerced to positive integer
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Create match schema
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, { message: 'sport is required' }).transform((s) => s.trim()),
    homeTeam: z.string().min(1, { message: 'homeTeam is required' }).transform((s) => s.trim()),
    awayTeam: z.string().min(1, { message: 'awayTeam is required' }).transform((s) => s.trim()),
    startTime: z.string().refine(isValidIsoString, { message: 'startTime must be a valid ISO UTC datetime string' }),
    endTime: z.string().refine(isValidIsoString, { message: 'endTime must be a valid ISO UTC datetime string' }),
    homeScore: z.coerce.number().int().min(0).optional(),
    awayScore: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    const start = Date.parse(data.startTime);
    const end = Date.parse(data.endTime);
    if (Number.isNaN(start)) {
      ctx.addIssue({ path: ['startTime'], code: z.ZodIssueCode.custom, message: 'startTime is not a valid date' });
      return;
    }
    if (Number.isNaN(end)) {
      ctx.addIssue({ path: ['endTime'], code: z.ZodIssueCode.custom, message: 'endTime is not a valid date' });
      return;
    }
    if (end <= start) {
      ctx.addIssue({ path: ['endTime'], code: z.ZodIssueCode.custom, message: 'endTime must be after startTime' });
    }
  });

// Update score schema: requires homeScore and awayScore as coerced non-negative integers
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),
});
