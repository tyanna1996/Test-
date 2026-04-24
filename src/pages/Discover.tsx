import { useState, useMemo } from 'react';
import { Search, X, Headphones, Radio, Star, Check } from 'lucide-react';

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
  rating:      number;
  duration?:   string;   // audiobooks
  episodes?:   number;   // podcasts
  year?:       number;
  /** platform-id → available on that platform */
  platforms:   Record<string, boolean>;
  trending:    boolean;
}

/* ── Config ───────────────────────────────────────────── */
const ACTIVE_SUBS  = new Set(['audible', 'storytel', 'spotify']);
const TRIAL_SUBS   = new Set(['podimo']);
const USER_SUBS    = new Set([...ACTIVE_SUBS, ...TRIAL_SUBS]);

const PLATFORM_ORDER = ['audible', 'storytel', 'podimo', 'spotify'] as const;

const SERVICE_META: Record<string, { name: string; color: string }> = {
  audible:  { name: 'Audible',  color: '#f59e0b' },
  storytel: { name: 'Storytel', color: '#8b5cf6' },
  podimo:   { name: 'Podimo',   color: '#ef4444' },
  spotify:  { name: 'Spotify',  color: '#22c55e' },
};

const GENRE_STYLES: Record<string, string> = {
  'Self-Help':  'bg-teal-dim text-teal',
  'Psychology': 'bg-blue-dim text-blue',
  'History':    'bg-amber-dim text-amber',
  'True Crime': 'bg-danger-dim text-danger',
  'News':       'bg-blue-dim text-blue',
  'Memoir':     'bg-purple-dim text-purple',
  'Business':   'bg-green-dim text-green',
  'Technology': 'bg-teal-dim text-teal',
  'Science':    'bg-blue-dim text-blue',
  'Education':  'bg-cyan/10 text-cyan',
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

/* ── Mock content library ─────────────────────────────── */
const ALL_CONTENT: ContentItem[] = [
  /* ── Audiobooks ── */
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    type: 'audiobook', genre: 'Self-Help', coverColor: '#00d4aa',
    rating: 4.8, duration: '5h 35m', year: 2018, trending: true,
    platforms: { audible: true, storytel: true, spotify: false, podimo: false },
  },
  {
    id: 'thinking-fast-slow',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    type: 'audiobook', genre: 'Psychology', coverColor: '#3b82f6',
    rating: 4.6, duration: '20h 2m', year: 2011, trending: true,
    platforms: { audible: true, storytel: true, spotify: false, podimo: false },
  },
  {
    id: 'sapiens',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    type: 'audiobook', genre: 'History', coverColor: '#f59e0b',
    rating: 4.7, duration: '15h 17m', year: 2011, trending: true,
    platforms: { audible: true, storytel: true, spotify: false, podimo: true },
  },
  {
    id: 'educated',
    title: 'Educated',
    author: 'Tara Westover',
    type: 'audiobook', genre: 'Memoir', coverColor: '#8b5cf6',
    rating: 4.9, duration: '12h 11m', year: 2018, trending: false,
    platforms: { audible: true, storytel: true, spotify: false, podimo: false },
  },
  {
    id: 'subtle-art',
    title: 'The Subtle Art of Not Giving a F*ck',
    author: 'Mark Manson',
    type: 'audiobook', genre: 'Self-Help', coverColor: '#ef4444',
    rating: 4.3, duration: '5h 17m', year: 2016, trending: false,
    platforms: { audible: true, storytel: true, spotify: true, podimo: true },
  },
  {
    id: 'becoming',
    title: 'Becoming',
    author: 'Michelle Obama',
    type: 'audiobook', genre: 'Memoir', coverColor: '#ec4899',
    rating: 4.8, duration: '19h 3m', year: 2018, trending: true,
    platforms: { audible: true, storytel: true, spotify: true, podimo: false },
  },
  {
    id: 'power-of-now',
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    type: 'audiobook', genre: 'Self-Help', coverColor: '#84cc16',
    rating: 4.4, duration: '7h 37m', year: 1997, trending: false,
    platforms: { audible: true, storytel: false, spotify: false, podimo: false },
  },

  /* ── Podcasts ── */
  {
    id: 'serial',
    title: 'Serial',
    author: 'Sarah Koenig',
    type: 'podcast', genre: 'True Crime', coverColor: '#ef4444',
    rating: 4.9, episodes: 52, trending: true,
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'the-daily',
    title: 'The Daily',
    author: 'The New York Times',
    type: 'podcast', genre: 'News', coverColor: '#3b82f6',
    rating: 4.6, episodes: 2100, trending: true,
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'crime-junkie',
    title: 'Crime Junkie',
    author: 'audiochuck',
    type: 'podcast', genre: 'True Crime', coverColor: '#dc2626',
    rating: 4.7, episodes: 380, trending: false,
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'hardcore-history',
    title: 'Hardcore History',
    author: 'Dan Carlin',
    type: 'podcast', genre: 'History', coverColor: '#d97706',
    rating: 4.9, episodes: 67, trending: true,
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'how-i-built-this',
    title: 'How I Built This',
    author: 'Guy Raz',
    type: 'podcast', genre: 'Business', coverColor: '#22c55e',
    rating: 4.7, episodes: 420, trending: false,
    platforms: { audible: false, storytel: false, spotify: true, podimo: false },
  },
  {
    id: 'lex-fridman',
    title: 'Lex Fridman Podcast',
    author: 'Lex Fridman',
    type: 'podcast', genre: 'Technology', coverColor: '#06b6d4',
    rating: 4.6, episodes: 430, trending: false,
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'missing-cryptoqueen',
    title: 'The Missing Cryptoqueen',
    author: 'BBC Podcasts',
    type: 'podcast', genre: 'True Crime', coverColor: '#a855f7',
    rating: 4.5, episodes: 27, trending: false,
    /* only on Podimo — useful for testing "Free on your plan" filter */
    platforms: { audible: false, storytel: false, spotify: false, podimo: true },
  },
];

