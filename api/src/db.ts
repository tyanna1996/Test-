import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH ?? path.join(__dirname, '../../audify.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS platforms (
      id   TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('podcast','audiobook','both'))
    );

    CREATE TABLE IF NOT EXISTS podcasts (
      id          TEXT PRIMARY KEY,
      apple_id    INTEGER UNIQUE,
      title       TEXT NOT NULL,
      author      TEXT NOT NULL,
      category    TEXT NOT NULL,
      image_url   TEXT,
      description TEXT,
      badge       TEXT NOT NULL DEFAULT 'FREE',
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audiobooks (
      id               TEXT PRIMARY KEY,
      apple_id         INTEGER UNIQUE,
      asin             TEXT UNIQUE,
      title            TEXT NOT NULL,
      author           TEXT NOT NULL,
      narrator         TEXT,
      category         TEXT NOT NULL,
      image_url        TEXT,
      description      TEXT,
      runtime_minutes  INTEGER,
      badge            TEXT NOT NULL DEFAULT 'FREE',
      created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS podcast_platforms (
      podcast_id  TEXT NOT NULL REFERENCES podcasts(id)  ON DELETE CASCADE,
      platform_id TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
      PRIMARY KEY (podcast_id, platform_id)
    );

    CREATE TABLE IF NOT EXISTS audiobook_platforms (
      audiobook_id TEXT NOT NULL REFERENCES audiobooks(id) ON DELETE CASCADE,
      platform_id  TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
      PRIMARY KEY (audiobook_id, platform_id)
    );

    CREATE INDEX IF NOT EXISTS idx_podcasts_category   ON podcasts(category);
    CREATE INDEX IF NOT EXISTS idx_audiobooks_category ON audiobooks(category);
  `);
}

// ── Typed query helpers ───────────────────────────────────────────────────────

export interface PodcastRow {
  id: string; apple_id: number | null; title: string; author: string;
  category: string; image_url: string | null; description: string | null;
  badge: string; platforms: string;
}

export interface AudiobookRow {
  id: string; apple_id: number | null; asin: string | null;
  title: string; author: string; narrator: string | null;
  category: string; image_url: string | null; description: string | null;
  runtime_minutes: number | null; badge: string; platforms: string;
}

const PODCAST_SELECT = `
  SELECT p.*,
    GROUP_CONCAT(pl.name, '||') AS platforms
  FROM podcasts p
  LEFT JOIN podcast_platforms pp ON pp.podcast_id = p.id
  LEFT JOIN platforms pl ON pl.id = pp.platform_id
`;

const AUDIOBOOK_SELECT = `
  SELECT a.*,
    GROUP_CONCAT(pl.name, '||') AS platforms
  FROM audiobooks a
  LEFT JOIN audiobook_platforms ap ON ap.audiobook_id = a.id
  LEFT JOIN platforms pl ON pl.id = ap.platform_id
`;

export function listPodcasts(opts: { q?: string; category?: string; platform?: string; limit?: number; offset?: number }) {
  const db = getDb();
  const { q, category, platform, limit = 50, offset = 0 } = opts;
  const wheres: string[] = [];
  const params: unknown[] = [];

  if (q)        { wheres.push("(p.title LIKE ? OR p.author LIKE ?)"); params.push(`%${q}%`, `%${q}%`); }
  if (category) { wheres.push("p.category = ?"); params.push(category); }
  if (platform) { wheres.push("EXISTS (SELECT 1 FROM podcast_platforms pp2 JOIN platforms pl2 ON pl2.id=pp2.platform_id WHERE pp2.podcast_id=p.id AND pl2.name=?)"); params.push(platform); }

  const where = wheres.length ? `WHERE ${wheres.join(' AND ')}` : '';
  const sql = `${PODCAST_SELECT} ${where} GROUP BY p.id ORDER BY p.title LIMIT ? OFFSET ?`;
  return (db.prepare(sql).all([...params, limit, offset]) as PodcastRow[]).map(formatPodcast);
}

export function getPodcast(id: string) {
  const db = getDb();
  const row = db.prepare(`${PODCAST_SELECT} WHERE p.id=? GROUP BY p.id`).get(id) as PodcastRow | undefined;
  return row ? formatPodcast(row) : null;
}

export function listAudiobooks(opts: { q?: string; category?: string; platform?: string; limit?: number; offset?: number }) {
  const db = getDb();
  const { q, category, platform, limit = 50, offset = 0 } = opts;
  const wheres: string[] = [];
  const params: unknown[] = [];

  if (q)        { wheres.push("(a.title LIKE ? OR a.author LIKE ?)"); params.push(`%${q}%`, `%${q}%`); }
  if (category) { wheres.push("a.category = ?"); params.push(category); }
  if (platform) { wheres.push("EXISTS (SELECT 1 FROM audiobook_platforms ap2 JOIN platforms pl2 ON pl2.id=ap2.platform_id WHERE ap2.audiobook_id=a.id AND pl2.name=?)"); params.push(platform); }

  const where = wheres.length ? `WHERE ${wheres.join(' AND ')}` : '';
  const sql = `${AUDIOBOOK_SELECT} ${where} GROUP BY a.id ORDER BY a.title LIMIT ? OFFSET ?`;
  return (db.prepare(sql).all([...params, limit, offset]) as AudiobookRow[]).map(formatAudiobook);
}

export function getAudiobook(id: string) {
  const db = getDb();
  const row = db.prepare(`${AUDIOBOOK_SELECT} WHERE a.id=? GROUP BY a.id`).get(id) as AudiobookRow | undefined;
  return row ? formatAudiobook(row) : null;
}

export function listPlatforms() {
  return getDb().prepare('SELECT * FROM platforms ORDER BY name').all();
}

function formatPodcast(row: PodcastRow) {
  return { ...row, platforms: row.platforms ? row.platforms.split('||') : [] };
}
function formatAudiobook(row: AudiobookRow) {
  return { ...row, platforms: row.platforms ? row.platforms.split('||') : [] };
}
