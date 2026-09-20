import { useState, useMemo, useEffect } from 'react';
import { Search, X, Star, Check, Play, ChevronRight, Headphones, Radio } from 'lucide-react';

/* ── Types ────────────────────────────────────────────── */
type ContentType = 'audiobook' | 'podcast';
type FilterTab   = 'all' | 'audiobooks' | 'podcasts' | 'free';

interface ContentItem {
  id:         string;
  title:      string;
  author:     string;
  type:       ContentType;
  genre:      string;
  coverColor: string;
  coverUrl?:  string;
  rating:     number;
  duration?:  string;
  episodes?:  number;
  year?:      number;
  description: string;
  platforms:  Record<string, boolean>;
  trending:   boolean;
}

/* ── Constants ────────────────────────────────────────── */
const ACTIVE_SUBS = new Set(['audible', 'storytel', 'spotify']);
const TRIAL_SUBS  = new Set(['podimo']);
const PLAT_ORDER  = ['audible', 'storytel', 'podimo', 'spotify'] as const;

const SVC: Record<string, { name: string; color: string }> = {
  audible:  { name: 'Audible',  color: '#f59e0b' },
  storytel: { name: 'Storytel', color: '#8b5cf6' },
  podimo:   { name: 'Podimo',   color: '#ef4444' },
  spotify:  { name: 'Spotify',  color: '#22c55e' },
};

const GENRE_STYLES: Record<string, { bg: string; color: string }> = {
  'Self-Help':  { bg: '#DCFFF8', color: '#00897B' },
  'Psychology': { bg: '#EDE9FE', color: '#6D28D9' },
  'History':    { bg: '#FEF3C7', color: '#B45309' },
  'True Crime': { bg: '#FEE2E2', color: '#B91C1C' },
  'News':       { bg: '#DBEAFE', color: '#1D4ED8' },
  'Memoir':     { bg: '#F3E8FF', color: '#7C3AED' },
  'Business':   { bg: '#DCFCE7', color: '#15803D' },
  'Technology': { bg: '#E0F2FE', color: '#0369A1' },
};

const SUGGESTIONS = ['Atomic Habits', 'Serial', 'Sapiens', 'Crime Junkie', 'Becoming'];

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all',        label: 'All' },
  { id: 'audiobooks', label: 'Audiobooks' },
  { id: 'podcasts',   label: 'Podcasts' },
  { id: 'free',       label: 'Free for you' },
];

