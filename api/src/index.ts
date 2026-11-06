import express from 'express';
import cors from 'cors';
import podcastsRouter   from './routes/podcasts';
import audiobooksRouter from './routes/audiobooks';
import platformsRouter  from './routes/platforms';
import { listPodcasts, listAudiobooks } from './db';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
  .split(',').map(s => s.trim());

const app = express();
app.use(cors({ origin: ALLOWED_ORIGINS, optionsSuccessStatus: 200 }));
app.use(express.json());

app.use('/api/podcasts',   podcastsRouter);
app.use('/api/audiobooks', audiobooksRouter);
app.use('/api/platforms',  platformsRouter);

// Combined search
app.get('/api/search', (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  if (!q) return res.json({ podcasts: [], audiobooks: [] });
  return res.json({
    podcasts:   listPodcasts({ q, limit: 10 }),
    audiobooks: listAudiobooks({ q, limit: 10 }),
  });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Audify API running on http://localhost:${PORT}`);
});
