import { Router } from 'express';
import { listPlatforms } from '../db';

const router = Router();

// GET /api/platforms
router.get('/', (_req, res) => {
  res.json(listPlatforms());
});

export default router;
