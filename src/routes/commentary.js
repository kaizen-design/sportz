import { Router } from 'express';
import { createCommentarySchema, listCommentaryQuerySchema } from '../validation/commentary.js';
import { matchIdParamSchema } from '../validation/matches.js';
import { db } from '../db/db.js';
import { commentary } from '../db/schema.js';
import { desc, eq } from 'drizzle-orm';

export const commentaryRouter = new Router({ mergeParams: true });

const MAX_LIMIT = 100;

commentaryRouter.get('/', async (req, res) => {
  const paramsParsed = matchIdParamSchema.safeParse(req.params);

  if (!paramsParsed.success) {
    return res.status(400).json({ error: 'Invalid match ID.', details: JSON.stringify(paramsParsed.error) });
  }

  const queryParsed = listCommentaryQuerySchema.safeParse(req.query);

  if (!queryParsed.success) {
    return res.status(400).json({ error: 'Invalid query.', details: JSON.stringify(queryParsed.error) });
  }

  const limit = Math.min(queryParsed.data.limit ?? 100, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, paramsParsed.data.id))
      .orderBy(desc(commentary.createdAt))
      .limit(limit);

    res.status(200).json({ data });
  } catch (e) {
    res.status(500).json({ error: 'Failed to list commentary.', details: JSON.stringify(e) });
  }
});

commentaryRouter.post('/', async (req, res) => {
  const paramsParsed = matchIdParamSchema.safeParse(req.params);

  if (!paramsParsed.success) {
    return res.status(400).json({ error: 'Invalid match ID.', details: JSON.stringify(paramsParsed.error) });
  }

  const bodyParsed = createCommentarySchema.safeParse(req.body);

  if (!bodyParsed.success) {
    return res.status(400).json({ error: 'Invalid payload.', details: JSON.stringify(bodyParsed.error) });
  }

  try {
    const [event] = await db
      .insert(commentary)
      .values({
        matchId: paramsParsed.data.id,
        ...bodyParsed.data,
      })
      .returning();

    res.status(201).json({ data: event });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create commentary.', details: JSON.stringify(e) });
  }
});