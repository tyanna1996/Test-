import { useState, useMemo } from 'react';
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
  rating:     number;
  duration?:  string;
  episodes?:  number;
  year?:      number;
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
    rating: 4.8, duration: '5h 35m', year: 2018, trending: true,
    platforms: { audible: true, storytel: true, spotify: false, podimo: false },
  },
  {
    id: 'thinking-fast-slow', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman',
    type: 'audiobook', genre: 'Psychology', coverColor: '#3b82f6',
    rating: 4.6, duration: '20h 2m', year: 2011, trending: true,
    platforms: { audible: true, storytel: true, spotify: false, podimo: false },
  },
  {
    id: 'sapiens', title: 'Sapiens', author: 'Yuval Noah Harari',
    type: 'audiobook', genre: 'History', coverColor: '#f59e0b',
    rating: 4.7, duration: '15h 17m', year: 2011, trending: true,
    platforms: { audible: true, storytel: true, spotify: false, podimo: true },
  },
  {
    id: 'educated', title: 'Educated', author: 'Tara Westover',
    type: 'audiobook', genre: 'Memoir', coverColor: '#8b5cf6',
    rating: 4.9, duration: '12h 11m', year: 2018, trending: false,
    platforms: { audible: true, storytel: true, spotify: false, podimo: false },
  },
  {
    id: 'subtle-art', title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson',
    type: 'audiobook', genre: 'Self-Help', coverColor: '#ef4444',
    rating: 4.3, duration: '5h 17m', year: 2016, trending: false,
    platforms: { audible: true, storytel: true, spotify: true, podimo: true },
  },
  {
    id: 'becoming', title: 'Becoming', author: 'Michelle Obama',
    type: 'audiobook', genre: 'Memoir', coverColor: '#ec4899',
    rating: 4.8, duration: '19h 3m', year: 2018, trending: true,
    platforms: { audible: true, storytel: true, spotify: true, podimo: false },
  },
  {
    id: 'power-of-now', title: 'The Power of Now', author: 'Eckhart Tolle',
    type: 'audiobook', genre: 'Self-Help', coverColor: '#84cc16',
    rating: 4.4, duration: '7h 37m', year: 1997, trending: false,
    platforms: { audible: true, storytel: false, spotify: false, podimo: false },
  },
  {
    id: 'serial', title: 'Serial', author: 'Sarah Koenig',
    type: 'podcast', genre: 'True Crime', coverColor: '#ef4444',
    rating: 4.9, episodes: 52, trending: true,
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'the-daily', title: 'The Daily', author: 'The New York Times',
    type: 'podcast', genre: 'News', coverColor: '#3b82f6',
    rating: 4.6, episodes: 2100, trending: true,
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'crime-junkie', title: 'Crime Junkie', author: 'audiochuck',
    type: 'podcast', genre: 'True Crime', coverColor: '#dc2626',
    rating: 4.7, episodes: 380, trending: false,
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'hardcore-history', title: 'Hardcore History', author: 'Dan Carlin',
    type: 'podcast', genre: 'History', coverColor: '#d97706',
    rating: 4.9, episodes: 67, trending: true,
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'how-i-built-this', title: 'How I Built This', author: 'Guy Raz',
    type: 'podcast', genre: 'Business', coverColor: '#22c55e',
    rating: 4.7, episodes: 420, trending: false,
    platforms: { audible: false, storytel: false, spotify: true, podimo: false },
  },
  {
    id: 'lex-fridman', title: 'Lex Fridman Podcast', author: 'Lex Fridman',
    type: 'podcast', genre: 'Technology', coverColor: '#06b6d4',
    rating: 4.6, episodes: 430, trending: false,
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'missing-cryptoqueen', title: 'The Missing Cryptoqueen', author: 'BBC Podcasts',
    type: 'podcast', genre: 'True Crime', coverColor: '#a855f7',
    rating: 4.5, episodes: 27, trending: false,
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

/* ── Content card — light Gen Z style ────────────────── */
function ContentCard({ item }: { item: ContentItem }) {
  const { active, trial, free, any } = accessInfo(item);
  const genre = GENRE_STYLES[item.genre] ?? { bg: '#F0FDF4', color: '#15803D' };
  const mono  = monogram(item.title);

  const accessLine = free
    ? `Free · ${active.map((id) => SVC[id].name).join(' & ')}`
    : trial.length > 0 ? 'Available on trial' : null;

  return (
    <div className="poster-card group flex-shrink-0 cursor-pointer select-none" style={{ width: 152 }}>
      {/* Cover */}
      <div
        className="poster-cover relative rounded-2xl overflow-hidden"
        style={{
          aspectRatio: '2/3',
          background: `linear-gradient(150deg, ${item.coverColor}22 0%, ${item.coverColor}08 100%)`,
          border: '1.5px solid #EBEBEB',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        {/* Color accent bar */}
        <div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: 3, background: item.coverColor,
          }}
        />

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
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: genre.bg, color: genre.color }}
          >
            {item.genre}
          </span>
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#F5F5F5' }}
          >
            {item.type === 'audiobook'
              ? <Headphones size={10} style={{ color: '#9CA3AF' }} aria-hidden="true" />
              : <Radio      size={10} style={{ color: '#9CA3AF' }} aria-hidden="true" />}
          </span>
        </div>

        {/* Bottom: rating + access badge */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <Star size={9} fill="#F59E0B" style={{ color: '#F59E0B', flexShrink: 0 }} aria-hidden="true" />
          <span className="text-[10px] font-bold" style={{ color: '#111' }}>{item.rating}</span>
          {accessLine && (
            <span
              className="text-[9px] font-semibold ml-auto px-1.5 py-0.5 rounded-full"
              style={{
                background: free ? '#DCFFF8' : '#FEF3C7',
                color: free ? '#00897B' : '#B45309',
              }}
            >
              {free ? 'Free' : 'Trial'}
            </span>
          )}
        </div>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-20"
          style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.84) 0%, rgba(10,10,10,0.4) 55%, transparent 100%)' }}
        >
          {accessLine && (
            <p className="text-[10px] mb-2 flex items-center gap-1" style={{ color: '#6EE7B7' }}>
              <Check size={9} aria-hidden="true" />
              {accessLine}
            </p>
          )}
          {any && (
            <button
              className="w-full py-[7px] rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
              style={{
                background: free ? '#0A0AFF' : '#F59E0B22',
                color: free ? '#FFFFFF' : '#F59E0B',
              }}
            >
              <Play size={9} fill="currentColor" aria-hidden="true" />
              {free ? 'Listen Free' : 'Try Free'}
            </button>
          )}
        </div>
      </div>

      {/* Label */}
      <div className="mt-2.5 px-0.5">
        <p className="text-[13px] font-bold truncate leading-snug" style={{ color: '#0A0A0A' }}>
          {item.title}
        </p>
        <p className="text-[11px] truncate mt-0.5" style={{ color: '#9CA3AF' }}>{item.author}</p>
      </div>
    </div>
  );
}

