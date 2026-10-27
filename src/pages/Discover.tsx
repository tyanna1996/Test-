import { useState, useMemo, useEffect } from 'react';
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
  coverBg:     string;   // CSS background for the cover
  rating:      number;
  duration?:   string;
  episodes?:   number;
  year?:       number;
  description: string;
  platforms:   Record<string, boolean>;
  trending:    boolean;
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
    type: 'audiobook', genre: 'Self-Help', coverColor: '#FFFFFF',
    coverBg: 'linear-gradient(160deg, #00C9A7 0%, #00857A 100%)',
    rating: 4.8, duration: '5h 35m', year: 2018, trending: true,
    description: 'Tiny changes, remarkable results. Learn how building atomic habits can transform your life through the science of small improvements.',
    platforms: { audible: true, storytel: true, spotify: false, podimo: false },
  },
  {
    id: 'thinking-fast-slow', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman',
    type: 'audiobook', genre: 'Psychology', coverColor: '#FFFFFF',
    coverBg: 'linear-gradient(160deg, #1A1AFF 0%, #4B0082 100%)',
    rating: 4.6, duration: '20h 2m', year: 2011, trending: true,
    description: 'Nobel laureate Daniel Kahneman reveals the two systems that drive the way we think — and how they shape our judgements and decisions.',
    platforms: { audible: true, storytel: true, spotify: false, podimo: false },
  },
  {
    id: 'sapiens', title: 'Sapiens', author: 'Yuval Noah Harari',
    type: 'audiobook', genre: 'History', coverColor: '#1A1A1A',
    coverBg: 'linear-gradient(160deg, #F59E0B 0%, #D97706 100%)',
    rating: 4.7, duration: '15h 17m', year: 2011, trending: true,
    description: 'A brief history of humankind — from the Stone Age to the present, exploring how biology and history have defined us.',
    platforms: { audible: true, storytel: true, spotify: false, podimo: true },
  },
  {
    id: 'educated', title: 'Educated', author: 'Tara Westover',
    type: 'audiobook', genre: 'Memoir', coverColor: '#FFFFFF',
    coverBg: 'linear-gradient(160deg, #7C3AED 0%, #4C1D95 100%)',
    rating: 4.9, duration: '12h 11m', year: 2018, trending: false,
    description: 'A memoir about a young girl who, kept out of school, leaves her survivalist family and earns a PhD from Cambridge University.',
    platforms: { audible: true, storytel: true, spotify: false, podimo: false },
  },
  {
    id: 'subtle-art', title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson',
    type: 'audiobook', genre: 'Self-Help', coverColor: '#FFFFFF',
    coverBg: 'linear-gradient(160deg, #EF4444 0%, #991B1B 100%)',
    rating: 4.3, duration: '5h 17m', year: 2016, trending: false,
    description: 'A counterintuitive approach to living a good life — embrace the struggles that matter to you and let go of the rest.',
    platforms: { audible: true, storytel: true, spotify: true, podimo: true },
  },
  {
    id: 'becoming', title: 'Becoming', author: 'Michelle Obama',
    type: 'audiobook', genre: 'Memoir', coverColor: '#FFFFFF',
    coverBg: 'linear-gradient(160deg, #EC4899 0%, #BE185D 100%)',
    rating: 4.8, duration: '19h 3m', year: 2018, trending: true,
    description: 'Michelle Obama invites readers into her world, from her Chicago childhood to her years as First Lady.',
    platforms: { audible: true, storytel: true, spotify: true, podimo: false },
  },
  {
    id: 'power-of-now', title: 'The Power of Now', author: 'Eckhart Tolle',
    type: 'audiobook', genre: 'Self-Help', coverColor: '#1A1A1A',
    coverBg: 'linear-gradient(160deg, #BEF264 0%, #65A30D 100%)',
    rating: 4.4, duration: '7h 37m', year: 1997, trending: false,
    description: 'A guide to spiritual enlightenment. Living in the present moment is the key to true happiness and overcoming pain.',
    platforms: { audible: true, storytel: false, spotify: false, podimo: false },
  },
  {
    id: 'serial', title: 'Serial', author: 'Sarah Koenig',
    type: 'podcast', genre: 'True Crime', coverColor: '#FFFFFF',
    coverBg: 'linear-gradient(160deg, #DC2626 0%, #7F1D1D 100%)',
    rating: 4.9, episodes: 52, trending: true,
    description: 'Serial unfolds one story over the course of a season. Season 1 reinvestigated the 1999 murder of Hae Min Lee.',
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'the-daily', title: 'The Daily', author: 'New York Times',
    type: 'podcast', genre: 'News', coverColor: '#FFFFFF',
    coverBg: 'linear-gradient(160deg, #1D4ED8 0%, #1E3A8A 100%)',
    rating: 4.6, episodes: 2100, trending: true,
    description: 'This is what the news should sound like. 20 minutes every morning. Hosted by Michael Barbaro.',
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'crime-junkie', title: 'Crime Junkie', author: 'audiochuck',
    type: 'podcast', genre: 'True Crime', coverColor: '#FFFFFF',
    coverBg: 'linear-gradient(160deg, #B91C1C 0%, #450A0A 100%)',
    rating: 4.7, episodes: 380, trending: false,
    description: 'Every Monday, Ashley Flowers and Brit Prawat dive into a new crime case with facts only, zero fluff.',
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'hardcore-history', title: 'Hardcore History', author: 'Dan Carlin',
    type: 'podcast', genre: 'History', coverColor: '#FFFFFF',
    coverBg: 'linear-gradient(160deg, #92400E 0%, #451A03 100%)',
    rating: 4.9, episodes: 67, trending: true,
    description: 'Dan Carlin takes his "Martian" perspective to world history in a way that will turn anyone into a history fan.',
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'how-i-built-this', title: 'How I Built This', author: 'Guy Raz',
    type: 'podcast', genre: 'Business', coverColor: '#FFFFFF',
    coverBg: 'linear-gradient(160deg, #16A34A 0%, #14532D 100%)',
    rating: 4.7, episodes: 420, trending: false,
    description: 'Guy Raz dives into the stories behind the world\'s best-known companies and the innovators who built them.',
    platforms: { audible: false, storytel: false, spotify: true, podimo: false },
  },
  {
    id: 'lex-fridman', title: 'Lex Fridman Podcast', author: 'Lex Fridman',
    type: 'podcast', genre: 'Technology', coverColor: '#FFFFFF',
    coverBg: 'linear-gradient(160deg, #0E7490 0%, #164E63 100%)',
    rating: 4.6, episodes: 430, trending: false,
    description: 'Conversations about AI, science, technology, history, philosophy and the nature of intelligence and consciousness.',
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
  },
  {
    id: 'missing-cryptoqueen', title: 'The Missing Cryptoqueen', author: 'BBC Podcasts',
    type: 'podcast', genre: 'True Crime', coverColor: '#FFFFFF',
    coverBg: 'linear-gradient(160deg, #7C3AED 0%, #3B0764 100%)',
    rating: 4.5, episodes: 27, trending: false,
    description: 'Dr Ruja Ignatova persuaded millions to invest in OneCoin cryptocurrency. Then she disappeared.',
    platforms: { audible: false, storytel: false, spotify: false, podimo: true },
  },
];

