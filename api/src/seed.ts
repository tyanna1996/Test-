/**
 * Seed script — populates the SQLite database.
 *
 * Run:  npm run seed
 *
 * Strategy:
 *  1. Insert platforms, static podcast + audiobook records (always works, no network).
 *  2. For each podcast, call iTunes Search API to fetch the real Apple ID + artwork.
 *  3. For each audiobook, call AudNexus API to fetch the Audible ASIN, narrator, runtime.
 *  4. Steps 2-3 fail gracefully — static data is kept if network is unavailable.
 */

import Database from 'better-sqlite3';
import path from 'path';
import { searchPodcasts, searchAudiobooks } from './sources/itunes';
import { lookupByAsin, KNOWN_ASINS } from './sources/audnexus';

const DB_PATH = process.env.DATABASE_PATH ?? path.join(__dirname, '../../audify.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema (idempotent) ───────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS platforms (
    id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, color TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('podcast','audiobook','both'))
  );
  CREATE TABLE IF NOT EXISTS podcasts (
    id TEXT PRIMARY KEY, apple_id INTEGER UNIQUE,
    title TEXT NOT NULL, author TEXT NOT NULL, category TEXT NOT NULL,
    image_url TEXT, description TEXT, badge TEXT NOT NULL DEFAULT 'FREE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS audiobooks (
    id TEXT PRIMARY KEY, apple_id INTEGER UNIQUE, asin TEXT UNIQUE,
    title TEXT NOT NULL, author TEXT NOT NULL, narrator TEXT,
    category TEXT NOT NULL, image_url TEXT, description TEXT,
    runtime_minutes INTEGER, badge TEXT NOT NULL DEFAULT 'FREE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS podcast_platforms (
    podcast_id TEXT NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
    platform_id TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
    PRIMARY KEY (podcast_id, platform_id)
  );
  CREATE TABLE IF NOT EXISTS audiobook_platforms (
    audiobook_id TEXT NOT NULL REFERENCES audiobooks(id) ON DELETE CASCADE,
    platform_id TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
    PRIMARY KEY (audiobook_id, platform_id)
  );
  CREATE INDEX IF NOT EXISTS idx_podcasts_category   ON podcasts(category);
  CREATE INDEX IF NOT EXISTS idx_audiobooks_category ON audiobooks(category);