/* ── Content card ─────────────────────────────────────── */
function ContentCard({ item }: { item: ContentItem }) {
  const activeAvailable = PLATFORM_ORDER.filter(
    (id) => item.platforms[id] && ACTIVE_SUBS.has(id),
  );
  const trialAvailable = PLATFORM_ORDER.filter(
    (id) => item.platforms[id] && TRIAL_SUBS.has(id),
  );
  const hasFreeAccess = activeAvailable.length > 0;

  const accessCallout = hasFreeAccess
    ? {
        text: `Free with your ${activeAvailable
          .map((id) => SERVICE_META[id].name)
          .join(' & ')} subscription${activeAvailable.length > 1 ? 's' : ''}`,
        cls: 'text-teal',
        dot: 'bg-teal',
      }
    : trialAvailable.length > 0
    ? { text: 'Available during your Podimo trial', cls: 'text-amber', dot: 'bg-amber' }
    : null;

  const totalAvailable = PLATFORM_ORDER.filter((id) => item.platforms[id]).length;
  const genreStyle = GENRE_STYLES[item.genre] ?? 'bg-teal-dim text-teal';

  return (
    <article className="card overflow-hidden flex flex-col" aria-label={item.title}>
      <div className="p-4 flex-1">
        {/* Cover + meta */}
        <div className="flex gap-3.5">
          {/* Cover art placeholder */}
          <div
            className="w-[72px] h-[72px] rounded-xl flex-shrink-0 flex items-center justify-center text-2xl font-bold select-none"
            style={{
              background: `linear-gradient(140deg, #1a2035 0%, ${item.coverColor}28 100%)`,
              border: `1px solid ${item.coverColor}20`,
              color: item.coverColor,
            }}
            aria-hidden="true"
          >
            {item.title[0]}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <span
                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                  item.type === 'audiobook'
                    ? 'bg-blue-dim text-blue'
                    : 'bg-purple-dim text-purple'
                }`}
              >
                {item.type === 'audiobook' ? (
                  <Headphones size={9} aria-hidden="true" />
                ) : (
                  <Radio size={9} aria-hidden="true" />
                )}
                {item.type === 'audiobook' ? 'Audiobook' : 'Podcast'}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${genreStyle}`}>
                {item.genre}
              </span>
            </div>

            {/* Title + author */}
            <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
              {item.title}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5 truncate">{item.author}</p>

            {/* Rating + stats */}
            <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
              <span className="flex items-center gap-0.5 text-xs">
                <Star
                  size={10}
                  className="text-amber"
                  fill="currentColor"
                  aria-hidden="true"
                />
                <span className="font-mono text-amber">{item.rating}</span>
              </span>
              {item.duration && (
                <span className="text-xs font-mono text-text-muted">{item.duration}</span>
              )}
              {item.episodes != null && (
                <span className="text-xs font-mono text-text-muted">
                  {item.episodes.toLocaleString()} eps
                </span>
              )}
              {item.year && (
                <span className="text-xs text-text-muted">{item.year}</span>
              )}
            </div>
          </div>
        </div>

        {/* Platform availability ──────────────────────── */}
        <div className="mt-3.5 pt-3.5 border-t border-border">
          <div className="flex flex-wrap gap-1.5" role="list" aria-label="Platform availability">
            {PLATFORM_ORDER.map((serviceId) => {
              const meta      = SERVICE_META[serviceId];
              const available = Boolean(item.platforms[serviceId]);
              const isTrial   = TRIAL_SUBS.has(serviceId);
              const isSubscribed = USER_SUBS.has(serviceId);

              if (available && isSubscribed) {
                return (
                  <span
                    key={serviceId}
                    role="listitem"
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: meta.color + '18',
                      color: meta.color,
                    }}
                    title={isTrial ? `${meta.name} (trial access)` : `Included in ${meta.name}`}
                  >
                    <Check size={9} aria-hidden="true" />
                    {meta.name}
                    {isTrial && (
                      <span className="opacity-65 font-normal"> ·&nbsp;trial</span>
                    )}
                  </span>
                );
              }

              return (
                <span
                  key={serviceId}
                  role="listitem"
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-border/40 text-text-muted"
                  title={`Not available on ${meta.name}`}
                >
                  <span className="leading-none">–</span>
                  {meta.name}
                </span>
              );
            })}
          </div>

          {/* Access callout */}
          {accessCallout ? (
            <p className={`text-xs mt-2 flex items-center gap-1.5 ${accessCallout.cls}`}>
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${accessCallout.dot}`}
                aria-hidden="true"
              />
              {accessCallout.text}
            </p>
          ) : (
            <p className="text-xs mt-2 text-text-muted">
              Not on any of your current subscriptions
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-bg-primary/40">
        <span className="text-xs font-mono text-text-muted">
          {totalAvailable}/{PLATFORM_ORDER.length} platforms
        </span>
        <button
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            hasFreeAccess
              ? 'bg-teal text-bg-primary hover:bg-teal-hover'
              : trialAvailable.length > 0
              ? 'bg-amber/15 text-amber hover:bg-amber/25'
              : 'bg-border/40 text-text-muted cursor-not-allowed'
          }`}
          disabled={!hasFreeAccess && trialAvailable.length === 0}
          aria-label={
            hasFreeAccess
              ? `Listen to ${item.title}`
              : trialAvailable.length > 0
              ? `Try ${item.title} on Podimo`
              : `${item.title} unavailable`
          }
        >
          {hasFreeAccess
            ? 'Listen Now'
            : trialAvailable.length > 0
            ? 'Try on Podimo'
            : 'Unavailable'}
        </button>
      </div>
    </article>
  );
}