/* ── Helpers ──────────────────────────────────────────── */
function shortTitle(title: string): string {
  // Return a display-friendly short version for the cover
  const cleaned = title.replace(/[^a-zA-Z\s]/g, '').trim();
  const words   = cleaned.split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 8).toUpperCase();
  if (words[0].length <= 4) return (words[0] + ' ' + words[1]).toUpperCase();
  return words[0].toUpperCase();
}

function accessInfo(item: ContentItem) {
  const active = PLAT_ORDER.filter((id) => item.platforms[id] && ACTIVE_SUBS.has(id));
  const trial  = PLAT_ORDER.filter((id) => item.platforms[id] && TRIAL_SUBS.has(id));
  const free   = active.length > 0;
  const any    = free || trial.length > 0;
  return { active, trial, free, any };
}

/* ── Cover artwork — fully CSS, no external images ───── */
function CoverArt({ item, size = 152 }: { item: ContentItem; size?: number }) {
  const short = shortTitle(item.title);
  const fontSize = short.length > 6 ? size * 0.14 : short.length > 4 ? size * 0.17 : size * 0.21;

  return (
    <div
      style={{
        width: '100%', height: '100%',
        background: item.coverBg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', justifyContent: 'flex-end',
        padding: size * 0.1,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Decorative circle top-right */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: -size * 0.18, right: -size * 0.18,
          width: size * 0.65, height: size * 0.65, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }}
      />
      {/* Decorative circle mid */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: size * 0.18, left: -size * 0.1,
          width: size * 0.4, height: size * 0.4, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }}
      />

      {/* Type badge */}
      <span
        style={{
          position: 'absolute', top: size * 0.07, left: size * 0.08,
          fontSize: size * 0.065, fontWeight: 700, letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase',
        }}
      >
        {item.type === 'audiobook' ? 'BOOK' : 'POD'}
      </span>

      {/* Big title text */}
      <p
        style={{
          fontSize, fontWeight: 900, lineHeight: 1.0,
          color: item.coverColor, letterSpacing: '-0.03em',
          wordBreak: 'break-word', hyphens: 'auto',
          marginBottom: size * 0.06, zIndex: 1,
          maxWidth: '100%',
          textShadow: item.coverColor === '#FFFFFF' ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
        }}
      >
        {short}
      </p>

      {/* Author */}
      <p
        style={{
          fontSize: size * 0.075, fontWeight: 500, lineHeight: 1.2,
          color: 'rgba(255,255,255,0.65)',
          zIndex: 1, maxWidth: '90%',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}
      >
        {item.author}
      </p>
    </div>
  );
}