`);

// ── Platforms ─────────────────────────────────────────────────────────────────
const PLATFORMS = [
  { id: 'spotify',        name: 'Spotify',        color: '#1DB954', type: 'both'      },
  { id: 'apple-podcasts', name: 'Apple Podcasts',  color: '#FC3C44', type: 'podcast'   },
  { id: 'audible',        name: 'Audible',         color: '#F59E0B', type: 'audiobook' },
  { id: 'storytel',       name: 'Storytel',        color: '#8B5CF6', type: 'audiobook' },
  { id: 'amazon-music',   name: 'Amazon Music',    color: '#00A8E1', type: 'both'      },
  { id: 'podimo',         name: 'Podimo',          color: '#EF4444', type: 'podcast'   },
  { id: 'libro-fm',       name: 'Libro.fm',        color: '#D97706', type: 'audiobook' },
];
const insertPlatform = db.prepare(
  'INSERT OR IGNORE INTO platforms (id,name,color,type) VALUES (?,?,?,?)'
);
for (const p of PLATFORMS) insertPlatform.run(p.id, p.name, p.color, p.type);
console.log(`✓ Platforms (${PLATFORMS.length})`);

// ── Static podcast records ────────────────────────────────────────────────────
// Source: Apple Podcasts 2025 year-end charts + Edison Research Q4 2025 US reach
const PODCASTS = [
  { id:'crime-junkie',       title:'Crime Junkie',                   author:'audiochuck',                      category:'True Crime', badge:'TRENDING', platforms:['apple-podcasts','spotify','amazon-music'], image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/f3/de/6d/f3de6d4e-e6e1-440b-b3f3-9f1b37f3d0d1/mza_5260484491791012706.jpeg/600x600bb.jpg', description:'No-nonsense true crime weekly. Every Monday, a new case you have to know about.' },
  { id:'serial',             title:'Serial',                         author:'This American Life / WBEZ',        category:'True Crime', badge:'FREE',     platforms:['apple-podcasts','spotify','amazon-music'], image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/85/c6/9d/85c69d0c-6d5b-5cd5-c038-4a3f1a8f5e72/mza_8671785891099897702.jpeg/600x600bb.jpg', description:'The original investigative journalism podcast. One story told week by week.' },
  { id:'dateline-nbc',       title:'Dateline NBC',                   author:'NBCUniversal News Group',          category:'True Crime', badge:'TRENDING', platforms:['apple-podcasts','spotify','amazon-music'], image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/08/d3/06/08d306ad-df60-7c5f-6888-21f2bb4cab12/mza_8249673428065025523.jpeg/600x600bb.jpg', description:"NBC's longest-running newsmagazine. Classic reporting on crime and justice." },
  { id:'morbid',             title:'Morbid',                         author:'Morbid Network | Wondery',         category:'True Crime', badge:'FREE',     platforms:['apple-podcasts','spotify','amazon-music'], image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/8c/51/8c/8c518c8b-1e09-19bf-cbf7-6de4f1a4c6b0/mza_14001393701505449571.jpeg/600x600bb.jpg', description:'A true crime and all things spooky podcast with a wicked sense of humour.' },
  { id:'the-daily',         title:'The Daily',                      author:'The New York Times',               category:'News',      badge:'TRENDING', platforms:['apple-podcasts','spotify','amazon-music'], image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/e3/cd/90/e3cd9020-4027-be43-9b3d-8ea72a0fbab8/mza_6346736052854145720.jpeg/600x600bb.jpg', description:'The biggest stories of our time, with Michael Barbaro. 20 minutes every weekday.' },
  { id:'up-first',           title:'Up First',                       author:'NPR',                              category:'News',      badge:'FREE',     platforms:['apple-podcasts','spotify','amazon-music'], image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/27/01/8f/27018f9e-1a0e-7e98-56be-c5f1d57cddfd/mza_17264546665325616613.jpeg/600x600bb.jpg', description:"NPR's morning news in 10 minutes or less. Available before you get to work." },
  { id:'pod-save-america',   title:'Pod Save America',               author:'Crooked Media',                    category:'News',      badge:'FREE',     platforms:['apple-podcasts','spotify'],                image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/35/37/a9/3537a9db-45eb-9c79-0d9d-1f0e3f2ee394/mza_12152388754264413527.jpeg/600x600bb.jpg', description:'Four former Obama aides talking politics without the BS.' },
  { id:'mel-robbins',        title:'The Mel Robbins Podcast',        author:'Mel Robbins',                      category:'Business',  badge:'TRENDING', platforms:['apple-podcasts','spotify','amazon-music'], image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/d8/8e/f8/d88ef8a7-1764-6e7f-6e8e-c48de3bb5c0e/mza_12654765406497609432.jpeg/600x600bb.jpg', description:'Actionable advice on motivation, habits, and personal growth.' },
  { id:'how-i-built-this',   title:'How I Built This',               author:'Guy Raz / NPR',                    category:'Business',  badge:'FREE',     platforms:['apple-podcasts','spotify','amazon-music'], image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/16/42/c0/1642c03c-9456-78db-32e0-13843edea76b/mza_8818028394726124578.jpeg/600x600bb.jpg', description:'The stories behind the most iconic companies and the people who built them.' },
  { id:'diary-of-a-ceo',    title:'The Diary of a CEO',             author:'Steven Bartlett',                  category:'Business',  badge:'TRENDING', platforms:['apple-podcasts','spotify','amazon-music'], image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/f1/b2/44/f1b244de-0a84-aad4-7d57-4ba38aeb5063/mza_15756019609447027.jpeg/600x600bb.jpg', description:"No-filter conversations with the world's most successful business leaders." },
  { id:'hardcore-history',   title:'Hardcore History',               author:'Dan Carlin',                       category:'History',   badge:'FREE',     platforms:['apple-podcasts','spotify','amazon-music'], image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/68/8e/5a/688e5a61-25b2-6700-a2e9-cee33cff78ec/mza_11781750741965673434.jpeg/600x600bb.jpg', description:"Monumental history told in Dan Carlin's singular, deeply researched style." },
  { id:'revolutions',        title:'Revolutions',                    author:'Mike Duncan',                      category:'History',   badge:'FREE',     platforms:['apple-podcasts','spotify'],                image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts122/v4/5f/0d/5b/5f0d5b7c-1b41-7b8b-7f28-7f4ffe3d8bd2/mza_6730565803893289929.jpeg/600x600bb.jpg', description:'An exploration of the great political revolutions that have shaped our world.' },
  { id:'joe-rogan',          title:'The Joe Rogan Experience',       author:'Joe Rogan',                        category:'Culture',   badge:'TRENDING', platforms:['apple-podcasts','spotify','amazon-music'], image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/9e/db/5c/9edb5c74-3ed4-61e5-e8d2-26f18fc47f3a/mza_8588849462545484491.jpeg/600x600bb.jpg', description:'#1 podcast in the world. Long-form conversations with comedians, athletes, scientists and thinkers.' },
  { id:'smartless',          title:'SmartLess',                      author:'Jason Bateman, Sean Hayes, Will Arnett', category:'Culture', badge:'TRENDING', platforms:['apple-podcasts','spotify','amazon-music'], image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/07/ac/dc/07acdc20-5892-4a76-a386-15e3867e7cbe/mza_7897700440753636613.jpeg/600x600bb.jpg', description:'Three A-list comedians surprise each other with a mystery celebrity guest each episode.' },
  { id:'conan-needs-a-friend', title:"Conan O'Brien Needs a Friend", author:'Team Coco & SiriusXM',            category:'Culture',   badge:'FREE',     platforms:['apple-podcasts','spotify','amazon-music'], image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/f7/39/db/f739db73-23e6-6a4f-a9c2-a26c78ba39a4/mza_14451754665561700038.jpeg/600x600bb.jpg', description:'After 25 years Conan realises he has no friends. His podcast is the journey to fix that.' },
  { id:'call-her-daddy',     title:'Call Her Daddy',                 author:'Alex Cooper / Unwell Network',     category:'Culture',   badge:'TRENDING', platforms:['apple-podcasts','spotify','amazon-music'], image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/c9/0d/f2/c90df212-5b13-14e1-28ba-db5f9d8bbcea/mza_16697200085282085506.jpeg/600x600bb.jpg', description:'The No. 1 podcast for women — raw, unfiltered conversations about life, sex and culture.' },
  { id:'99pi',               title:'99% Invisible',                  author:'Roman Mars',                       category:'Design',    badge:'FREE',     platforms:['apple-podcasts','spotify','amazon-music'], image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/d2/5c/26/d25c2654-b050-24f9-5b96-33db1a3c8c86/mza_7580960052898468882.jpeg/600x600bb.jpg', description:"A show about all the thought that goes into the things we don't think about." },
];

const upsertPodcast = db.prepare(`
  INSERT INTO podcasts (id,title,author,category,image_url,description,badge)
  VALUES (?,?,?,?,?,?,?)
  ON CONFLICT(id) DO UPDATE SET
    title=excluded.title, author=excluded.author, category=excluded.category,
    image_url=COALESCE(excluded.image_url, image_url),
    description=COALESCE(excluded.description, description),
    badge=excluded.badge, updated_at=CURRENT_TIMESTAMP
