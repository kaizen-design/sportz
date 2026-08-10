import { z } from 'zod';

// Match status constant (values in lowercase)
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

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
    sport: z.string().trim().min(1, { error: 'sport is required' }),
    homeTeam: z.string().trim().min(1, { error: 'homeTeam is required' }),
    awayTeam: z.string().trim().min(1, { error: 'awayTeam is required' }),
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime(),
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
