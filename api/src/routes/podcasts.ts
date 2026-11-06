import { Router } from 'express';
import { listPodcasts, getPodcast } from '../db';

const router = Router();

// GET /api/podcasts?q=&category=&platform=&limit=&offset=
router.get('/', (req, res) => {
  const { q, category, platform, limit, offset } = req.query;
  const results = listPodcasts({
    q:        typeof q        === 'string' ? q        : undefined,
    category: typeof category === 'string' ? category : undefined,
    platform: typeof platform === 'string' ? platform : undefined,
    limit:    limit  ? parseInt(limit  as string, 10) : 50,
    offset:   offset ? parseInt(offset as string, 10) : 0,
  });
  res.json({ data: results, count: results.length });
});

// GET /api/podcasts/:id
router.get('/:id', (req, res) => {
  const pod = getPodcast(req.params.id);
  if (!pod) return res.status(404).json({ error: 'Not found' });
  return res.json(pod);
});

export default router;