`);
const upsertPodPlatform = db.prepare(
  'INSERT OR IGNORE INTO podcast_platforms (podcast_id,platform_id) VALUES (?,?)'
);

for (const p of PODCASTS) {
  upsertPodcast.run(p.id, p.title, p.author, p.category, p.image, p.description, p.badge);
  for (const pid of p.platforms) upsertPodPlatform.run(p.id, pid);
}
console.log(`✓ Podcasts (${PODCASTS.length})`);

// ── Static audiobook records ──────────────────────────────────────────────────
// Source: Audible 2025 Audiobook of the Year, NYPL 2025, Audible editors' lists
const AUDIOBOOKS = [
  { id:'atmosphere',   title:'Atmosphere',                        author:'Taylor Jenkins Reid', narrator:'Kristen DiMercurio & Julia Whelan', category:'Fiction',   badge:'AWARD',   runtime_minutes:842,  platforms:['audible','spotify'],                           image:'https://covers.openlibrary.org/b/isbn/0593448553-L.jpg',  description:"Audible's Audiobook of the Year 2025. A stunning novel about the first woman in space." },
  { id:'james',        title:'James',                             author:'Percival Everett',    narrator:'Dominic Hoffman',                   category:'Fiction',   badge:'AWARD',   runtime_minutes:591,  platforms:['audible','storytel','spotify'],                 image:'https://covers.openlibrary.org/b/isbn/0385550367-L.jpg',  description:"NYPL's most-borrowed audiobook of 2025. A radical reimagining of Huckleberry Finn." },
  { id:'atomic-habits',title:'Atomic Habits',                     author:'James Clear',         narrator:'James Clear',                       category:'Self-Help', badge:'TRENDING',runtime_minutes:335,  platforms:['audible','storytel','spotify','libro-fm'],      image:'https://covers.openlibrary.org/b/isbn/0735211299-L.jpg',  description:'The definitive guide to building good habits and breaking bad ones, backed by science.' },
  { id:'sapiens',      title:'Sapiens: A Brief History of Humankind', author:'Yuval Noah Harari', narrator:'Derek Perkins',                   category:'History',   badge:'FREE',    runtime_minutes:917,  platforms:['audible','storytel','spotify'],                 image:'https://covers.openlibrary.org/b/isbn/0062316117-L.jpg',  description:"A sweeping narrative that challenges everything we thought we knew about humanity's origins." },
  { id:'educated',     title:'Educated',                          author:'Tara Westover',       narrator:'Julia Whelan',                      category:'Biography', badge:'TRENDING',runtime_minutes:730,  platforms:['audible','storytel','spotify','libro-fm'],      image:'https://covers.openlibrary.org/b/isbn/0399590501-L.jpg',  description:'A memoir about a woman who grew up in a survivalist family and educated herself into Cambridge.' },
  { id:'becoming',     title:'Becoming',                          author:'Michelle Obama',      narrator:'Michelle Obama',                    category:'Biography', badge:'FREE',    runtime_minutes:1143, platforms:['audible','storytel','spotify'],                 image:'https://covers.openlibrary.org/b/isbn/1524763136-L.jpg',  description:'A deeply personal memoir by the former First Lady, narrated in her own voice.' },
  { id:'born-a-crime', title:'Born a Crime',                      author:'Trevor Noah',         narrator:'Trevor Noah',                       category:'Biography', badge:'TRENDING',runtime_minutes:524,  platforms:['audible','storytel','spotify','libro-fm'],      image:'https://covers.openlibrary.org/b/isbn/0399588191-L.jpg',  description:'Stories from a South African childhood under apartheid, told with humour and heart.' },
  { id:'thinking-fast-and-slow', title:'Thinking, Fast and Slow', author:'Daniel Kahneman',    narrator:'Patrick Egan',                      category:'Science',   badge:'FREE',    runtime_minutes:1202, platforms:['audible','storytel'],                           image:'https://covers.openlibrary.org/b/isbn/0374533555-L.jpg',  description:'A Nobel laureate explores the two systems that shape our judgements and choices.' },
  { id:'dune',         title:'Dune',                              author:'Frank Herbert',       narrator:'Scott Brick, Orlagh Cassidy, et al.', category:'Fiction', badge:'TRENDING',runtime_minutes:1262, platforms:['audible','storytel','spotify'],                 image:'https://covers.openlibrary.org/b/isbn/0441013597-L.jpg',  description:'The greatest science-fiction novel ever written. A fully cast performance edition.' },
  { id:'the-alchemist',title:'The Alchemist',                     author:'Paulo Coelho',        narrator:'Jeremy Irons',                      category:'Fiction',   badge:'FREE',    runtime_minutes:261,  platforms:['audible','storytel','spotify'],                 image:'https://covers.openlibrary.org/b/isbn/0062315007-L.jpg',  description:'A fable about a young shepherd following his dreams across the Sahara to the pyramids.' },
  { id:'48-laws',      title:'The 48 Laws of Power',              author:'Robert Greene',       narrator:'Richard Poe',                       category:'Business',  badge:'FREE',    runtime_minutes:1450, platforms:['audible','storytel'],                           image:'https://covers.openlibrary.org/b/isbn/0670881465-L.jpg',  description:'Distilled from 3,000 years of history — the definitive guide to power and influence.' },
  { id:'maybe-you-should-talk-to-someone', title:'Maybe You Should Talk to Someone', author:'Lori Gottlieb', narrator:'Brittany Pressley', category:'Self-Help', badge:'NEW', runtime_minutes:855, platforms:['audible','storytel','spotify','libro-fm'], image:'https://covers.openlibrary.org/b/isbn/1328662055-L.jpg', description:'A therapist goes to therapy — a candid, funny look at what it means to be human.' },
];

const upsertBook = db.prepare(`
  INSERT INTO audiobooks (id,title,author,narrator,category,image_url,description,runtime_minutes,badge)
  VALUES (?,?,?,?,?,?,?,?,?)
  ON CONFLICT(id) DO UPDATE SET
    title=excluded.title, author=excluded.author, narrator=COALESCE(excluded.narrator, narrator),
    category=excluded.category,
    image_url=COALESCE(excluded.image_url, image_url),
    description=COALESCE(excluded.description, description),
    runtime_minutes=COALESCE(excluded.runtime_minutes, runtime_minutes),
    badge=excluded.badge, updated_at=CURRENT_TIMESTAMP
