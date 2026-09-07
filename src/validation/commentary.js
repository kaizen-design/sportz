import { z } from 'zod';

// Query schema: optional limit coerced to positive integer, max 100
export const listCommentaryQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// Create commentary schema
export const createCommentarySchema = z.object({
  minute: z.coerce.number().int().min(0, { message: 'minute must be non-negative' }),
  sequence: z.coerce.number().int(),
  period: z.string(),
  eventType: z.unknown().optional(),
  actor: z.unknown().optional(),
  team: z.unknown().optional(),
  message: z.string().trim().min(1, { message: 'message is required' }),
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
});
