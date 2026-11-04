import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, X, Star, Check, Play, Headphones, Radio } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
type ContentType = 'audiobook' | 'podcast';

interface ContentItem {
  id: string; title: string; author: string; type: ContentType; genre: string;
  coverColor: string; coverBg: string; coverImage?: string;
  rating: number; duration?: string; episodes?: number; year?: number;
  description: string; platforms: Record<string, boolean>; trending: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const PLAT_ORDER = ['audible', 'storytel', 'podimo', 'spotify'] as const;

const SVC: Record<string, { name: string; color: string; price: string; desc: string; logoBg: string; logoColor: string }> = {
  audible:  { name: 'Audible',  color: '#f59e0b', price: '$14.95/mo', desc: "World's largest audiobook catalog", logoBg: '#232F3E', logoColor: '#F49C20' },
  storytel: { name: 'Storytel', color: '#8b5cf6', price: '$14.99/mo', desc: 'Unlimited audiobooks & e-books',    logoBg: '#F5F5F5', logoColor: '#F4631E' },
  podimo:   { name: 'Podimo',   color: '#ef4444', price: '$8.99/mo',  desc: 'Exclusive podcasts & audiobooks',  logoBg: '#5B2D8E', logoColor: '#FFFFFF' },
  spotify:  { name: 'Spotify',  color: '#22c55e', price: '$11.99/mo', desc: 'Music, podcasts & audiobooks',     logoBg: '#191414', logoColor: '#1DB954' },
};

const GENRE_GRADIENTS: Record<string, { bg: string; color: string }> = {
  'True Crime':       { bg: 'linear-gradient(160deg,#DC2626 0%,#7F1D1D 100%)',  color: '#FFF' },
  'News':             { bg: 'linear-gradient(160deg,#1D4ED8 0%,#1E3A8A 100%)',  color: '#FFF' },
  'Business':         { bg: 'linear-gradient(160deg,#16A34A 0%,#14532D 100%)',  color: '#FFF' },
  'Technology':       { bg: 'linear-gradient(160deg,#0E7490 0%,#164E63 100%)',  color: '#FFF' },
  'History':          { bg: 'linear-gradient(160deg,#92400E 0%,#451A03 100%)',  color: '#FFF' },
  'Comedy':           { bg: 'linear-gradient(160deg,#F59E0B 0%,#B45309 100%)',  color: '#1A1A1A' },
  'Society & Culture':{ bg: 'linear-gradient(160deg,#7C3AED 0%,#4C1D95 100%)',  color: '#FFF' },
  'Science':          { bg: 'linear-gradient(160deg,#6D28D9 0%,#2E1065 100%)',  color: '#FFF' },
  'Health & Fitness': { bg: 'linear-gradient(160deg,#EC4899 0%,#9D174D 100%)',  color: '#FFF' },
  'Self-Help':        { bg: 'linear-gradient(160deg,#00C9A7 0%,#00857A 100%)',  color: '#FFF' },
  'Psychology':       { bg: 'linear-gradient(160deg,#7C3AED 0%,#4C1D95 100%)',  color: '#FFF' },
  'Memoir':           { bg: 'linear-gradient(160deg,#EC4899 0%,#BE185D 100%)',  color: '#FFF' },
};
const DEFAULT_GRAD = { bg: 'linear-gradient(160deg,#374151 0%,#111827 100%)', color: '#FFF' };

const OL = (isbn: string) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

const CATEGORIES = ['True Crime', 'News', 'Business', 'Technology', 'History', 'Comedy', 'Self-Help', 'Society & Culture', 'Science'];

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:        '#F6F4ED',
  surface:   '#FFFFFF',
  fg:        '#1A1E2E',
  muted:     '#5C6272',
  accent:    '#009E7E',
  warm:      '#009E7E',
  border:    '#D4D2CA',
  borderSoft:'#E0DED6',
} as const;

const fDisplay = "'DM Serif Display', Georgia, serif";
const fMono    = "'DM Mono', 'Courier New', monospace";
const fSans    = "'DM Sans', system-ui, sans-serif";

