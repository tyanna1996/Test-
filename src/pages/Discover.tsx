import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, X, Star, Check, Play, ChevronRight, Headphones, Radio, SlidersHorizontal } from 'lucide-react';

type ContentType = 'audiobook' | 'podcast';
type FilterTab   = 'all' | 'audiobooks' | 'podcasts' | 'free';

interface ContentItem {
  id: string; title: string; author: string; type: ContentType; genre: string;
  coverColor: string; coverBg: string; coverImage?: string;
  rating: number; duration?: string; episodes?: number; year?: number;
  description: string; platforms: Record<string, boolean>; trending: boolean;
}

const PLAT_ORDER = ['audible', 'storytel', 'podimo', 'spotify'] as const;

const SVC: Record<string, { name: string; color: string; price: string; desc: string }> = {
  audible:  { name: 'Audible',  color: '#f59e0b', price: '$14.95/mo', desc: "World's largest audiobook catalog" },
  storytel: { name: 'Storytel', color: '#8b5cf6', price: '$14.99/mo', desc: 'Unlimited audiobooks & e-books' },
  podimo:   { name: 'Podimo',   color: '#ef4444', price: '$8.99/mo',  desc: 'Exclusive podcasts & audiobooks' },
  spotify:  { name: 'Spotify',  color: '#22c55e', price: '$11.99/mo', desc: 'Music, podcasts & audiobooks' },
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

const OL = (isbn: string) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

const ALL_CONTENT: ContentItem[] = [
  {
    id: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear',
    type: 'audiobook', genre: 'Self-Help', coverColor: '#FFFFFF',
    coverBg: 'linear-gradient(160deg, #00C9A7 0%, #00857A 100%)',
    coverImage: OL('9780735211292'),
    rating: 4.8, duration: '5h 35m', year: 2018, trending: true,
    description: 'Tiny changes, remarkable results. Learn how building atomic habits can transform your life through the science of small improvements.',
    platforms: { audible: true, storytel: true, spotify: false, podimo: false },
  },
  {
    id: 'thinking-fast-slow', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman',
    type: 'audiobook', genre: 'Psychology', coverColor: '#FFFFFF',
    coverBg: 'linear-gradient(160deg, #1A1AFF 0%, #4B0082 100%)',
    coverImage: OL('9780374533557'),
    rating: 4.6, duration: '20h 2m', year: 2011, trending: true,
    description: 'Nobel laureate Daniel Kahneman reveals the two systems that drive the way we think — and how they shape our judgements and decisions.',
    platforms: { audible: true, storytel: true, spotify: false, podimo: false },
  },
  {
    id: 'sapiens', title: 'Sapiens', author: 'Yuval Noah Harari',
    type: 'audiobook', genre: 'History', coverColor: '#1A1A1A',
    coverBg: 'linear-gradient(160deg, #F59E0B 0%, #D97706 100%)',
    coverImage: OL('9780062316097'),
    rating: 4.7, duration: '15h 17m', year: 2011, trending: true,
    description: 'A brief history of humankind — from the Stone Age to the present, exploring how biology and history have defined us.',
    platforms: { audible: true, storytel: true, spotify: false, podimo: true },
  },
  {
    id: 'educated', title: 'Educated', author: 'Tara Westover',
    type: 'audiobook', genre: 'Memoir', coverColor: '#FFFFFF',
    coverBg: 'linear-gradient(160deg, #7C3AED 0%, #4C1D95 100%)',
    coverImage: OL('9780399590504'),
    rating: 4.9, duration: '12h 11m', year: 2018, trending: false,
    description: 'A memoir about a young girl who, kept out of school, leaves her survivalist family and earns a PhD from Cambridge University.',
    platforms: { audible: true, storytel: true, spotify: false, podimo: false },
  },
  {
    id: 'subtle-art', title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson',
    type: 'audiobook', genre: 'Self-Help', coverColor: '#FFFFFF',
    coverBg: 'linear-gradient(160deg, #EF4444 0%, #991B1B 100%)',
    coverImage: OL('9780062457714'),
    rating: 4.3, duration: '5h 17m', year: 2016, trending: false,
    description: 'A counterintuitive approach to living a good life — embrace the struggles that matter to you and let go of the rest.',
    platforms: { audible: true, storytel: true, spotify: true, podimo: true },
  },
  {
    id: 'becoming', title: 'Becoming', author: 'Michelle Obama',
    type: 'audiobook', genre: 'Memoir', coverColor: '#FFFFFF',
    coverBg: 'linear-gradient(160deg, #EC4899 0%, #BE185D 100%)',
    coverImage: OL('9781524763138'),
    rating: 4.8, duration: '19h 3m', year: 2018, trending: true,
    description: 'Michelle Obama invites readers into her world, from her Chicago childhood to her years as First Lady.',
    platforms: { audible: true, storytel: true, spotify: true, podimo: false },
  },
  {
    id: 'power-of-now', title: 'The Power of Now', author: 'Eckhart Tolle',
    type: 'audiobook', genre: 'Self-Help', coverColor: '#1A1A1A',
    coverBg: 'linear-gradient(160deg, #BEF264 0%, #65A30D 100%)',
    coverImage: OL('9781577314806'),
    rating: 4.4, duration: '7h 37m', year: 1997, trending: false,
    description: 'A guide to spiritual enlightenment. Living in the present moment is the key to true happiness and overcoming pain.',
    platforms: { audible: true, storytel: false, spotify: false, podimo: false },
  },
  {
    id: 'serial', title: 'Serial', author: 'Sarah Koenig',
    type: 'podcast', genre: 'True Crime', coverColor: '#FFFFFF',
    coverBg: 'linear-gradient(160deg, #DC2626 0%, #7F1D1D 100%)',
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/4/43/Serial_podcast_logo.png',
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
    description: "Guy Raz dives into the stories behind the world's best-known companies and the innovators who built them.",
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

function shortTitle(title: string): string {
  const cleaned = title.replace(/[^a-zA-Z\s]/g, '').trim();
  const words   = cleaned.split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 8).toUpperCase();
  if (words[0].length <= 4) return (words[0] + ' ' + words[1]).toUpperCase();
  return words[0].toUpperCase();
}

// ── Onboarding ────────────────────────────────────────────────────────────────

function OnboardingModal({ initialSubs, onComplete, onSkip, isEdit }: {
  initialSubs: string[]; onComplete: (subs: string[]) => void; onSkip: () => void; isEdit: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSubs));

  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <div className="mono-fade-in" style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#080812', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', overflowY: 'auto' }}>
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: 36 }}>
          <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.06em', color: '#FFF' }}>
            MO<span style={{ color: '#0A0AFF' }}>N</span>O
          </span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#FFF', textAlign: 'center', marginBottom: 8, letterSpacing: '-0.03em' }}>
          {isEdit ? 'Update your services' : 'Welcome to MONO'}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginBottom: 32, lineHeight: 1.6, maxWidth: 300 }}>
          {isEdit
            ? 'Toggle the services you currently pay for.'
            : "Which audio services do you pay for? We'll show exactly what you can listen to for free."}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', marginBottom: 24 }}>
          {PLAT_ORDER.map(id => {
            const p   = SVC[id];
            const isOn = selected.has(id);
            return (
              <button key={id} onClick={() => toggle(id)} style={{
                padding: '16px 14px', borderRadius: 18, textAlign: 'left', cursor: 'pointer',
                fontFamily: 'inherit', border: `2px solid ${isOn ? p.color : 'rgba(255,255,255,0.08)'}`,
                background: isOn ? p.color + '18' : 'rgba(255,255,255,0.04)',
                transition: 'all 200ms',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: isOn ? p.color : '#FFF' }}>{p.name}</span>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: isOn ? p.color : 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 200ms',
                  }}>
                    {isOn && <Check size={11} style={{ color: '#FFF' }} />}
                  </div>
                </div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 6, lineHeight: 1.4 }}>{p.desc}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: isOn ? p.color : 'rgba(255,255,255,0.2)' }}>{p.price}</p>
              </button>
            );
          })}
        </div>

        <button onClick={() => onComplete([...selected])} style={{
          width: '100%', padding: '14px 32px', borderRadius: 999, fontSize: 14, fontWeight: 800,
          background: '#0A0AFF', color: '#FFF', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          marginBottom: 12, transition: 'opacity 150ms',
        }}>
          {selected.size > 0
            ? `${isEdit ? 'Save' : 'Start listening'} — ${selected.size} service${selected.size > 1 ? 's' : ''}`
            : isEdit ? 'Save (no services)' : 'Continue without services'}
        </button>
        {!isEdit && (
          <button onClick={onSkip} style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}

// ── Subscription bar ──────────────────────────────────────────────────────────

function SubBar({ userSubs, onEdit }: { userSubs: string[]; onEdit: () => void }) {
  if (userSubs.length === 0) return (
    <button onClick={onEdit} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: '#F0F0FF', border: '1.5px dashed #C7C7FF', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left' }}>
      <SlidersHorizontal size={14} style={{ color: '#0A0AFF' }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: '#0A0AFF' }}>Set up your subscriptions to see what's free for you</span>
    </button>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Your plan:</span>
      {userSubs.map(id => (
        <span key={id} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: SVC[id].color + '18', color: SVC[id].color }}>
          {SVC[id].name}
        </span>
      ))}
      <button onClick={onEdit} style={{ fontSize: 11, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
        <SlidersHorizontal size={10} /> Change
      </button>
    </div>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ width: 180, flexShrink: 0 }}>
      <div className="mono-skeleton" style={{ width: '100%', aspectRatio: '2/3', borderRadius: 16 }} />
      <div className="mono-skeleton" style={{ height: 13, width: '75%', marginTop: 10, borderRadius: 6 }} />
      <div className="mono-skeleton" style={{ height: 11, width: '50%', marginTop: 6, borderRadius: 6 }} />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div>
      <div className="mono-skeleton" style={{ height: 20, width: 180, borderRadius: 8, marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: 16, overflow: 'hidden' }}>
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