/* ── Scroll row ───────────────────────────────────────── */
function ScrollRow({
  title, items, accentColor,
}: {
  title: string; items: ContentItem[]; accentColor?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title}>
      <div className="flex items-center justify-between mb-4">
        <h2
          className="font-extrabold tracking-tight"
          style={{ fontSize: 18, color: '#0A0A0A' }}
        >
          {accentColor && (
            <span aria-hidden="true" style={{ color: accentColor, marginRight: 6 }}>✦</span>
          )}
          {title}
        </h2>
        <button
          className="text-xs font-semibold flex items-center gap-0.5 transition-colors"
          style={{ color: '#9CA3AF' }}
        >
          See all <ChevronRight size={12} aria-hidden="true" />
        </button>
      </div>
      <div className="scroll-row flex gap-3.5 overflow-x-auto pb-3" role="list">
        {items.map((item) => (
          <div key={item.id} role="listitem">
            <ContentCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Hero banner with embedded search ────────────────── */
function HeroBanner({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (q: string) => void;
}) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0A0AFF 0%, #6200EE 100%)',
        borderRadius: 24,
        padding: '36px 28px 32px',
      }}
    >
      {/* Decorative starburst — top right */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute', top: 12, right: 20,
          fontSize: 88, fontWeight: 900, lineHeight: 1,
          color: '#BEFF00', opacity: 0.95, userSelect: 'none',
          fontFamily: 'serif',
        }}
      >
        ✦
      </span>

      {/* Decorative flower — bottom right */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: 18, right: 72,
          fontSize: 36, lineHeight: 1,
          color: '#FF45A6', opacity: 0.8, userSelect: 'none',
        }}
      >
        ✿
      </span>

      {/* Eyebrow label */}
      <p
        className="font-bold uppercase tracking-widest mb-3"
        style={{ fontSize: 10, color: '#BEFF00', letterSpacing: '0.14em' }}
      >
        ✦ All your platforms, one place
      </p>

      {/* Main heading */}
      <h1
        className="font-black uppercase leading-none mb-6"
        style={{
          fontSize: 'clamp(26px, 4.5vw, 42px)',
          color: '#FFFFFF',
          letterSpacing: '-0.03em',
          maxWidth: 420,
        }}
      >
        find your<br />next obsession
      </h1>

      {/* Search input */}
      <div className="relative max-w-lg">
        <Search
          size={16}
          aria-hidden="true"
          style={{
            position: 'absolute', left: 16,
            top: '50%', transform: 'translateY(-50%)',
            color: '#9CA3AF', pointerEvents: 'none',
          }}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles, authors, genres…"
          aria-label="Search across all platforms"
          style={{
            width: '100%',
            background: '#FFFFFF',
            color: '#0A0A0A',
            border: 'none',
            outline: 'none',
            borderRadius: 16,
            padding: '13px 40px 13px 44px',
            fontSize: 14,
            fontFamily: 'inherit',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear search"
            style={{
              position: 'absolute', right: 12,
              top: '50%', transform: 'translateY(-50%)',
              width: 20, height: 20, borderRadius: '50%',
              background: '#F3F4F6', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#6B7280',
            }}
          >
            <X size={11} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Quick suggestions */}
      {!query && (
        <div className="flex items-center gap-2 flex-wrap mt-3">
          <span style={{ fontSize: 10, fontWeight: 600, color: '#FFFFFF60', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Try:
          </span>
          {SUGGESTIONS.slice(0, 4).map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              style={{
                fontSize: 11, fontWeight: 500,
                padding: '4px 12px', borderRadius: 999,
                background: 'rgba(255,255,255,0.12)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.25)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 150ms',
              }}
            >
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
  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');

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
    if (filter === 'free') {
      items = items.filter((c) =>
        PLAT_ORDER.some((id) => c.platforms[id] && ACTIVE_SUBS.has(id)),
      );
    }
    return items;
  }, [query, filter]);

  const isFiltering = query.trim().length > 0 || filter !== 'all';
  const trending   = useMemo(() => ALL_CONTENT.filter((c) => c.trending),  []);
  const audiobooks = useMemo(() => ALL_CONTENT.filter((c) => c.type === 'audiobook'), []);
  const podcasts   = useMemo(() => ALL_CONTENT.filter((c) => c.type === 'podcast'),   []);

  const clearAll = () => { setQuery(''); setFilter('all'); };

  return (
    /* Light page surface — overrides the app's dark background locally */
    <div style={{ background: '#F8F8FF', minHeight: '100%' }}>
      <div className="p-4 sm:p-6 max-w-6xl" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Hero + search */}
        <HeroBanner query={query} setQuery={setQuery} />

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter content">
          {FILTER_TABS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              style={{
                fontSize: 13, fontWeight: 600,
                padding: '8px 18px', borderRadius: 999,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 150ms',
                ...(filter === f.id
                  ? { background: '#0A0AFF', color: '#FFFFFF', border: '2px solid #0A0AFF' }
                  : { background: '#FFFFFF', color: '#0A0A0A', border: '2px solid #E5E7EB' }),
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        {isFiltering ? (
          <section aria-label="Search results">
            {/* Result header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0A0A0A' }}>
                {filtered.length === 0
                  ? 'No results'
                  : (
                    <>
                      {filtered.length} title{filtered.length !== 1 ? 's' : ''}
                      {query && <span style={{ fontWeight: 400, color: '#9CA3AF', marginLeft: 6 }}>for &ldquo;{query}&rdquo;</span>}
                    </>
                  )}
              </h2>
              <button
                onClick={clearAll}
                style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <X size={11} aria-hidden="true" /> Clear
              </button>
            </div>

            {filtered.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px', textAlign: 'center',
                  background: '#FFFFFF', borderRadius: 20,
                  border: '1.5px solid #F0F0F0',
                }}
              >
                <p style={{ fontSize: 36, marginBottom: 8, lineHeight: 1 }} aria-hidden="true">( )</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0A' }}>
                  Nothing found for &ldquo;{query}&rdquo;
                </p>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                  Try a title, author name, or genre
                </p>
                <button
                  onClick={clearAll}
                  style={{
                    marginTop: 20, fontSize: 13, fontWeight: 700,
                    padding: '10px 22px', borderRadius: 999,
                    background: '#0A0AFF', color: '#FFFFFF',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Browse all titles
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {filtered.map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* Default browse — scroll rows */
          <>
            <ScrollRow title="Trending Right Now" items={trending}   accentColor="#FF2D87" />
            <ScrollRow title="Audiobooks"          items={audiobooks} accentColor="#0A0AFF" />
            <ScrollRow title="Podcasts"            items={podcasts}   accentColor="#8B5CF6" />
          </>
        )}
      </div>
    </div>
  );
}