// ── Hardcoded audiobooks ──────────────────────────────────────────────────────
const AUDIOBOOKS: ContentItem[] = [
  { id:'atomic-habits', title:'Atomic Habits', author:'James Clear', type:'audiobook', genre:'Self-Help', coverColor:'#FFF', coverBg:'linear-gradient(160deg,#00C9A7 0%,#00857A 100%)', coverImage:OL('9780735211292'), rating:4.8, duration:'5h 35m', year:2018, trending:true, description:'Tiny changes, remarkable results. Build atomic habits that compound into transformation.', platforms:{audible:true,storytel:true,spotify:false,podimo:false} },
  { id:'thinking-fast', title:'Thinking, Fast and Slow', author:'Daniel Kahneman', type:'audiobook', genre:'Psychology', coverColor:'#FFF', coverBg:'linear-gradient(160deg,#1A1AFF 0%,#4B0082 100%)', coverImage:OL('9780374533557'), rating:4.6, duration:'20h 2m', year:2011, trending:true, description:'Nobel laureate Kahneman reveals the two systems that drive the way we think.', platforms:{audible:true,storytel:true,spotify:false,podimo:false} },
  { id:'sapiens', title:'Sapiens', author:'Yuval Noah Harari', type:'audiobook', genre:'History', coverColor:'#1A1A1A', coverBg:'linear-gradient(160deg,#F59E0B 0%,#D97706 100%)', coverImage:OL('9780062316097'), rating:4.7, duration:'15h 17m', year:2011, trending:true, description:'A brief history of humankind — from the Stone Age through the present.', platforms:{audible:true,storytel:true,spotify:false,podimo:true} },
  { id:'educated', title:'Educated', author:'Tara Westover', type:'audiobook', genre:'Memoir', coverColor:'#FFF', coverBg:'linear-gradient(160deg,#7C3AED 0%,#4C1D95 100%)', coverImage:OL('9780399590504'), rating:4.9, duration:'12h 11m', year:2018, trending:false, description:'A memoir about a woman kept out of school who earns a PhD from Cambridge.', platforms:{audible:true,storytel:true,spotify:false,podimo:false} },
  { id:'becoming', title:'Becoming', author:'Michelle Obama', type:'audiobook', genre:'Memoir', coverColor:'#FFF', coverBg:'linear-gradient(160deg,#EC4899 0%,#BE185D 100%)', coverImage:OL('9781524763138'), rating:4.8, duration:'19h 3m', year:2018, trending:true, description:'Michelle Obama invites readers into her world, from Chicago to the White House.', platforms:{audible:true,storytel:true,spotify:true,podimo:false} },
  { id:'subtle-art', title:"The Subtle Art of Not Giving a F*ck", author:'Mark Manson', type:'audiobook', genre:'Self-Help', coverColor:'#FFF', coverBg:'linear-gradient(160deg,#EF4444 0%,#991B1B 100%)', coverImage:OL('9780062457714'), rating:4.3, duration:'5h 17m', year:2016, trending:false, description:'A counterintuitive approach to living a good life.', platforms:{audible:true,storytel:true,spotify:true,podimo:true} },
  { id:'power-of-now', title:'The Power of Now', author:'Eckhart Tolle', type:'audiobook', genre:'Self-Help', coverColor:'#1A1A1A', coverBg:'linear-gradient(160deg,#BEF264 0%,#65A30D 100%)', coverImage:OL('9781577314806'), rating:4.4, duration:'7h 37m', year:1997, trending:false, description:'A guide to spiritual enlightenment through living in the present moment.', platforms:{audible:true,storytel:false,spotify:false,podimo:false} },
];

// ── iTunes fetch ──────────────────────────────────────────────────────────────
interface ITunesResult {
  collectionId: number; collectionName: string; artistName: string;
  artworkUrl600: string; trackCount: number; primaryGenreName: string; releaseDate: string;
}

function itunesResultToItem(r: ITunesResult, trending: boolean): ContentItem {
  const genre = r.primaryGenreName || 'Podcasts';
  const grad  = GENRE_GRADIENTS[genre] ?? DEFAULT_GRAD;
  return {
    id: `itunes-${r.collectionId}`, title: r.collectionName, author: r.artistName,
    type: 'podcast', genre, coverColor: grad.color, coverBg: grad.bg,
    coverImage: r.artworkUrl600, rating: 4.5, episodes: r.trackCount,
    year: r.releaseDate ? new Date(r.releaseDate).getFullYear() : undefined,
    description: `A ${genre.toLowerCase()} podcast with ${r.trackCount} episodes.`,
    platforms: { audible: false, storytel: false, spotify: true, podimo: true },
    trending,
  };
}

