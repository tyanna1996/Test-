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

const GENRE: Record<string, string> = {
  'Self-Help':  'bg-teal-dim   text-teal',
  'Psychology': 'bg-blue-dim   text-blue',
  'History':    'bg-amber-dim  text-amber',
  'True Crime': 'bg-danger-dim text-danger',
  'News':       'bg-blue-dim   text-blue',
  'Memoir':     'bg-purple-dim text-purple',
  'Business':   'bg-green-dim  text-green',
  'Technology': 'bg-teal-dim   text-teal',
};

const SUGGESTIONS = [
  'Atomic Habits',
  'Serial',
  'Thinking, Fast and Slow',
  'Sapiens',
  'Crime Junkie',
];

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all',        label: 'All' },
  { id: 'audiobooks', label: 'Audiobooks' },
  { id: 'podcasts',   label: 'Podcasts' },
  { id: 'free',       label: 'Free on your plan' },
];

/* ── Mock content ─────────────────────────────────────── */
const ALL_CONTENT: ContentItem[] = [
  /* Audiobooks */
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
  /* Podcasts */
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

/* ── Poster card ──────────────────────────────────────── */
function PosterCard({ item }: { item: ContentItem }) {
  const { active, trial, free, any } = accessInfo(item);

  const accessLine = free
    ? `Free · ${active.map((id) => SVC[id].name).join(' & ')}`
    : trial.length > 0
    ? 'Available on trial'
    : null;

  const mono  = monogram(item.title);
  const gCls  = GENRE[item.genre] ?? 'bg-teal-dim text-teal';

  return (
    <div className="poster-card group flex-shrink-0 w-[148px] cursor-pointer select-none">
      {/* ── Cover ── */}
      <div className="poster-cover relative rounded-2xl overflow-hidden" style={{ aspectRatio: '2/3' }}>
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 38% 22%, ${item.coverColor}58 0%, ${item.coverColor}18 52%, #0b0f1a 100%)`,
          }}
        />

        {/* Monogram watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center font-black leading-none tracking-tighter pointer-events-none"
          style={{ fontSize: 60, color: item.coverColor, opacity: 0.38 }}
          aria-hidden="true"
        >
          {mono}
        </div>

        {/* Top row: genre + type icon */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between z-10">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${gCls}`}>
            {item.genre}
          </span>
          <span className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center">
            {item.type === 'audiobook'
              ? <Headphones size={10} className="text-white/55" aria-hidden="true" />
              : <Radio      size={10} className="text-white/55" aria-hidden="true" />}
          </span>
        </div>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-20"
          style={{ background: 'linear-gradient(to top, rgba(5,8,18,0.92) 0%, rgba(5,8,18,0.55) 55%, transparent 100%)' }}
        >
          {/* Rating + length */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <Star size={9} className="text-amber" fill="currentColor" aria-hidden="true" />
            <span className="text-xs font-mono text-amber">{item.rating}</span>
            <span className="text-[11px] text-white/45">
              {item.duration ?? (item.episodes != null ? `${item.episodes} eps` : '')}
            </span>
          </div>

          {/* Access line */}
          {accessLine && (
            <p className={`text-[11px] mb-2 flex items-center gap-1 ${free ? 'text-teal' : 'text-amber'}`}>
              <Check size={9} aria-hidden="true" />
              {accessLine}
            </p>
          )}

          {/* CTA */}
          {any && (
            <button
              className={`w-full py-[7px] rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                free
                  ? 'bg-teal text-bg-primary hover:bg-teal-hover'
                  : 'bg-amber/25 text-amber hover:bg-amber/35'
              }`}
            >
              <Play size={9} fill="currentColor" aria-hidden="true" />
              {free ? 'Listen Now' : 'Try Free'}
            </button>
          )}
        </div>
      </div>

      {/* ── Label ── */}
      <div className="mt-2.5 px-0.5">
        <p className="text-[13px] font-semibold text-text-primary truncate leading-snug">
          {item.title}
        </p>
        <p className="text-[11px] text-text-secondary/70 truncate mt-0.5">{item.author}</p>
      </div>
    </div>
  );
}

/* ── Scroll row ───────────────────────────────────────── */
function ScrollRow({
  title, items, badge,
}: {
  title: string; items: ContentItem[]; badge?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[15px] font-semibold text-text-primary">{title}</h2>
          {badge && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-dim text-teal font-medium">
              {badge}
            </span>
          )}
        </div>
        <button className="text-xs text-text-muted hover:text-teal flex items-center gap-0.5 transition-colors">
          See all <ChevronRight size={12} aria-hidden="true" />
        </button>
      </div>
      <div
        className="scroll-row flex gap-3.5 overflow-x-auto pb-3"
        role="list"
      >
        {items.map((item) => (
          <div key={item.id} role="listitem">
            <PosterCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Hero featured card ───────────────────────────────── */
function HeroCard({ item }: { item: ContentItem }) {
  const { active, free } = accessInfo(item);
  const gCls = GENRE[item.genre] ?? 'bg-teal-dim text-teal';
  const mono = monogram(item.title);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* BG layers */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 72% 42%, ${item.coverColor}32 0%, ${item.coverColor}08 58%, transparent 80%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(105deg, #0b0f1a 42%, transparent 100%)' }}
      />

      {/* Decorative monogram */}
      <div
        className="absolute right-0 sm:right-10 top-1/2 -translate-y-1/2 font-black leading-none select-none pointer-events-none"
        style={{
          fontSize: 'clamp(110px, 18vw, 210px)',
          color: item.coverColor,
          opacity: 0.055,
          letterSpacing: '-0.06em',
        }}
        aria-hidden="true"
      >
        {mono}
      </div>

      {/* Content */}
      <div className="relative px-6 py-8 sm:px-10 sm:py-10">
        <div className="max-w-md">
          {/* Eye-brow */}
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
              Featured
            </span>
            <span className="text-text-muted opacity-40">·</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${gCls}`}>
              {item.genre}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-[32px] font-bold text-text-primary leading-tight tracking-tight">
            {item.title}
          </h2>
          <p className="text-sm text-text-secondary mt-1.5">by {item.author}</p>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-3 text-xs">
            <span className="flex items-center gap-1">
              <Star size={12} className="text-amber" fill="currentColor" aria-hidden="true" />
              <span className="font-mono text-amber font-semibold">{item.rating}</span>
            </span>
            {item.duration && (
              <span className="font-mono text-text-muted">{item.duration}</span>
            )}
            {item.year && <span className="text-text-muted">{item.year}</span>}
          </div>

          {/* Platform chips */}
          <div className="flex flex-wrap gap-1.5 mt-5" role="list" aria-label="Platform availability">
            {PLAT_ORDER.map((id) => {
              const meta      = SVC[id];
              const available = Boolean(item.platforms[id]);
              const isTrial   = TRIAL_SUBS.has(id);
              if (!available) {
                return (
                  <span
                    key={id}
                    role="listitem"
                    className="text-xs px-2.5 py-1 rounded-full text-text-muted bg-border/30"
                  >
                    Not on {meta.name}
                  </span>
                );
              }
              return (
                <span
                  key={id}
                  role="listitem"
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ backgroundColor: meta.color + '18', color: meta.color }}
                >
                  <Check size={10} aria-hidden="true" />
                  {meta.name}
                  {isTrial && (
                    <span className="opacity-55 font-normal text-[10px]"> · trial</span>
                  )}
                </span>
              );
            })}
          </div>

          {/* Access callout */}
          {free && (
            <p className="mt-2.5 text-xs text-teal flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" aria-hidden="true" />
              Free with your{' '}
              {active.map((id) => SVC[id].name).join(' & ')}{' '}
              subscription{active.length > 1 ? 's' : ''}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2.5 mt-6">
            <button className="flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-xl bg-teal text-bg-primary hover:bg-teal-hover transition-colors">
              <Play size={13} fill="currentColor" aria-hidden="true" />
              Listen Now
            </button>
            <button className="text-sm px-5 py-2.5 rounded-xl bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
              + Save
            </button>
          </div>
        </div>
      </div>
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
      items = items.filter(
        (c) =>
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
  const trending    = useMemo(() => ALL_CONTENT.filter((c) => c.trending),  []);
  const audiobooks  = useMemo(() => ALL_CONTENT.filter((c) => c.type === 'audiobook'), []);
  const podcasts    = useMemo(() => ALL_CONTENT.filter((c) => c.type === 'podcast'),   []);

  const clearAll = () => { setQuery(''); setFilter('all'); };

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-6xl">

      {/* ── Page heading ── */}
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Discover</h1>
        <p className="text-sm mt-0.5 text-text-secondary">
          Search across all your connected platforms at once.
        </p>
      </div>

      {/* ── Search bar ── */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across all your platforms…"
          className="w-full bg-bg-card border border-border rounded-xl pl-11 pr-10 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal transition-colors"
          aria-label="Search titles, authors, or genres"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
            aria-label="Clear search"
          >
            <X size={11} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ── Quick suggestions ── */}
      {!query && (
        <div className="flex items-center gap-2 flex-wrap -mt-4">
          <span className="text-xs text-text-muted">Try:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="text-xs px-3 py-1 rounded-full bg-bg-card border border-border text-text-secondary hover:text-teal hover:border-teal/40 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Filter chips ── */}
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter content">
        {FILTER_TABS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors ${
              filter === f.id
                ? 'bg-teal text-bg-primary'
                : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {isFiltering ? (
        /* Search / filter results */
        <section aria-label="Search results">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-semibold text-text-primary">
              {filtered.length === 0 ? (
                'No results'
              ) : (
                <>
                  {filtered.length} title{filtered.length !== 1 ? 's' : ''}
                  {query && (
                    <span className="font-normal text-text-secondary ml-1.5">
                      for &ldquo;{query}&rdquo;
                    </span>
                  )}
                </>
              )}
            </h2>
            <button
              onClick={clearAll}
              className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
            >
              <X size={11} aria-hidden="true" /> Clear
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-sm text-text-secondary">
                Nothing found for{' '}
                <span className="text-text-primary font-semibold">&ldquo;{query}&rdquo;</span>
              </p>
              <p className="text-xs text-text-muted mt-1">Try a title, author name, or genre</p>
              <button
                onClick={clearAll}
                className="mt-4 text-xs font-medium px-4 py-2 rounded-lg bg-teal-dim text-teal hover:bg-teal-dim-hover transition-colors"
              >
                Browse all titles
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {filtered.map((item) => (
                <PosterCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Default browse view */
        <>
          {/* Hero */}
          <HeroCard item={trending[0]} />

          {/* Rows */}
          <ScrollRow title="Trending Now"  items={trending}   />
          <ScrollRow title="Audiobooks"    items={audiobooks} badge={String(audiobooks.length)} />
          <ScrollRow title="Podcasts"      items={podcasts}   badge={String(podcasts.length)}   />
        </>
      )}
    </div>
  );
}
