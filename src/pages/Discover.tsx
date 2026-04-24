import { useState, useMemo } from 'react';
import { Search, X, Star, Check, Play, ChevronRight, Headphones, Radio } from 'lucide-react';

/* ── Types ────────────────────────────────────────────── */
type ContentType = 'audiobook' | 'podcast';
type FilterTab   = 'all' | 'audiobooks' | 'podcasts' | 'free';

interface ContentItem {
  id:          string;
  title:       string;
  author:      string;
  type:        ContentType;
  genre:       string;
  coverColor:  string;
  coverImage?: string;
  rating:      number;
  duration?:   string;
  episodes?:   number;
  year?:       number;
  platforms:   Record<string, boolean>;
  trending:    boolean;
}

/* ── Constants ────────────────────────────────────────── */
const ACTIVE_SUBS = new Set(['audible', 'storytel', 'spotify']);
const TRIAL_SUBS  = new Set(['podimo']);
const PLAT_ORDER  = ['audible', 'storytel', 'podimo', 'spotify'] as const;

const SVC: Record<string, { name: string; color: string }> = {
  audible:  { name: 'Audible',  color: '#b05c10' },
  storytel: { name: 'Storytel', color: '#6d28d9' },
  podimo:   { name: 'Podimo',   color: '#be3a2e' },
  spotify:  { name: 'Spotify',  color: '#1e5c40' },
};

/* Light-on-dark accent for poster card overlay (book cover / gradient) */
const POSTER_ACCENT = '#4cbe85';