/* ── Mock content ─────────────────────────────────────── */
const ALL_CONTENT: ContentItem[] = [
  {
    id: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear',
    type: 'audiobook', genre: 'Self-Help', coverColor: '#00d4aa',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/0735211299-L.jpg',
    rating: 4.8, duration: '5h 35m', year: 2018, trending: true,
    description: 'Tiny changes, remarkable results. Learn how building atomic habits can transform your life through the science of small improvements.',
    platforms: { audible: true, storytel: true, spotify: false, podimo: false },
  },
  {
    id: 'thinking-fast-slow', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman',
    type: 'audiobook', genre: 'Psychology', coverColor: '#3b82f6',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/0374533555-L.jpg',
    rating: 4.6, duration: '20h 2m', year: 2011, trending: true,
    description: 'Nobel laureate Daniel Kahneman reveals the two systems that drive the way we think — and how they shape our judgements and decisions.',
    platforms: { audible: true, storytel: true, spotify: false, podimo: false },
  },
  {
    id: 'sapiens', title: 'Sapiens', author: 'Yuval Noah Harari',
    type: 'audiobook', genre: 'History', coverColor: '#f59e0b',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/0062316095-L.jpg',
    rating: 4.7, duration: '15h 17m', year: 2011, trending: true,
    description: 'A brief history of humankind — from the Stone Age to the present, exploring how biology and history have defined us.',
    platforms: { audible: true, storytel: true, spotify: false, podimo: true },
  },
  {
    id: 'educated', title: 'Educated', author: 'Tara Westover',
    type: 'audiobook', genre: 'Memoir', coverColor: '#8b5cf6',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/0399590501-L.jpg',
    rating: 4.9, duration: '12h 11m', year: 2018, trending: false,
    description: 'A memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.',
    platforms: { audible: true, storytel: true, spotify: false, podimo: false },
  },
  {
    id: 'subtle-art', title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson',
    type: 'audiobook', genre: 'Self-Help', coverColor: '#ef4444',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/0062457713-L.jpg',
    rating: 4.3, duration: '5h 17m', year: 2016, trending: false,
    description: 'A counterintuitive approach to living a good life. Stop trying to be positive all the time — embrace the struggles that matter to you.',
    platforms: { audible: true, storytel: true, spotify: true, podimo: true },
  },
  {
    id: 'becoming', title: 'Becoming', author: 'Michelle Obama',
    type: 'audiobook', genre: 'Memoir', coverColor: '#ec4899',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/1524763136-L.jpg',
    rating: 4.8, duration: '19h 3m', year: 2018, trending: true,
    description: 'In her memoir, Michelle Obama invites readers into her world, chronicling the experiences from her childhood in Chicago to her years as First Lady.',
    platforms: { audible: true, storytel: true, spotify: true, podimo: false },
  },
  {
    id: 'power-of-now', title: 'The Power of Now', author: 'Eckhart Tolle',
    type: 'audiobook', genre: 'Self-Help', coverColor: '#84cc16',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/1577314808-L.jpg',
    rating: 4.4, duration: '7h 37m', year: 1997, trending: false,
    description: 'A guide to spiritual enlightenment. Tolle teaches that living in the present moment is the key to true happiness and overcoming pain.',
    platforms: { audible: true, storytel: false, spotify: false, podimo: false },
  },
  {
    id: 'serial', title: 'Serial', author: 'Sarah Koenig',
    type: 'podcast', genre: 'True Crime', coverColor: '#ef4444',
    rating: 4.9, episodes: 52, trending: true,
    description: 'Serial unfolds one story over the course of a season — journalism told week by week. Season 1 reinvestigated the 1999 murder of Baltimore teenager Hae Min Lee.',
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'the-daily', title: 'The Daily', author: 'The New York Times',
    type: 'podcast', genre: 'News', coverColor: '#3b82f6',
    rating: 4.6, episodes: 2100, trending: true,
    description: 'This is what the news should sound like. 20 minutes every morning. Hosted by Michael Barbaro. From The New York Times.',
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'crime-junkie', title: 'Crime Junkie', author: 'audiochuck',
    type: 'podcast', genre: 'True Crime', coverColor: '#dc2626',
    rating: 4.7, episodes: 380, trending: false,
    description: 'Every Monday, Ashley Flowers and Brit Prawat dive into a new crime case with facts only, zero fluff — in an easy-to-digest format.',
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'hardcore-history', title: 'Hardcore History', author: 'Dan Carlin',
    type: 'podcast', genre: 'History', coverColor: '#d97706',
    rating: 4.9, episodes: 67, trending: true,
    description: 'Dan Carlin takes his trademark "Martian" perspective to world history in a way that will turn average people into history fans.',
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'how-i-built-this', title: 'How I Built This', author: 'Guy Raz',
    type: 'podcast', genre: 'Business', coverColor: '#22c55e',
    rating: 4.7, episodes: 420, trending: false,
    description: 'Guy Raz dives into the stories behind the world\'s best-known companies. How I Built This weaves together a narrative journey about innovators and entrepreneurs.',
    platforms: { audible: false, storytel: false, spotify: true, podimo: false },
  },
  {
    id: 'lex-fridman', title: 'Lex Fridman Podcast', author: 'Lex Fridman',
    type: 'podcast', genre: 'Technology', coverColor: '#06b6d4',
    rating: 4.6, episodes: 430, trending: false,
    description: 'Conversations about AI, science, technology, history, philosophy and the nature of intelligence, consciousness, love, and power.',
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'missing-cryptoqueen', title: 'The Missing Cryptoqueen', author: 'BBC Podcasts',
    type: 'podcast', genre: 'True Crime', coverColor: '#a855f7',
    rating: 4.5, episodes: 27, trending: false,
    description: 'Dr Ruja Ignatova persuaded millions to invest in her cryptocurrency OneCoin. Then she disappeared. BBC journalist Jamie Bartlett investigates.',
    platforms: { audible: false, storytel: false, spotify: false, podimo: true },
  },
];

/* ── Helpers ──────────────────────────────────────────── */
function monogram(title: string): string {
  const w = title.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
  return w.length === 1 ? w[0][0].toUpperCase() : (w[0][0] + w[1][0]).toUpperCase();
}