/* ── Detail modal ─────────────────────────────────────── */
function DetailModal({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  const { trial, free } = accessInfo(item);
  const genre = GENRE_STYLES[item.genre] ?? { bg: '#F0FDF4', color: '#15803D' };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: 400, borderRadius: 28, background: '#FFFFFF', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover */}
        <div style={{ height: 200, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F8FF' }}>
          <div style={{ width: 120, height: 160, borderRadius: 16, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}>
            <CoverArt item={item} size={120} />
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ position: 'absolute', top: 12, right: 12, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: '20px 24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: genre.bg, color: genre.color }}>{item.genre}</span>
            <span style={{ fontSize: 11, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 3 }}>
              {item.type === 'audiobook' ? <Headphones size={11} /> : <Radio size={11} />}
              {item.type === 'audiobook' ? 'Audiobook' : 'Podcast'}
            </span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0A0A0A', lineHeight: 1.2, marginBottom: 4 }}>{item.title}</h2>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 14 }}>by {item.author}</p>

          <div style={{ display: 'flex', gap: 16, marginBottom: 14, fontSize: 13 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={13} fill="#F59E0B" style={{ color: '#F59E0B' }} />
              <strong style={{ color: '#0A0A0A' }}>{item.rating}</strong>
            </span>
            {item.duration  && <span style={{ color: '#9CA3AF' }}>{item.duration}</span>}
            {item.episodes != null && <span style={{ color: '#9CA3AF' }}>{item.episodes} eps</span>}
            {item.year      && <span style={{ color: '#9CA3AF' }}>{item.year}</span>}
          </div>

          <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6, marginBottom: 18 }}>{item.description}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {PLAT_ORDER.map((id) => {
              if (!item.platforms[id]) return null;
              const meta = SVC[id];
              const isTrial = TRIAL_SUBS.has(id);
              return (
                <span key={id} style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 999, background: meta.color + '18', color: meta.color, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Check size={10} />{meta.name}{isTrial ? ' · trial' : ''}
                </span>
              );
            })}
          </div>

          <button
            style={{ width: '100%', padding: 14, borderRadius: 16, fontSize: 15, fontWeight: 800, background: free ? '#0A0AFF' : trial.length > 0 ? '#F59E0B' : '#F3F4F6', color: free || trial.length > 0 ? '#FFFFFF' : '#9CA3AF', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
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

  return (
    <button
      onClick={onClick}
      className="poster-card group flex-shrink-0 cursor-pointer select-none text-left"
      style={{ width: 148, background: 'none', border: 'none', padding: 0, fontFamily: 'inherit' }}
      aria-label={`View ${item.title}`}
    >
      {/* Cover */}
      <div
        className="poster-cover relative rounded-2xl overflow-hidden"
        style={{ aspectRatio: '2/3', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', transition: 'box-shadow 200ms' }}
      >
        <CoverArt item={item} size={148} />

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)' }}
        >
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#0A0AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(10,10,255,0.4)' }}>
            <Play size={16} fill="white" style={{ color: 'white', marginLeft: 2 }} />
          </div>
        </div>

        {/* Free badge */}
        {free && (
          <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 999, background: '#DCFFF8', color: '#00897B', zIndex: 10 }}>
            FREE
          </div>
        )}
      </div>

      {/* Label */}
      <div style={{ marginTop: 10, paddingLeft: 2 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{item.title}</p>
        <p style={{ fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
          <Star size={9} fill="#F59E0B" style={{ color: '#F59E0B', display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
          {item.rating} · {item.author}
        </p>
      </div>
    </button>
  );
}

/* ── Scroll row ───────────────────────────────────────── */
function ScrollRow({ title, items, accentColor, onSelect }: { title: string; items: ContentItem[]; accentColor?: string; onSelect: (item: ContentItem) => void }) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.02em' }}>
          {accentColor && <span aria-hidden="true" style={{ color: accentColor, marginRight: 6 }}>✦</span>}
          {title}
        </h2>
        <button style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 2 }}>
          See all <ChevronRight size={12} />
        </button>
      </div>
      <div className="scroll-row" style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }} role="list">
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
    <div style={{ background: 'linear-gradient(135deg, #0A0AFF 0%, #6200EE 100%)', borderRadius: 24, padding: '36px 28px 32px', position: 'relative', overflow: 'hidden' }}>
      <span aria-hidden="true" style={{ position: 'absolute', top: 10, right: 18, fontSize: 96, fontWeight: 900, lineHeight: 1, color: '#BEFF00', opacity: 0.95, userSelect: 'none', fontFamily: 'Georgia, serif' }}>✦</span>
      <span aria-hidden="true" style={{ position: 'absolute', bottom: 16, right: 76, fontSize: 40, lineHeight: 1, color: '#FF45A6', opacity: 0.85, userSelect: 'none' }}>✿</span>

      <p style={{ fontSize: 10, fontWeight: 700, color: '#BEFF00', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>✦ All your platforms, one place</p>
      <h1 style={{ fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.0, marginBottom: 24, textTransform: 'uppercase', maxWidth: 420 }}>
        find your<br />next obsession
      </h1>

      <div style={{ position: 'relative', maxWidth: 520 }}>
        <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
        <input
          type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles, authors, genres…" aria-label="Search"
          style={{ width: '100%', background: '#FFFFFF', color: '#0A0A0A', border: 'none', outline: 'none', borderRadius: 16, padding: '14px 44px 14px 48px', fontSize: 14, fontFamily: 'inherit', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}
        />
        {query && (
          <button onClick={() => setQuery('')} aria-label="Clear" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 22, height: 22, borderRadius: '50%', background: '#F3F4F6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7280' }}>
            <X size={11} />
          </button>
        )}
      </div>

      {!query && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Try:</span>
          {SUGGESTIONS.slice(0, 4).map((s) => (
            <button key={s} onClick={() => setQuery(s)} style={{ fontSize: 11, fontWeight: 500, padding: '4px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', color: '#FFF', border: '1px solid rgba(255,255,255,0.22)', cursor: 'pointer', fontFamily: 'inherit' }}>{s}</button>
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
      items = items.filter((c) => c.title.toLowerCase().includes(q) || c.author.toLowerCase().includes(q) || c.genre.toLowerCase().includes(q));
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
  const clearAll    = () => { setQuery(''); setFilter('all'); };

  return (
    <div style={{ background: '#F8F8FF', minHeight: '100%' }}>
      <div style={{ padding: '20px 20px 48px', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

        <HeroBanner query={query} setQuery={setQuery} />

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="group" aria-label="Filter">
          {FILTER_TABS.map((f) => (
            <button
              key={f.id} onClick={() => setFilter(f.id)} aria-pressed={filter === f.id}
              style={{ fontSize: 13, fontWeight: 600, padding: '8px 20px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms', ...(filter === f.id ? { background: '#0A0AFF', color: '#FFF', border: '2px solid #0A0AFF' } : { background: '#FFF', color: '#0A0A0A', border: '2px solid #E5E7EB' }) }}
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
                <X size={11} /> Clear
              </button>
            </div>
            {filtered.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', background: '#FFF', borderRadius: 20, border: '1.5px solid #F0F0F0' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0A' }}>Nothing found for &ldquo;{query}&rdquo;</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Try a title, author name, or genre</p>
                <button onClick={clearAll} style={{ marginTop: 20, fontSize: 13, fontWeight: 700, padding: '10px 24px', borderRadius: 999, background: '#0A0AFF', color: '#FFF', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Browse all</button>
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

      {selected && <DetailModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