/* ── Per-card bold color themes (inspo: earthy & editorial) ── */
const CARD_THEMES = [
  { bg: '#1e3d2f', label: '#d4bfa8', accent: '#4cbe85' }, // forest green + cream
  { bg: '#f4ede4', label: '#1c1814', accent: '#6d28d9' }, // warm cream (selected looks like inspo card 2)
  { bg: '#3d2415', label: '#f5deb3', accent: '#d97706' }, // dark chocolate + wheat
  { bg: '#1a2038', label: '#c8d4f0', accent: '#4a7fdb' }, // midnight navy + powder blue
  { bg: '#2e1f38', label: '#e8d0f8', accent: '#9d6aeb' }, // deep plum + lavender
] as const;

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
    coverImage: 'https://covers.openlibrary.org/b/isbn/0735211292-L.jpg',
    rating: 4.8, duration: '5h 35m', year: 2018, trending: true,
    platforms: { audible: true, storytel: true, spotify: false, podimo: false },
  },
  {
    id: 'thinking-fast-slow', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman',
    type: 'audiobook', genre: 'Psychology', coverColor: '#3b82f6',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0374533557-L.jpg',
    rating: 4.6, duration: '20h 2m', year: 2011, trending: true,
    platforms: { audible: true, storytel: true, spotify: false, podimo: false },
  },
  {
    id: 'sapiens', title: 'Sapiens', author: 'Yuval Noah Harari',
    type: 'audiobook', genre: 'History', coverColor: '#f59e0b',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0062316097-L.jpg',
    rating: 4.7, duration: '15h 17m', year: 2011, trending: true,
    platforms: { audible: true, storytel: true, spotify: false, podimo: true },
  },
  {
    id: 'educated', title: 'Educated', author: 'Tara Westover',
    type: 'audiobook', genre: 'Memoir', coverColor: '#8b5cf6',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0399590504-L.jpg',
    rating: 4.9, duration: '12h 11m', year: 2018, trending: false,
    platforms: { audible: true, storytel: true, spotify: false, podimo: false },
  },
  {
    id: 'subtle-art', title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson',
    type: 'audiobook', genre: 'Self-Help', coverColor: '#ef4444',
    coverImage: 'https://covers.openlibrary.org/b/isbn/0062457714-L.jpg',
    rating: 4.3, duration: '5h 17m', year: 2016, trending: false,
    platforms: { audible: true, storytel: true, spotify: true, podimo: true },
  },
  {
    id: 'becoming', title: 'Becoming', author: 'Michelle Obama',
    type: 'audiobook', genre: 'Memoir', coverColor: '#ec4899',
    coverImage: 'https://covers.openlibrary.org/b/isbn/1524763138-L.jpg',
    rating: 4.8, duration: '19h 3m', year: 2018, trending: true,
    platforms: { audible: true, storytel: true, spotify: true, podimo: false },
  },
  {
    id: 'power-of-now', title: 'The Power of Now', author: 'Eckhart Tolle',
    type: 'audiobook', genre: 'Self-Help', coverColor: '#84cc16',
    coverImage: 'https://covers.openlibrary.org/b/isbn/1577314806-L.jpg',
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
  const [imgError, setImgError] = useState(false);
  const hasImg = Boolean(item.coverImage) && !imgError;

  const accessLine = free
    ? `Free · ${active.map((id) => SVC[id].name).join(' & ')}`
    : trial.length > 0
    ? 'Available on trial'
    : null;

  const mono = monogram(item.title);

  return (
    <div className="poster-card group flex-shrink-0 w-[148px] cursor-pointer select-none">
      {/* ── Cover ── */}
      <div className="poster-cover relative rounded-2xl overflow-hidden" style={{ aspectRatio: '2/3' }}>

        {/* Cover image (books) */}
        {hasImg ? (
          <img
            src={item.coverImage}
            alt={`${item.title} cover`}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Fallback gradient for podcasts / failed loads */
          <>
            <div className="absolute inset-0" style={{ background: '#0f1420' }} />
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 38% 22%, ${item.coverColor}55 0%, ${item.coverColor}18 52%, transparent 100%)`,
              }}
            />
            {/* Monogram watermark */}
            <div
              className="absolute inset-0 flex items-center justify-center font-black leading-none tracking-tighter pointer-events-none"
              style={{ fontSize: 60, color: item.coverColor, opacity: 0.35 }}
              aria-hidden="true"
            >
              {mono}
            </div>
          </>
        )}

        {/* Top gradient for badge legibility */}
        <div
          className="absolute inset-x-0 top-0 h-14 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)' }}
        />

        {/* Top row: genre + type icon */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between z-10">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-black/40 text-white/90 backdrop-blur-sm leading-relaxed">
            {item.genre}
          </span>
          <span className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
            {item.type === 'audiobook'
              ? <Headphones size={10} className="text-white/60" aria-hidden="true" />
              : <Radio      size={10} className="text-white/60" aria-hidden="true" />}
          </span>
        </div>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-20"
          style={{ background: 'linear-gradient(to top, rgba(5,8,18,0.96) 0%, rgba(5,8,18,0.6) 52%, transparent 100%)' }}
        >
          {/* Rating + length */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <Star size={9} style={{ color: '#d97706' }} fill="currentColor" aria-hidden="true" />
            <span className="text-xs font-mono" style={{ color: '#d97706' }}>{item.rating}</span>
            <span className="text-[11px] text-white/45">
              {item.duration ?? (item.episodes != null ? `${item.episodes} eps` : '')}
            </span>
          </div>

          {/* Access line */}
          {accessLine && (
            <p
              className="text-[11px] mb-2 flex items-center gap-1"
              style={{ color: free ? POSTER_ACCENT : '#d97706' }}
            >
              <Check size={9} aria-hidden="true" />
              {accessLine}
            </p>
          )}

          {/* CTA */}
          {any && (
            <button
              className="w-full py-[7px] rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-opacity hover:opacity-85"
              style={
                free
                  ? { background: POSTER_ACCENT, color: '#fff' }
                  : { background: 'rgba(176,92,16,0.28)', color: '#d97706' }
              }
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
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-bg-elevated text-text-secondary font-medium">
              {badge}
            </span>
          )}
        </div>
        <button className="text-xs text-text-muted hover:text-teal flex items-center gap-0.5 transition-colors">
          See all <ChevronRight size={12} aria-hidden="true" />
        </button>
      </div>
      <div className="scroll-row flex gap-3.5 overflow-x-auto pb-3" role="list">
        {items.map((item) => (
          <div key={item.id} role="listitem">
            <PosterCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Featured strip ───────────────────────────────────── */
function FeaturedStrip({ items }: { items: ContentItem[] }) {
  const [active, setActive] = useState(0);

  const cards = useMemo(() => {
    const out: ContentItem[] = [];
    for (const c of items) { if (c.trending && out.length < 5) out.push(c); }
    for (const c of items) { if (!c.trending && out.length < 5) out.push(c); }
    return out.slice(0, 5);
  }, [items]);

  const sel = cards[active];
  const { active: activePlats, free } = sel ? accessInfo(sel) : { active: [] as string[], free: false };

  return (
    <div className="space-y-2.5">
      {/* Card row */}
      <div className="flex gap-2.5 overflow-x-auto sm:overflow-x-visible" style={{ height: 252 }}>
        {cards.map((item, i) => {
          const t = CARD_THEMES[i];
          const isActive = active === i;
          const mono = monogram(item.title);

          return (
            <button
              key={item.id}
              onClick={() => setActive(i)}
              aria-pressed={isActive}
              className="relative flex-shrink-0 w-[148px] sm:flex-1 sm:w-auto rounded-2xl overflow-hidden cursor-pointer text-left focus:outline-none"
              style={{
                background: t.bg,
                boxShadow: isActive
                  ? `0 0 0 2.5px ${t.accent}, 0 12px 32px ${t.accent}30`
                  : '0 0 0 1px rgba(28,20,12,0.10)',
                transition: 'box-shadow 250ms ease, transform 250ms ease',
              }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
            >
              {/* Monogram watermark */}
              <div
                className="absolute bottom-0 right-0 font-black leading-none pointer-events-none select-none"
                style={{
                  fontSize: 88,
                  color: t.accent,
                  opacity: 0.13,
                  letterSpacing: '-0.04em',
                  lineHeight: 0.85,
                  paddingRight: 4,
                }}
                aria-hidden="true"
              >
                {mono}
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                {/* Top row */}
                <div className="flex items-start justify-between gap-1">
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: t.accent + '22', color: t.label, opacity: 0.75 }}
                  >
                    {item.type === 'audiobook' ? 'Book' : 'Podcast'}
                  </span>
                  {item.trending && (
                    <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: t.accent }}>
                      ↑
                    </span>
                  )}
                </div>

                {/* Bottom text */}
                <div>
                  <p
                    className="text-[9px] font-semibold uppercase tracking-widest mb-1"
                    style={{ color: t.label, opacity: 0.42 }}
                  >
                    {item.author}
                  </p>
                  <h3
                    className="font-black uppercase leading-tight line-clamp-3"
                    style={{
                      fontSize: 'clamp(13px, 1.45vw, 16px)',
                      color: t.label,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="font-mono mt-3"
                    style={{ fontSize: 10, color: t.label, opacity: 0.25 }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected-item detail bar */}
      {sel && (
        <div
          className="rounded-xl px-5 py-3.5 flex items-center gap-4 flex-wrap bg-bg-card border border-border"
          style={{ borderLeft: `3px solid ${CARD_THEMES[active].accent}` }}
        >
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <Star size={11} className="text-amber flex-shrink-0" fill="currentColor" aria-hidden="true" />
              <span className="text-xs font-mono text-amber">{sel.rating}</span>
              <span className="text-xs text-text-secondary/60">
                {sel.duration ?? (sel.episodes != null ? `${sel.episodes} eps` : '')}
              </span>
              {sel.year && (
                <span className="text-xs text-text-muted">{sel.year}</span>
              )}
            </div>
            {free && activePlats.length > 0 && (
              <p className="text-xs flex items-center gap-1 text-teal">
                <Check size={9} aria-hidden="true" />
                Free · {activePlats.map((id) => SVC[id].name).join(' & ')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-85"
              style={{ background: CARD_THEMES[active].accent }}
            >
              <Play size={10} fill="currentColor" aria-hidden="true" />
              {free ? 'Listen Now' : 'Explore'}
            </button>
            <button className="text-xs px-3 py-2 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors">
              + Save
            </button>
          </div>
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
  const trending   = useMemo(() => ALL_CONTENT.filter((c) => c.trending),  []);
  const audiobooks = useMemo(() => ALL_CONTENT.filter((c) => c.type === 'audiobook'), []);
  const podcasts   = useMemo(() => ALL_CONTENT.filter((c) => c.type === 'podcast'),   []);

  const clearAll = () => { setQuery(''); setFilter('all'); };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto">

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
          placeholder="Search books, podcasts, authors…"
          className="w-full bg-bg-card border border-border rounded-xl pl-11 pr-10 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal transition-colors shadow-sm"
          aria-label="Search titles, authors, or genres"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
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
              className="text-xs px-3 py-1 rounded-full bg-bg-card border border-border text-text-secondary hover:text-teal hover:border-teal/40 transition-colors shadow-sm"
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
                ? 'bg-teal text-white'
                : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary shadow-sm'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {isFiltering ? (
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
        <>
          <FeaturedStrip items={ALL_CONTENT} />
          <ScrollRow title="Trending Now"  items={trending}   />
          <ScrollRow title="Audiobooks"    items={audiobooks} badge={String(audiobooks.length)} />
          <ScrollRow title="Podcasts"      items={podcasts}   badge={String(podcasts.length)}   />
        </>
      )}
    </div>
  );
}