/* ── Content grid ─────────────────────────────────────── */
function ContentGrid({ items }: { items: ContentItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item) => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  );
}

/* ── Discover page ────────────────────────────────────── */
export default function Discover() {
  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');

  const stats = useMemo(() => ({
    total:      ALL_CONTENT.length,
    audiobooks: ALL_CONTENT.filter((c) => c.type === 'audiobook').length,
    podcasts:   ALL_CONTENT.filter((c) => c.type === 'podcast').length,
    free:       ALL_CONTENT.filter((c) =>
      PLATFORM_ORDER.some((id) => c.platforms[id] && ACTIVE_SUBS.has(id)),
    ).length,
  }), []);

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
        PLATFORM_ORDER.some((id) => c.platforms[id] && ACTIVE_SUBS.has(id)),
      );
    }

    return items;
  }, [query, filter]);

  const isFiltering  = query.trim().length > 0 || filter !== 'all';
  const trending     = useMemo(() => ALL_CONTENT.filter((c) => c.trending),  []);
  const nonTrending  = useMemo(() => ALL_CONTENT.filter((c) => !c.trending), []);

  const clearAll = () => { setQuery(''); setFilter('all'); };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Discover</h1>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <p className="text-sm text-text-secondary">
            Search titles across all your connected platforms at once.
          </p>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span className="font-mono text-text-primary">{stats.audiobooks}</span> audiobooks
            <span className="text-text-muted">·</span>
            <span className="font-mono text-text-primary">{stats.podcasts}</span> podcasts
            <span className="text-text-muted">·</span>
            <span className="font-mono text-teal">{stats.free}</span>
            <span className="text-teal">free on plan</span>
          </div>
        </div>
      </div>

      {/* Search bar */}
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
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
            aria-label="Clear search"
          >
            <X size={11} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Quick-search suggestions */}
      {!query && (
        <div className="flex items-center gap-2 flex-wrap -mt-2">
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

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Content filters">
        {FILTER_TABS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors ${
              filter === f.id
                ? 'bg-teal text-bg-primary'
                : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:border-text-muted/30'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Filtered / search results ── */}
      {isFiltering ? (
        <section aria-label="Search results">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">
              {filtered.length === 0 ? (
                'No results'
              ) : (
                <>
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                  {query && (
                    <span className="font-normal text-text-secondary ml-1">
                      for &ldquo;{query}&rdquo;
                    </span>
                  )}
                </>
              )}
            </h2>
            <button
              onClick={clearAll}
              className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors"
            >
              <X size={11} aria-hidden="true" />
              Clear filters
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-text-secondary text-sm">
                Nothing found for{' '}
                <span className="text-text-primary font-semibold">&ldquo;{query}&rdquo;</span>
              </p>
              <p className="text-xs text-text-muted mt-1">
                Try a different title, author, or genre
              </p>
              <button
                onClick={clearAll}
                className="mt-4 text-xs font-medium px-4 py-2 rounded-lg bg-teal-dim text-teal hover:bg-teal-dim-hover transition-colors"
              >
                Browse all titles
              </button>
            </div>
          ) : (
            <ContentGrid items={filtered} />
          )}
        </section>
      ) : (
        /* ── Default: trending + more ── */
        <>
          <section aria-label="Trending titles">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">Trending Now</h2>
              <span className="text-xs text-text-muted font-mono">{trending.length} titles</span>
            </div>
            <ContentGrid items={trending} />
          </section>

          <section aria-label="More titles">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">More to Explore</h2>
              <span className="text-xs text-text-muted font-mono">
                {nonTrending.length} titles
              </span>
            </div>
            <ContentGrid items={nonTrending} />
          </section>
        </>
      )}
    </div>
  );
}