const GENRE_TERMS = [
  { term: 'true crime',                 trending: true  },
  { term: 'daily news politics',        trending: true  },
  { term: 'history documentary',        trending: true  },
  { term: 'business entrepreneur',      trending: false },
  { term: 'technology ai',              trending: false },
  { term: 'comedy humor',              trending: false },
  { term: 'society culture',           trending: false },
  { term: 'health fitness',            trending: false },
];

async function fetchDefaultPodcasts(): Promise<ContentItem[]> {
  const seen = new Set<number>();
  const results: ContentItem[] = [];
  await Promise.allSettled(
    GENRE_TERMS.map(async ({ term, trending }) => {
      try {
        const res  = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=podcast&entity=podcast&limit=6`);
        const data = await res.json() as { results: ITunesResult[] };
        for (const r of data.results) {
          if (!seen.has(r.collectionId) && r.trackCount > 5) {
            seen.add(r.collectionId);
            results.push(itunesResultToItem(r, trending));
          }
        }
      } catch {}
    })
  );
  return results;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function shortTitle(title: string) {
  const words = title.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 8).toUpperCase();
  if (words[0].length <= 4) return (words[0] + ' ' + words[1]).toUpperCase();
  return words[0].toUpperCase();
}

function freePlatform(item: ContentItem, subs: Set<string>): string | null {
  for (const id of PLAT_ORDER) {
    if (item.platforms[id] && subs.has(id)) return SVC[id].name;
  }
  return null;
}

// ── SectionLabel ──────────────────────────────────────────────────────────────
function SectionLabel({ text, action, onAction }: { text: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <span style={{ fontFamily: fMono, fontSize: 9, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.muted }}>{text}</span>
      {action && onAction && (
        <button onClick={onAction} style={{ fontFamily: fMono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>{action}</button>
      )}
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider() {
  return <hr style={{ border: 'none', borderTop: `1.5px solid ${C.border}`, margin: 0 }} />;
}

// ── CoverArt ──────────────────────────────────────────────────────────────────
function GradientCover({ item, size }: { item: ContentItem; size: number }) {
  const short    = shortTitle(item.title);
  const fontSize = short.length > 6 ? size * 0.14 : short.length > 4 ? size * 0.17 : size * 0.21;
  return (
    <div style={{ width: '100%', height: '100%', background: item.coverBg, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '10%', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden="true" style={{ position: 'absolute', top: '-18%', right: '-18%', width: '65%', height: '65%', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
      <span style={{ position: 'absolute', top: '8%', left: '10%', fontSize: size * 0.065, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' }}>
        {item.type === 'audiobook' ? 'book' : 'pod'}
      </span>
      <p style={{ fontSize, fontWeight: 900, lineHeight: 0.95, color: item.coverColor, letterSpacing: '-0.03em', wordBreak: 'break-word', marginBottom: '6%', zIndex: 1, maxWidth: '100%' }}>{short}</p>
      <p style={{ fontSize: size * 0.075, color: 'rgba(255,255,255,0.55)', zIndex: 1, maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.author}</p>
    </div>
  );
}

function CoverArt({ item, size = 160 }: { item: ContentItem; size?: number }) {
  const [loaded, setLoaded] = useState(false);
  const [error,  setError]  = useState(false);
  useEffect(() => { setLoaded(false); setError(false); }, [item.id]);

  if (!item.coverImage || error) return <GradientCover item={item} size={size} />;
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!loaded && <div style={{ position: 'absolute', inset: 0 }}><GradientCover item={item} size={size} /></div>}
      <img src={item.coverImage} alt={item.title} onLoad={() => setLoaded(true)} onError={() => setError(true)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease' }} />
    </div>
  );
}

// ── Onboarding modal ──────────────────────────────────────────────────────────
function OnboardingModal({ initialSubs, onComplete, onSkip, isEdit }: {
  initialSubs: string[]; onComplete: (subs: string[]) => void; onSkip: () => void; isEdit: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSubs));
  const toggle = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="mono-fade-in" style={{ position: 'fixed', inset: 0, zIndex: 100, background: C.fg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', overflowY: 'auto' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <span style={{ fontFamily: fDisplay, fontSize: 36, fontWeight: 400, color: C.bg, letterSpacing: '-0.02em' }}>MONO.</span>
        </div>
        <h1 style={{ fontFamily: fDisplay, fontSize: 28, fontWeight: 400, color: C.bg, textAlign: 'center', marginBottom: 8 }}>
          {isEdit ? 'Update your services' : 'Stream smarter,\nnot harder'}
        </h1>
        <p style={{ fontFamily: fMono, fontSize: 10, letterSpacing: '0.08em', color: 'rgba(246,244,237,0.45)', textAlign: 'center', marginBottom: 32, lineHeight: 1.6 }}>
          {isEdit ? 'TOGGLE THE SERVICES YOU CURRENTLY PAY FOR' : "WHICH SERVICES DO YOU PAY FOR? WE'LL SHOW WHAT'S FREE FOR YOU"}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {PLAT_ORDER.map(id => {
            const p = SVC[id]; const isOn = selected.has(id);
            return (
              <button key={id} onClick={() => toggle(id)} style={{ padding: '16px 14px', borderRadius: 18, textAlign: 'left', cursor: 'pointer', fontFamily: fSans, border: `2px solid ${isOn ? p.color : 'rgba(246,244,237,0.1)'}`, background: isOn ? p.color + '18' : 'rgba(246,244,237,0.04)', transition: 'all 200ms' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: isOn ? p.color : C.bg }}>{p.name}</span>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: isOn ? p.color : 'rgba(246,244,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isOn && <Check size={11} style={{ color: '#FFF' }} />}
                  </div>
                </div>
                <p style={{ fontSize: 10, color: 'rgba(246,244,237,0.35)', marginBottom: 6, lineHeight: 1.4 }}>{p.desc}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: isOn ? p.color : 'rgba(246,244,237,0.2)' }}>{p.price}</p>
              </button>
            );
          })}
        </div>
        <button onClick={() => onComplete([...selected])} style={{ width: '100%', padding: '14px 32px', borderRadius: 999, fontSize: 14, fontWeight: 800, background: C.bg, color: C.fg, border: 'none', cursor: 'pointer', fontFamily: fSans, marginBottom: 12 }}>
          {selected.size > 0 ? `${isEdit ? 'Save' : 'Get started'} — ${selected.size} service${selected.size > 1 ? 's' : ''}` : isEdit ? 'Save' : 'Continue without services'}
        </button>
        {!isEdit && <button onClick={onSkip} style={{ display: 'block', margin: '0 auto', fontSize: 11, fontFamily: fMono, letterSpacing: '0.1em', color: 'rgba(246,244,237,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>SKIP FOR NOW</button>}
      </div>
    </div>
  );
}

// ── Detail modal ──────────────────────────────────────────────────────────────
function DetailModal({ item, onClose, isFree }: { item: ContentItem; onClose: () => void; isFree: boolean }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div className="mono-fade-in" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 20px', background: 'rgba(8,15,4,0.5)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
      <div className="mono-slide-up" style={{ width: '100%', maxWidth: 420, borderRadius: 28, background: C.surface, overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ height: 180, background: C.bg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 110, height: 148, borderRadius: 14, overflow: 'hidden', boxShadow: '0 12px 40px rgba(8,15,4,0.2)' }}><CoverArt item={item} size={110} /></div>
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: '50%', background: 'rgba(8,15,4,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12} style={{ color: C.fg }} /></button>
        </div>
        <div style={{ padding: '18px 22px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontFamily: fMono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
              {item.type === 'audiobook' ? <Headphones size={9} /> : <Radio size={9} />}
              {item.genre}
            </span>
          </div>
          <h2 style={{ fontFamily: fDisplay, fontSize: 24, fontWeight: 400, lineHeight: 1.1, marginBottom: 4, color: C.fg }}>{item.title}</h2>
          <p style={{ fontFamily: fMono, fontSize: 10, color: C.muted, marginBottom: 12, letterSpacing: '0.06em' }}>by {item.author}</p>
          <div style={{ display: 'flex', gap: 14, marginBottom: 12, fontFamily: fMono, fontSize: 10, color: C.muted, letterSpacing: '0.06em' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={10} fill="#F59E0B" style={{ color: '#F59E0B' }} />{item.rating}</span>
            {item.duration && <span>{item.duration}</span>}
            {item.episodes != null && <span>{item.episodes.toLocaleString()} eps</span>}
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.65, color: C.fg, opacity: 0.7, marginBottom: 16 }}>{item.description}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            {PLAT_ORDER.map(id => {
              if (!item.platforms[id]) return null;
              const s = SVC[id];
              return <span key={id} style={{ fontFamily: fMono, fontSize: 9, fontWeight: 500, letterSpacing: '0.06em', padding: '4px 10px', borderRadius: 999, background: s.color + '18', color: s.color, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={8} />{s.name}</span>;
            })}
          </div>
          {isFree
            ? <button style={{ width: '100%', padding: 13, borderRadius: 14, fontSize: 14, fontWeight: 800, background: C.fg, color: C.bg, border: 'none', cursor: 'pointer', fontFamily: fSans, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Play size={13} fill="currentColor" /> Listen Free</button>
            : <div style={{ padding: '10px 14px', borderRadius: 12, background: '#F9FAF7', border: `1px solid ${C.border}`, fontFamily: fMono, fontSize: 9, letterSpacing: '0.08em', color: C.muted, textAlign: 'center', textTransform: 'uppercase' }}>Not on your current plan</div>
          }
        </div>
      </div>
    </div>
  );
}

// ── Services block ────────────────────────────────────────────────────────────
function ServicesBlock({ userSubs, onEdit }: { userSubs: Set<string>; onEdit: () => void }) {
  return (
    <div style={{ paddingBlock: 24 }}>
      <SectionLabel text="Your active streaming services" action="manage" onAction={onEdit} />
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
        {PLAT_ORDER.map(id => {
          const p = SVC[id]; const isOn = userSubs.has(id);
          return (
            <div key={id} style={{ flexShrink: 0, width: 108, borderRadius: 16, overflow: 'hidden', border: `1.5px solid ${isOn ? C.border : C.borderSoft}`, background: C.surface, opacity: isOn ? 1 : 0.6 }}>
              <div style={{ height: 66, display: 'flex', alignItems: 'center', justifyContent: 'center', background: p.logoBg }}>
                <span style={{ fontFamily: fSans, fontSize: 12, fontWeight: 900, color: p.logoColor, letterSpacing: '-0.02em' }}>{p.name}</span>
              </div>
              <div style={{ padding: '7px 10px 8px', fontFamily: fMono, fontSize: 8, letterSpacing: '0.05em', lineHeight: 1.5, color: isOn ? C.fg : C.muted, borderTop: `1px solid ${C.borderSoft}`, whiteSpace: 'pre-line' }}>
                {isOn ? 'active paid\nsubscription' : 'not connected'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Featured pick ─────────────────────────────────────────────────────────────
function FeaturedPick({ item, label, onSelect, freePlatformName, secondary }: {
  item: ContentItem; label: string; onSelect: () => void;
  freePlatformName: string | null; secondary?: boolean;
}) {
  const coverSize = secondary ? 100 : 130;

  return (
    <div style={{ paddingBlock: secondary ? 22 : 28 }}>
      <SectionLabel text={label} />
      <div style={{ display: 'grid', gridTemplateColumns: secondary ? `${coverSize}px 1fr` : `1fr ${coverSize}px`, gap: 20, alignItems: 'start' }}>
        {secondary && (
          <button onClick={onSelect} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ width: '100%', aspectRatio: '2/3', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(8,15,4,0.16)' }}>
              <CoverArt item={item} size={coverSize} />
            </div>
          </button>
        )}
        <div>
          {freePlatformName && (
            <div style={{ display: 'inline-block', fontFamily: fMono, fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 999, background: 'rgba(8,15,4,0.08)', color: C.fg, marginBottom: 10 }}>
              Free on {freePlatformName}
            </div>
          )}
          <p style={{ fontFamily: fMono, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>
            {item.genre} · {item.type === 'audiobook' ? item.duration : `${item.episodes?.toLocaleString()} episodes`}
          </p>
          <h2 style={{ fontFamily: fDisplay, fontSize: secondary ? 'clamp(18px,4vw,24px)' : 'clamp(26px,5vw,38px)', fontWeight: 400, lineHeight: 1.0, letterSpacing: '-0.01em', marginBottom: 10, color: C.fg }}>
            {item.title}
          </h2>
          <p style={{ fontSize: 12, lineHeight: 1.7, color: C.muted, marginBottom: 16, maxWidth: '38ch' }}>{item.description}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={onSelect} style={{ fontFamily: fSans, fontSize: 11, fontWeight: 700, padding: '8px 18px', borderRadius: 999, background: C.fg, color: C.bg, border: 'none', cursor: 'pointer' }}>Check out</button>
            <button style={{ fontFamily: fSans, fontSize: 11, fontWeight: 600, padding: '8px 16px', borderRadius: 999, background: 'transparent', color: C.fg, border: `1.5px solid ${C.border}`, cursor: 'pointer' }}>Save</button>
          </div>
        </div>
        {!secondary && (
          <button onClick={onSelect} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <div style={{ width: '100%', aspectRatio: '2/3', borderRadius: 14, overflow: 'hidden', boxShadow: '0 12px 32px rgba(8,15,4,0.18)' }}>
              <CoverArt item={item} size={coverSize} />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Curated grid ──────────────────────────────────────────────────────────────
function CuratedGrid({ items, onSelect, freePlatform: getFree }: {
  items: ContentItem[]; onSelect: (item: ContentItem) => void;
  freePlatform: (item: ContentItem) => string | null;
}) {
  return (
    <div style={{ paddingBlock: 24 }}>
      <SectionLabel text="Curated for you" action="see all" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {items.map(item => {
          const fp = getFree(item);
          const svc = fp ? Object.values(SVC).find(s => s.name === fp) : null;
          return (
            <button key={item.id} onClick={() => onSelect(item)} style={{ background: C.surface, borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.border}`, cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: fSans }}>
              <div style={{ width: '100%', aspectRatio: '1/1', position: 'relative' }}>
                <CoverArt item={item} size={120} />
              </div>
              <div style={{ padding: '10px 12px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3, marginBottom: 3, color: C.fg, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.title}</div>
                <div style={{ fontFamily: fMono, fontSize: 8, letterSpacing: '0.06em', color: C.muted }}>{item.genre}</div>
                {fp && svc && (
                  <span style={{ display: 'inline-block', fontFamily: fMono, fontSize: 7, letterSpacing: '0.05em', padding: '2px 7px', borderRadius: 999, background: svc.color + '18', color: svc.color, marginTop: 7 }}>Free · {fp}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Search results ────────────────────────────────────────────────────────────
function SearchResults({ items, query, onSelect, freePlatform: getFree, onClear }: {
  items: ContentItem[]; query: string; onSelect: (item: ContentItem) => void;
  freePlatform: (item: ContentItem) => string | null; onClear: () => void;
}) {
  return (
    <div style={{ paddingBlock: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontFamily: fMono, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.muted }}>
          {items.length === 0 ? 'No results' : `${items.length} result${items.length !== 1 ? 's' : ''} for "${query}"`}
        </span>
        <button onClick={onClear} style={{ fontFamily: fMono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          <X size={9} /> Clear
        </button>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', background: C.surface, borderRadius: 18, border: `1px solid ${C.border}` }}>
          <p style={{ fontFamily: fDisplay, fontSize: 20, color: C.fg, marginBottom: 6 }}>Nothing found</p>
          <p style={{ fontFamily: fMono, fontSize: 9, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase' }}>Try a title, author or genre</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {items.map(item => {
            const fp = getFree(item);
            const svc = fp ? Object.values(SVC).find(s => s.name === fp) : null;
            return (
              <button key={item.id} onClick={() => onSelect(item)} style={{ background: C.surface, borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.border}`, cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: fSans }}>
                <div style={{ width: '100%', aspectRatio: '1/1', position: 'relative' }}>
                  <CoverArt item={item} size={120} />
                </div>
                <div style={{ padding: '10px 12px 12px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3, marginBottom: 3, color: C.fg, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.title}</div>
                  <div style={{ fontFamily: fMono, fontSize: 8, letterSpacing: '0.06em', color: C.muted }}>{item.genre}</div>
                  {fp && svc && (
                    <span style={{ display: 'inline-block', fontFamily: fMono, fontSize: 7, letterSpacing: '0.05em', padding: '2px 7px', borderRadius: 999, background: svc.color + '18', color: svc.color, marginTop: 7 }}>Free · {fp}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────
function SkeletonFeature({ secondary }: { secondary?: boolean }) {
  return (
    <div style={{ paddingBlock: secondary ? 22 : 28 }}>
      <div className="mono-skeleton" style={{ height: 10, width: 140, borderRadius: 4, marginBottom: 14 }} />
      <div style={{ display: 'grid', gridTemplateColumns: secondary ? '100px 1fr' : '1fr 130px', gap: 20 }}>
        {secondary && <div className="mono-skeleton" style={{ aspectRatio: '2/3', borderRadius: 12 }} />}
        <div>
          <div className="mono-skeleton" style={{ height: 9, width: 100, borderRadius: 4, marginBottom: 10 }} />
          <div className="mono-skeleton" style={{ height: secondary ? 22 : 32, width: '80%', borderRadius: 6, marginBottom: 10 }} />
          <div className="mono-skeleton" style={{ height: 12, width: '95%', borderRadius: 4, marginBottom: 6 }} />
          <div className="mono-skeleton" style={{ height: 12, width: '70%', borderRadius: 4, marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="mono-skeleton" style={{ height: 34, width: 90, borderRadius: 999 }} />
            <div className="mono-skeleton" style={{ height: 34, width: 70, borderRadius: 999 }} />
          </div>
        </div>
        {!secondary && <div className="mono-skeleton" style={{ aspectRatio: '2/3', borderRadius: 14 }} />}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Discover() {
  const [userSubs, setUserSubs] = useState<Set<string>>(() => {
    try { const s = localStorage.getItem('mono_subs'); if (s) return new Set(JSON.parse(s) as string[]); } catch {}
    return new Set();
  });
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem('mono_subs'); } catch { return true; }
  });
  const [editingSubs, setEditingSubs] = useState(false);

  const [podcasts,  setPodcasts]  = useState<ContentItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [query,     setQuery]     = useState('');
  const [selected,  setSelected]  = useState<ContentItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchDefaultPodcasts().then(r => { setPodcasts(r); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const allContent = useMemo(() => [...AUDIOBOOKS, ...podcasts], [podcasts]);

  const completeOnboarding = useCallback((subs: string[]) => {
    try { localStorage.setItem('mono_subs', JSON.stringify(subs)); } catch {}
    setUserSubs(new Set(subs));
    setShowOnboarding(false);
    setEditingSubs(false);
  }, []);

  const isFree = useCallback((item: ContentItem) =>
    PLAT_ORDER.some(id => item.platforms[id] && userSubs.has(id)), [userSubs]
  );

  const getFP = useCallback((item: ContentItem) => freePlatform(item, userSubs), [userSubs]);

  const trendingPodcast  = useMemo(() => allContent.find(c => c.type === 'podcast'   && c.trending), [allContent]);
  const trendingBook     = useMemo(() => allContent.find(c => c.type === 'audiobook' && c.trending), [allContent]);
  const curatedItems     = useMemo(() => {
    const skip = new Set([trendingPodcast?.id, trendingBook?.id]);
    return allContent.filter(c => !skip.has(c.id)).slice(0, 6);
  }, [allContent, trendingPodcast, trendingBook]);

  const searchResults = useMemo(() => {
    if (!query.trim() && !activeCategory) return null;
    return allContent.filter(c => {
      const q = query.toLowerCase();
      const matchQuery = !q || c.title.toLowerCase().includes(q) || c.author.toLowerCase().includes(q) || c.genre.toLowerCase().includes(q);
      const matchCat = !activeCategory || c.genre === activeCategory;
      return matchQuery && matchCat;
    });
  }, [query, activeCategory, allContent]);

  const handleCategory = (cat: string) => {
    setActiveCategory(prev => prev === cat ? null : cat);
    setQuery('');
  };

  return (
    <div style={{ background: C.bg, minHeight: '100%' }}>
      {(showOnboarding || editingSubs) && (
        <OnboardingModal initialSubs={[...userSubs]} onComplete={completeOnboarding}
          onSkip={() => { setShowOnboarding(false); setEditingSubs(false); }} isEdit={editingSubs} />
      )}

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 20px' }}>

        {/* Editorial masthead */}
        <div style={{ padding: '32px 0 22px', borderBottom: `1.5px solid ${C.fg}` }}>
          <div style={{ fontFamily: fMono, fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted, marginBottom: 20 }}>
            The Listening Room&nbsp;&nbsp;/&nbsp;&nbsp;Vol. 001
          </div>
          <h1 style={{ fontFamily: fDisplay, fontSize: 'clamp(44px,8vw,80px)', fontWeight: 400, lineHeight: 1.04, margin: '0 0 14px', textWrap: 'balance', color: C.fg, letterSpacing: '-0.02em' }}>
            Open ears. Open worlds.
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: C.muted, margin: 0, maxWidth: '52ch' }}>
            Podcasts to get lost in. Books to live a little more. All your listening, in good company.
          </p>
        </div>

        {/* Search */}
        <div style={{ paddingBlock: 20, borderBottom: `1.5px solid ${C.border}` }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.muted, pointerEvents: 'none' }} />
            <input type="search" value={query} onChange={e => { setQuery(e.target.value); setActiveCategory(null); }}
              placeholder="Search titles, authors, genres…"
              style={{ width: '100%', background: C.surface, color: C.fg, border: `1.5px solid ${C.border}`, outline: 'none', borderRadius: 14, padding: '11px 40px 11px 38px', fontSize: 13, fontFamily: fSans, boxShadow: '0 2px 12px rgba(8,15,4,0.06)' }} />
            {query && (
              <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: 'rgba(8,15,4,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={10} style={{ color: C.muted }} />
              </button>
            )}
          </div>
        </div>

        {/* Services */}
        <ServicesBlock userSubs={userSubs} onEdit={() => setEditingSubs(true)} />
        <Divider />

        {searchResults !== null ? (
          <SearchResults items={searchResults} query={query || (activeCategory ?? '')} onSelect={setSelected} freePlatform={getFP} onClear={() => { setQuery(''); setActiveCategory(null); }} />
        ) : loading ? (
          <>
            <SkeletonFeature />
            <Divider />
            <SkeletonFeature secondary />
          </>
        ) : (
          <>
            {trendingPodcast && (
              <>
                <FeaturedPick item={trendingPodcast} label="Podcast of the week" onSelect={() => setSelected(trendingPodcast)} freePlatformName={getFP(trendingPodcast)} />
                <Divider />
              </>
            )}
            {trendingBook && (
              <>
                <FeaturedPick item={trendingBook} label="Book of the week" onSelect={() => setSelected(trendingBook)} freePlatformName={getFP(trendingBook)} secondary />
                <Divider />
              </>
            )}
            <CuratedGrid items={curatedItems} onSelect={setSelected} freePlatform={getFP} />
            <Divider />
          </>
        )}

        {/* Categories */}
        <div style={{ paddingBlock: 22 }}>
          <SectionLabel text="Categories" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => handleCategory(cat)} style={{ fontFamily: fMono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 15px', borderRadius: 999, border: `1.5px solid ${activeCategory === cat ? C.fg : C.border}`, color: activeCategory === cat ? C.bg : C.fg, background: activeCategory === cat ? C.fg : 'transparent', cursor: 'pointer', transition: 'all 150ms' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <Divider />

        {/* CTA */}
        <div style={{ background: C.fg, borderRadius: 20, padding: '22px 20px', margin: '24px 0 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: fDisplay, fontSize: 18, fontWeight: 400, color: '#F6F4ED', lineHeight: 1.2, marginBottom: 4 }}>Connect your services, see what's already free</div>
            <div style={{ fontFamily: fMono, fontSize: 8, letterSpacing: '0.1em', color: 'rgba(246,244,237,0.4)', textTransform: 'uppercase' }}>Audible · Storytel · Podimo · Spotify</div>
          </div>
          <button onClick={() => setEditingSubs(true)} style={{ fontFamily: fSans, fontSize: 12, fontWeight: 800, padding: '10px 20px', borderRadius: 999, background: '#F6F4ED', color: C.fg, border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            {userSubs.size > 0 ? 'Update services' : 'Get started'}
          </button>
        </div>

      </div>

      {selected && <DetailModal item={selected} onClose={() => setSelected(null)} isFree={isFree(selected)} />}
    </div>
  );
}