// ── Cover components ──────────────────────────────────────────────────────────

function GradientCover({ item, size }: { item: ContentItem; size: number }) {
  const short    = shortTitle(item.title);
  const fontSize = short.length > 6 ? size * 0.14 : short.length > 4 ? size * 0.17 : size * 0.21;
  return (
    <div style={{ width: '100%', height: '100%', background: item.coverBg, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', padding: size * 0.1, position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden="true" style={{ position: 'absolute', top: -size * 0.18, right: -size * 0.18, width: size * 0.65, height: size * 0.65, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', top: size * 0.18, left: -size * 0.1, width: size * 0.4, height: size * 0.4, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <span style={{ position: 'absolute', top: size * 0.07, left: size * 0.08, fontSize: size * 0.065, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
        {item.type === 'audiobook' ? 'BOOK' : 'POD'}
      </span>
      <p style={{ fontSize, fontWeight: 900, lineHeight: 1.0, color: item.coverColor, letterSpacing: '-0.03em', wordBreak: 'break-word', marginBottom: size * 0.06, zIndex: 1, maxWidth: '100%', textShadow: item.coverColor === '#FFFFFF' ? '0 1px 4px rgba(0,0,0,0.2)' : 'none' }}>
        {short}
      </p>
      <p style={{ fontSize: size * 0.075, fontWeight: 500, lineHeight: 1.2, color: 'rgba(255,255,255,0.65)', zIndex: 1, maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {item.author}
      </p>
    </div>
  );
}

function CoverArt({ item, size = 180 }: { item: ContentItem; size?: number }) {
  const [loaded, setLoaded] = useState(false);
  const [error,  setError]  = useState(false);

  useEffect(() => { setLoaded(false); setError(false); }, [item.id]);

  if (!item.coverImage || error) return <GradientCover item={item} size={size} />;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0 }}><GradientCover item={item} size={size} /></div>
      <img
        src={item.coverImage} alt={item.title}
        onLoad={() => setLoaded(true)} onError={() => setError(true)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: loaded ? 1 : 0, transition: 'opacity 0.35s ease' }}
      />
    </div>
  );
}

// ── Detail modal ──────────────────────────────────────────────────────────────

function DetailModal({ item, onClose, isFree }: { item: ContentItem; onClose: () => void; isFree: boolean }) {
  const genre = GENRE_STYLES[item.genre] ?? { bg: '#F0FDF4', color: '#15803D' };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="mono-fade-in fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
      <div className="mono-slide-up" style={{ width: '100%', maxWidth: 400, borderRadius: 28, background: '#FFFFFF', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ height: 200, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F4FF' }}>
          <div style={{ width: 120, height: 160, borderRadius: 16, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}>
            <CoverArt item={item} size={120} />
          </div>
          <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 12, right: 12, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
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
          <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.65, marginBottom: 18 }}>{item.description}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {PLAT_ORDER.map(id => {
              if (!item.platforms[id]) return null;
              const s = SVC[id];
              return (
                <span key={id} style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 999, background: s.color + '18', color: s.color, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Check size={10} />{s.name}
                </span>
              );
            })}
          </div>

          {isFree ? (
            <button style={{ width: '100%', padding: 14, borderRadius: 16, fontSize: 15, fontWeight: 800, background: '#0A0AFF', color: '#FFF', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Play size={14} fill="currentColor" /> Listen Free
            </button>
          ) : (
            <div style={{ padding: '12px 16px', borderRadius: 14, background: '#F9FAFB', border: '1px solid #F0F0F0', fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
              Not on your current plan — add a service above to unlock
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Content card ──────────────────────────────────────────────────────────────

function ContentCard({ item, onClick, isFree, index }: { item: ContentItem; onClick: () => void; isFree: boolean; index: number }) {
  return (
    <button
      onClick={onClick}
      className="poster-card group flex-shrink-0 cursor-pointer select-none text-left mono-fade-up"
      style={{ width: 180, background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', animationDelay: `${index * 0.04}s` }}
      aria-label={`View ${item.title}`}
    >
      <div className="poster-cover relative rounded-2xl overflow-hidden" style={{ aspectRatio: '2/3', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
        <CoverArt item={item} size={180} />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#0A0AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(10,10,255,0.4)' }}>
            <Play size={18} fill="white" style={{ color: 'white', marginLeft: 2 }} />
          </div>
        </div>
        {isFree && (
          <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 999, background: '#DCFFF8', color: '#00897B', zIndex: 10 }}>FREE</div>
        )}
      </div>
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

// ── Scroll row ────────────────────────────────────────────────────────────────

function ScrollRow({ title, items, accentColor, onSelect, isFree, animKey, onSeeAll }: {
  title: string; items: ContentItem[]; accentColor?: string;
  onSelect: (item: ContentItem) => void; isFree: (item: ContentItem) => boolean;
  animKey: number; onSeeAll?: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.02em' }}>
          {accentColor && <span aria-hidden="true" style={{ color: accentColor, marginRight: 6 }}>✦</span>}
          {title}
        </h2>
        {onSeeAll && (
          <button onClick={onSeeAll} style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 2 }}>
            See all <ChevronRight size={12} />
          </button>
        )}
      </div>
      <div className="scroll-row" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }} role="list">
        {items.map((item, i) => (
          <div key={`${animKey}-${item.id}`} role="listitem">
            <ContentCard item={item} onClick={() => onSelect(item)} isFree={isFree(item)} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Hero banner ───────────────────────────────────────────────────────────────

function HeroBanner({ query, setQuery, freeCount, hasSubs }: { query: string; setQuery: (q: string) => void; freeCount: number; hasSubs: boolean }) {
  return (
    <div className="mono-fade-up" style={{ background: 'linear-gradient(135deg, #0A0AFF 0%, #6200EE 100%)', borderRadius: 24, padding: '22px 28px 20px', position: 'relative', overflow: 'hidden', animationDelay: '0s' }}>
      <span aria-hidden="true" style={{ position: 'absolute', top: 8, right: 16, fontSize: 64, fontWeight: 900, lineHeight: 1, color: '#BEFF00', opacity: 0.95, userSelect: 'none', fontFamily: 'Georgia, serif' }}>✦</span>
      <span aria-hidden="true" style={{ position: 'absolute', bottom: 12, right: 62, fontSize: 28, lineHeight: 1, color: '#FF45A6', opacity: 0.85, userSelect: 'none' }}>✿</span>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#BEFF00', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>✦ All your platforms, one place</p>
      <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, color: '#FFF', letterSpacing: '-0.03em', lineHeight: 1.0, marginBottom: 8, textTransform: 'uppercase', maxWidth: 400 }}>
        find your<br />next obsession
      </h1>
      {hasSubs && freeCount > 0 && (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>
          <span style={{ color: '#BEFF00', fontWeight: 700 }}>{freeCount} titles</span> free on your plan
        </p>
      )}
      {!hasSubs && <div style={{ marginBottom: 14 }} />}
      <div style={{ position: 'relative', maxWidth: 520 }}>
        <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
        <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search titles, authors, genres…" aria-label="Search" style={{ width: '100%', background: '#FFF', color: '#0A0A0A', border: 'none', outline: 'none', borderRadius: 16, padding: '12px 44px 12px 48px', fontSize: 14, fontFamily: 'inherit', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }} />
        {query && (
          <button onClick={() => setQuery('')} aria-label="Clear" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 22, height: 22, borderRadius: '50%', background: '#F3F4F6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7280' }}>
            <X size={11} />
          </button>
        )}
      </div>
      {!query && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Try:</span>
          {SUGGESTIONS.slice(0, 4).map(s => (
            <button key={s} onClick={() => setQuery(s)} style={{ fontSize: 11, fontWeight: 500, padding: '4px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', color: '#FFF', border: '1px solid rgba(255,255,255,0.22)', cursor: 'pointer', fontFamily: 'inherit' }}>{s}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Discover() {
  const [userSubs, setUserSubs] = useState<Set<string>>(() => {
    try {
      const s = localStorage.getItem('mono_subs');
      if (s) return new Set(JSON.parse(s) as string[]);
    } catch {}
    return new Set();
  });
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem('mono_subs'); } catch { return true; }
  });
  const [editingSubs, setEditingSubs] = useState(false);

  const [query,    setQuery]    = useState('');
  const [filter,   setFilter]   = useState<FilterTab>('all');
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [animKey,  setAnimKey]  = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const completeOnboarding = useCallback((subs: string[]) => {
    try { localStorage.setItem('mono_subs', JSON.stringify(subs)); } catch {}
    setUserSubs(new Set(subs));
    setShowOnboarding(false);
    setEditingSubs(false);
    setAnimKey(k => k + 1);
  }, []);

  const isFree = useCallback((item: ContentItem) =>
    PLAT_ORDER.some(id => item.platforms[id] && userSubs.has(id)),
    [userSubs]
  );

  const freeCount = useMemo(() => ALL_CONTENT.filter(c => isFree(c)).length, [isFree]);

  const handleFilter = (f: FilterTab) => {
    setFilter(f);
    setAnimKey(k => k + 1);
  };

  const filtered = useMemo(() => {
    let items = ALL_CONTENT;
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(c => c.title.toLowerCase().includes(q) || c.author.toLowerCase().includes(q) || c.genre.toLowerCase().includes(q));
    }
    if (filter === 'audiobooks') items = items.filter(c => c.type === 'audiobook');
    if (filter === 'podcasts')   items = items.filter(c => c.type === 'podcast');
    if (filter === 'free')       items = items.filter(c => isFree(c));
    return items;
  }, [query, filter, isFree]);

  const isFiltering = query.trim().length > 0 || filter !== 'all';
  const trending    = useMemo(() => ALL_CONTENT.filter(c => c.trending), []);
  const audiobooks  = useMemo(() => ALL_CONTENT.filter(c => c.type === 'audiobook'), []);
  const podcasts    = useMemo(() => ALL_CONTENT.filter(c => c.type === 'podcast'), []);
  const clearAll    = () => { setQuery(''); handleFilter('all'); };

  return (
    <div style={{ background: '#F8F8FF', minHeight: '100%' }}>
      {(showOnboarding || editingSubs) && (
        <OnboardingModal
          initialSubs={[...userSubs]}
          onComplete={completeOnboarding}
          onSkip={() => { setShowOnboarding(false); setEditingSubs(false); }}
          isEdit={editingSubs}
        />
      )}

      <div style={{ padding: '20px 20px 48px', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <HeroBanner query={query} setQuery={setQuery} freeCount={freeCount} hasSubs={userSubs.size > 0} />
        <SubBar userSubs={[...userSubs]} onEdit={() => setEditingSubs(true)} />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="group" aria-label="Filter">
          {FILTER_TABS.map(f => (
            <button key={f.id} onClick={() => handleFilter(f.id)} aria-pressed={filter === f.id} style={{ fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms', display: 'flex', alignItems: 'center', gap: 6, ...(filter === f.id ? { background: '#0A0AFF', color: '#FFF', border: '2px solid #0A0AFF' } : { background: '#FFF', color: '#0A0A0A', border: '2px solid #E5E7EB' }) }}>
              {f.label}
              {f.id === 'free' && freeCount > 0 && (
                <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 999, background: filter === 'free' ? 'rgba(255,255,255,0.25)' : '#0A0AFF1A', color: filter === 'free' ? '#FFF' : '#0A0AFF' }}>
                  {freeCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <> <SkeletonRow /> <SkeletonRow /> <SkeletonRow /> </>
        ) : isFiltering ? (
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
                {filter === 'free' && userSubs.size === 0 ? (
                  <>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0A' }}>No services selected yet</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Add your subscriptions to see what's free for you</p>
                    <button onClick={() => setEditingSubs(true)} style={{ marginTop: 20, fontSize: 13, fontWeight: 700, padding: '10px 24px', borderRadius: 999, background: '#0A0AFF', color: '#FFF', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Set up services</button>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0A' }}>Nothing found for "{query}"</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Try a title, author name, or genre</p>
                    <button onClick={clearAll} style={{ marginTop: 20, fontSize: 13, fontWeight: 700, padding: '10px 24px', borderRadius: 999, background: '#0A0AFF', color: '#FFF', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Browse all</button>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {filtered.map((item, i) => <ContentCard key={`${animKey}-${item.id}`} item={item} onClick={() => setSelected(item)} isFree={isFree(item)} index={i} />)}
              </div>
            )}
          </section>
        ) : (
          <>
            <ScrollRow title="Trending Right Now" items={trending}   accentColor="#FF2D87" onSelect={setSelected} isFree={isFree} animKey={animKey} />
            <ScrollRow title="Audiobooks"          items={audiobooks} accentColor="#0A0AFF" onSelect={setSelected} isFree={isFree} animKey={animKey} onSeeAll={() => handleFilter('audiobooks')} />
            <ScrollRow title="Podcasts"            items={podcasts}   accentColor="#8B5CF6" onSelect={setSelected} isFree={isFree} animKey={animKey} onSeeAll={() => handleFilter('podcasts')} />
          </>
        )}
      </div>

      {selected && <DetailModal item={selected} onClose={() => setSelected(null)} isFree={isFree(selected)} />}
    </div>
  );
}