function accessInfo(item: ContentItem) {
  const active = PLAT_ORDER.filter((id) => item.platforms[id] && ACTIVE_SUBS.has(id));
  const trial  = PLAT_ORDER.filter((id) => item.platforms[id] && TRIAL_SUBS.has(id));
  const free   = active.length > 0;
  const any    = free || trial.length > 0;
  return { active, trial, free, any };
}

/* ── Detail modal ─────────────────────────────────────── */
function DetailModal({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  const { trial, free } = accessInfo(item);
  const genre = GENRE_STYLES[item.genre] ?? { bg: '#F0FDF4', color: '#15803D' };
  const mono  = monogram(item.title);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: '#FFFFFF', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover area */}
        <div
          className="relative flex items-center justify-center"
          style={{ height: 220, background: `linear-gradient(150deg, ${item.coverColor}30, ${item.coverColor}10)` }}
        >
          {item.coverUrl && !imgFailed ? (
            <img
              src={item.coverUrl}
              alt={item.title}
              onError={() => setImgFailed(true)}
              style={{ height: 180, width: 'auto', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', objectFit: 'cover' }}
            />
          ) : (
            <div
              className="flex items-center justify-center font-black rounded-2xl"
              style={{
                width: 120, height: 160, fontSize: 56,
                background: `linear-gradient(150deg, ${item.coverColor}40, ${item.coverColor}15)`,
                color: item.coverColor, letterSpacing: '-0.04em',
                border: `2px solid ${item.coverColor}30`,
              }}
            >
              {mono}
            </div>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(0,0,0,0.12)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#444',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Info */}
        <div style={{ padding: '20px 24px 28px' }}>
          {/* Genre + type */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold" style={{ background: genre.bg, color: genre.color }}>
              {item.genre}
            </span>
            <span style={{ fontSize: 11, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
              {item.type === 'audiobook' ? <Headphones size={11} /> : <Radio size={11} />}
              {item.type === 'audiobook' ? 'Audiobook' : 'Podcast'}
            </span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0A0A0A', lineHeight: 1.2, marginBottom: 4 }}>
            {item.title}
          </h2>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>by {item.author}</p>

          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, fontSize: 13 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={13} fill="#F59E0B" style={{ color: '#F59E0B' }} />
              <strong style={{ color: '#0A0A0A' }}>{item.rating}</strong>
            </span>
            {item.duration && <span style={{ color: '#9CA3AF' }}>{item.duration}</span>}
            {item.episodes != null && <span style={{ color: '#9CA3AF' }}>{item.episodes} episodes</span>}
            {item.year && <span style={{ color: '#9CA3AF' }}>{item.year}</span>}
          </div>

          {/* Description */}
          <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6, marginBottom: 18 }}>
            {item.description}
          </p>

          {/* Platform badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {PLAT_ORDER.map((id) => {
              const available = item.platforms[id];
              const isTrial   = TRIAL_SUBS.has(id);
              const meta      = SVC[id];
              if (!available) return null;
              return (
                <span
                  key={id}
                  style={{
                    fontSize: 12, fontWeight: 600,
                    padding: '5px 12px', borderRadius: 999,
                    background: meta.color + '18', color: meta.color,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  <Check size={10} />
                  {meta.name}{isTrial ? ' · trial' : ''}
                </span>
              );
            })}
          </div>

          {/* CTA */}
          <button
            style={{
              width: '100%', padding: '14px', borderRadius: 16,
              fontSize: 15, fontWeight: 800,
              background: free ? '#0A0AFF' : '#F3F4F6',
              color: free ? '#FFFFFF' : '#0A0A0A',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Play size={14} fill="currentColor" />
            {free ? 'Listen Free' : trial.length > 0 ? 'Try Free' : 'Not on your plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Content card ─────────────────────────────────────── */
function ContentCard({ item, onClick }: { item: ContentItem; onClick: () => void }) {
  const { free } = accessInfo(item);
  const genre    = GENRE_STYLES[item.genre] ?? { bg: '#F0FDF4', color: '#15803D' };
  const mono     = monogram(item.title);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <button
      onClick={onClick}
      className="poster-card group flex-shrink-0 cursor-pointer select-none text-left"
      style={{ width: 152, background: 'none', border: 'none', padding: 0, fontFamily: 'inherit' }}
      aria-label={`View details for ${item.title}`}
    >
      {/* Cover */}
      <div
        className="poster-cover relative rounded-2xl overflow-hidden"
        style={{
          aspectRatio: '2/3',
          background: `linear-gradient(150deg, ${item.coverColor}22 0%, ${item.coverColor}08 100%)`,
          border: '1.5px solid #EBEBEB',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          transition: 'box-shadow 200ms',
        }}
      >
        {/* Real cover image */}
        {item.coverUrl && !imgFailed ? (
          <img
            src={item.coverUrl}
            alt={item.title}
            onError={() => setImgFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <>
            {/* Color accent bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: item.coverColor }} />

            {/* Monogram watermark */}
            <div
              className="absolute inset-0 flex items-center justify-center font-black leading-none pointer-events-none"
              style={{ fontSize: 68, color: item.coverColor, opacity: 0.15, letterSpacing: '-0.04em' }}
              aria-hidden="true"
            >
              {mono}
            </div>

            {/* Genre + type icon */}
            <div className="absolute top-4 left-2.5 right-2.5 flex items-start justify-between z-10">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: genre.bg, color: genre.color }}>
                {item.genre}
              </span>
              <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#F5F5F5' }}>
                {item.type === 'audiobook'
                  ? <Headphones size={10} style={{ color: '#9CA3AF' }} aria-hidden="true" />
                  : <Radio      size={10} style={{ color: '#9CA3AF' }} aria-hidden="true" />}
              </span>
            </div>
          </>
        )}

        {/* Bottom bar — always shown over image */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center gap-1.5 z-10"
          style={{ padding: '24px 8px 8px', background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)' }}
        >
          <Star size={9} fill="#F59E0B" style={{ color: '#F59E0B', flexShrink: 0 }} aria-hidden="true" />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#FFF' }}>{item.rating}</span>
          {free && (
            <span style={{ fontSize: 9, fontWeight: 600, marginLeft: 'auto', padding: '2px 6px', borderRadius: 999, background: '#DCFFF8', color: '#00897B' }}>
              Free
            </span>
          )}
        </div>

        {/* Hover tap hint */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20"
          style={{ background: 'rgba(10,10,255,0.12)' }}
        >
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0A0AFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={14} fill="white" style={{ color: 'white', marginLeft: 2 }} />
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="mt-2.5 px-0.5">
        <p className="text-[13px] font-bold truncate leading-snug" style={{ color: '#0A0A0A' }}>
          {item.title}
        </p>
        <p className="text-[11px] truncate mt-0.5" style={{ color: '#9CA3AF' }}>{item.author}</p>
      </div>
    </button>
  );
}

/* ── Scroll row ───────────────────────────────────────── */
function ScrollRow({
  title, items, accentColor, onSelect,
}: {
  title: string; items: ContentItem[]; accentColor?: string; onSelect: (item: ContentItem) => void;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold tracking-tight" style={{ fontSize: 18, color: '#0A0A0A' }}>
          {accentColor && <span aria-hidden="true" style={{ color: accentColor, marginRight: 6 }}>✦</span>}
          {title}
        </h2>
        <button className="text-xs font-semibold flex items-center gap-0.5" style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          See all <ChevronRight size={12} aria-hidden="true" />
        </button>
      </div>
      <div className="scroll-row flex gap-3.5 overflow-x-auto pb-3" role="list">
        {items.map((item) => (
          <div key={item.id} role="listitem">
            <ContentCard item={item} onClick={() => onSelect(item)} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Hero banner ──────────────────────────────────────── */
function HeroBanner({ query, setQuery }: { query: string; setQuery: (q: string) => void }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0A0AFF 0%, #6200EE 100%)', borderRadius: 24, padding: '36px 28px 32px' }}
    >
      <span aria-hidden="true" style={{ position: 'absolute', top: 12, right: 20, fontSize: 88, fontWeight: 900, lineHeight: 1, color: '#BEFF00', opacity: 0.95, userSelect: 'none', fontFamily: 'serif' }}>✦</span>
      <span aria-hidden="true" style={{ position: 'absolute', bottom: 18, right: 72, fontSize: 36, lineHeight: 1, color: '#FF45A6', opacity: 0.8, userSelect: 'none' }}>✿</span>

      <p className="font-bold uppercase tracking-widest mb-3" style={{ fontSize: 10, color: '#BEFF00', letterSpacing: '0.14em' }}>
        ✦ All your platforms, one place
      </p>
      <h1 className="font-black uppercase leading-none mb-6" style={{ fontSize: 'clamp(26px, 4.5vw, 42px)', color: '#FFFFFF', letterSpacing: '-0.03em', maxWidth: 420 }}>
        find your<br />next obsession
      </h1>

      <div className="relative max-w-lg">
        <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles, authors, genres…"
          aria-label="Search across all platforms"
          style={{ width: '100%', background: '#FFFFFF', color: '#0A0A0A', border: 'none', outline: 'none', borderRadius: 16, padding: '13px 40px 13px 44px', fontSize: 14, fontFamily: 'inherit', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
        />
        {query && (
          <button onClick={() => setQuery('')} aria-label="Clear search" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: '#F3F4F6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7280' }}>
            <X size={11} aria-hidden="true" />
          </button>
        )}
      </div>

      {!query && (
        <div className="flex items-center gap-2 flex-wrap mt-3">
          <span style={{ fontSize: 10, fontWeight: 600, color: '#FFFFFF60', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Try:</span>
          {SUGGESTIONS.slice(0, 4).map((s) => (
            <button key={s} onClick={() => setQuery(s)} style={{ fontSize: 11, fontWeight: 500, padding: '4px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', fontFamily: 'inherit' }}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Discover page ────────────────────────────────────── */
export default function Discover() {
  const [query,    setQuery]    = useState('');
  const [filter,   setFilter]   = useState<FilterTab>('all');
  const [selected, setSelected] = useState<ContentItem | null>(null);

  const filtered = useMemo(() => {
    let items = ALL_CONTENT;
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q) ||
        c.genre.toLowerCase().includes(q),
      );
    }
    if (filter === 'audiobooks') items = items.filter((c) => c.type === 'audiobook');
    if (filter === 'podcasts')   items = items.filter((c) => c.type === 'podcast');
    if (filter === 'free')       items = items.filter((c) => PLAT_ORDER.some((id) => c.platforms[id] && ACTIVE_SUBS.has(id)));
    return items;
  }, [query, filter]);

  const isFiltering = query.trim().length > 0 || filter !== 'all';
  const trending    = useMemo(() => ALL_CONTENT.filter((c) => c.trending),  []);
  const audiobooks  = useMemo(() => ALL_CONTENT.filter((c) => c.type === 'audiobook'), []);
  const podcasts    = useMemo(() => ALL_CONTENT.filter((c) => c.type === 'podcast'),   []);

  const clearAll = () => { setQuery(''); setFilter('all'); };

  return (
    <div style={{ background: '#F8F8FF', minHeight: '100%' }}>
      <div className="p-4 sm:p-6 max-w-6xl" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        <HeroBanner query={query} setQuery={setQuery} />

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter content">
          {FILTER_TABS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              style={{
                fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 999,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms',
                ...(filter === f.id
                  ? { background: '#0A0AFF', color: '#FFFFFF', border: '2px solid #0A0AFF' }
                  : { background: '#FFFFFF', color: '#0A0A0A', border: '2px solid #E5E7EB' }),
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isFiltering ? (
          <section aria-label="Search results">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0A0A0A' }}>
                {filtered.length === 0 ? 'No results' : `${filtered.length} title${filtered.length !== 1 ? 's' : ''}${query ? ` for "${query}"` : ''}`}
              </h2>
              <button onClick={clearAll} style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                <X size={11} aria-hidden="true" /> Clear
              </button>
            </div>
            {filtered.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', background: '#FFFFFF', borderRadius: 20, border: '1.5px solid #F0F0F0' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0A' }}>Nothing found for &ldquo;{query}&rdquo;</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Try a title, author name, or genre</p>
                <button onClick={clearAll} style={{ marginTop: 20, fontSize: 13, fontWeight: 700, padding: '10px 22px', borderRadius: 999, background: '#0A0AFF', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Browse all titles
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {filtered.map((item) => <ContentCard key={item.id} item={item} onClick={() => setSelected(item)} />)}
              </div>
            )}
          </section>
        ) : (
          <>
            <ScrollRow title="Trending Right Now" items={trending}   accentColor="#FF2D87" onSelect={setSelected} />
            <ScrollRow title="Audiobooks"          items={audiobooks} accentColor="#0A0AFF" onSelect={setSelected} />
            <ScrollRow title="Podcasts"            items={podcasts}   accentColor="#8B5CF6" onSelect={setSelected} />
          </>
        )}
      </div>

      {/* Detail modal */}
      {selected && <DetailModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