`);
const upsertBookPlatform = db.prepare(
  'INSERT OR IGNORE INTO audiobook_platforms (audiobook_id,platform_id) VALUES (?,?)'
);

for (const b of AUDIOBOOKS) {
  upsertBook.run(b.id, b.title, b.author, b.narrator, b.category, b.image, b.description, b.runtime_minutes, b.badge);
  for (const pid of b.platforms) upsertBookPlatform.run(b.id, pid);
}
console.log(`✓ Audiobooks (${AUDIOBOOKS.length})`);

// ── Enrich from iTunes API (requires open network) ────────────────────────────
console.log('\nEnriching from iTunes API (requires open network)…');
async function enrichFromItunes() {
  let updated = 0;
  const updateAppleId = db.prepare(
    'UPDATE podcasts SET apple_id=?, image_url=COALESCE(?,image_url), updated_at=CURRENT_TIMESTAMP WHERE id=?'
  );
  for (const pod of PODCASTS) {
    try {
      const results = await searchPodcasts(pod.title, 3);
      const match = results.find(r =>
        r.trackName.toLowerCase().includes(pod.title.toLowerCase().split(':')[0].trim().toLowerCase()) ||
        r.artistName.toLowerCase().includes(pod.author.toLowerCase().split('/')[0].trim().toLowerCase())
      );
      if (match) {
        updateAppleId.run(match.trackId, match.artworkUrl600, pod.id);
        updated++;
        console.log(`  ✓ iTunes match: ${pod.title} → ID ${match.trackId}`);
      }
    } catch (e) {
      // Network unavailable — skip gracefully
    }
    await sleep(400); // 400ms between requests to stay within rate limits
  }
  console.log(`✓ iTunes enrichment: ${updated}/${PODCASTS.length} podcasts updated`);
}

// ── Enrich from AudNexus API (requires open network) ─────────────────────────
async function enrichFromAudnexus() {
  let updated = 0;
  const updateAsin = db.prepare(
    'UPDATE audiobooks SET asin=?, narrator=COALESCE(?,narrator), runtime_minutes=COALESCE(?,runtime_minutes), image_url=COALESCE(?,image_url), updated_at=CURRENT_TIMESTAMP WHERE id=?'
  );
  for (const book of AUDIOBOOKS) {
    const asin = KNOWN_ASINS[book.id];
    if (!asin) continue;
    try {
      const data = await lookupByAsin(asin);
      if (data) {
        const narrator = data.narrators.map(n => n.name).join(', ') || null;
        updateAsin.run(asin, narrator, data.runtimeLengthMin, data.image, book.id);
        updated++;
        console.log(`  ✓ AudNexus match: ${book.title} → ASIN ${asin}`);
      }
    } catch {
      // Network unavailable — skip gracefully
    }
    await sleep(1100); // 1.1s between requests to respect rate limit
  }
  console.log(`✓ AudNexus enrichment: ${updated}/${AUDIOBOOKS.length} audiobooks updated`);
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

enrichFromItunes()
  .then(() => enrichFromAudnexus())
  .then(() => {
    const podCount  = (db.prepare('SELECT COUNT(*) AS n FROM podcasts').get() as { n: number }).n;
    const bookCount = (db.prepare('SELECT COUNT(*) AS n FROM audiobooks').get() as { n: number }).n;
    console.log(`\n✅ Database ready: ${podCount} podcasts, ${bookCount} audiobooks`);
    db.close();
  });
