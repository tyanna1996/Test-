import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

// ── Design tokens — matching the Framer original exactly ──────────────────────
const BG    = '#F3EEDA';   // warm cream paper
const INK   = '#0C1308';   // dark forest-green ink
const MUTED = '#5C6448';   // muted green-grey
const RULE  = '#C8C5B0';   // hairline rule colour
const LAV   = '#9A98CC';   // muted lavender for featured podcast card

const fSer  = "'DM Serif Display', Georgia, serif";
const fMono = "'DM Mono', 'Courier New', monospace";
const fSans = "'DM Sans', system-ui, sans-serif";

// ── Static data — same podcasts shown in the Framer prototype ─────────────────
interface Pod { id: string; title: string; author: string; image: string; badge: 'FREE' | 'TRENDING'; }

const GRID_PODS: Pod[] = [
  { id:'1', title:'The Chairish Podcast',   author:'Chairish Inc.',         image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts112/v4/8f/be/53/8fbe53ca-dbf7-c89d-29d8-744bdfbe4de1/mza_11765802649450929601.jpeg/600x600bb.jpg', badge:'FREE'     },
  { id:'2', title:'Design Nerds Anonymous', author:'ThinkLab and SURROUND', image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/74/ac/dc/74acdc72-eda3-1e50-3b49-ffdb8e0cb7bb/mza_15232146626597352423.jpeg/600x600bb.jpg', badge:'TRENDING' },
  { id:'3', title:'Design Better',          author:'The Curiosity Dept.',   image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/b1/49/70/b149707b-416e-a9e9-d054-34591c915424/mza_10163662345082686528.jpeg/600x600bb.jpg', badge:'FREE'     },
  { id:'4', title:'How to Decorate',        author:'Ballard Designs',       image:'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/94/0f/08/940f0802-6803-b3d8-db6a-3c3a8d371d3e/mza_6411123265571463430.jpg/600x600bb.jpg',  badge:'TRENDING' },
];

const CATS  = ['All', 'True Crime', 'News', 'History', 'Business', 'Culture'];
const SVCS  = ['Audible', 'Storytel', 'Podimo', 'Spotify'];
const NTABS = ['Discover', 'Podcasts', 'Audiobooks'];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Discover() {
  const navigate = useNavigate();
  const [q,       setQ]       = useState('');
  const [cat,     setCat]     = useState('All');
  const [navTab,  setNavTab]  = useState('Discover');
  const [userSvcs, setUserSvcs] = useState<string[]>(() => {
    try { const s = localStorage.getItem('mono_subs'); return s ? JSON.parse(s) as string[] : [...SVCS]; }
    catch { return [...SVCS]; }
  });

  const toggleSvc = useCallback((s: string) => {
    setUserSvcs(prev => {
      const next = prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s];
      try { localStorage.setItem('mono_subs', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: BG, color: INK, fontFamily: fSans }}>

      {/* ── Dark editorial nav ───────────────────────────────────────────────── */}
      <nav style={{ background: INK, height: 52, display: 'flex', alignItems: 'center', padding: '0 max(24px, env(safe-area-inset-left,0px))', position: 'sticky', top: 0, zIndex: 100 }}>
        {/* Tab group */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {NTABS.map((t, i) => (
            <span key={t} style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => setNavTab(t)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fSans, fontSize: 13, fontWeight: navTab === t ? 600 : 400, color: BG, opacity: navTab === t ? 1 : 0.5, padding: '0 2px', letterSpacing: '0.01em' }}
              >{t}</button>
              {i < NTABS.length - 1 && <span style={{ color: 'rgba(243,238,218,0.22)', margin: '0 10px', fontSize: 12 }}>|</span>}
            </span>
          ))}
        </div>
        {/* Centre tagline */}
        <div style={{ flex: 1, textAlign: 'center', fontFamily: fMono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(243,238,218,0.38)' }}>
          Stream smarter. Not harder.
        </div>
        {/* Right: app page links + MONO. wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {([['Dashboard','/dashboard'],['Subscriptions','/subscriptions'],['Insights','/insights']] as [string,string][]).map(([label, path], i) => (
            <span key={path} style={{ display: 'flex', alignItems: 'center' }}>
              <button onClick={() => navigate(path)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fSans, fontSize: 12, fontWeight: 400, color: BG, opacity: 0.5, padding: '0 2px', letterSpacing: '0.01em', transition: 'opacity 150ms' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.5'; }}
              >{label}</button>
              {i < 2 && <span style={{ color: 'rgba(243,238,218,0.22)', margin: '0 8px', fontSize: 12 }}>|</span>}
            </span>
          ))}
          <span style={{ color: 'rgba(243,238,218,0.22)', margin: '0 16px 0 12px', fontSize: 12 }}>·</span>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fSer, fontSize: 26, fontWeight: 400, color: BG, letterSpacing: '-0.02em', lineHeight: 1, padding: 0 }}
          >MONO.</button>
        </div>
      </nav>

      {/* ── Centred content column ───────────────────────────────────────────── */}
      <div style={{ padding: '0 max(40px, env(safe-area-inset-left,0px))' }}>

        {/* Subtitle + Search */}
        <div style={{ padding: '28px 0 20px' }}>
          <p style={{ fontSize: 13, lineHeight: 1.65, color: MUTED, margin: '0 0 16px' }}>
            Find a podcast or audiobook you'll love. Search below, or explore our picks.
          </p>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }} />
            <input
              type="search"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search podcasts, audiobooks, or creators…"
              style={{ width: '100%', border: `1.5px solid ${RULE}`, borderRadius: 999, padding: '12px 44px', fontSize: 13, fontFamily: fSans, background: 'rgba(255,252,245,0.7)', color: INK, outline: 'none', boxSizing: 'border-box' }}
            />
            {q && (
              <button onClick={() => setQ('')} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: fMono, fontSize: 10, letterSpacing: '0.08em', color: MUTED }}>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Services row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 20, borderBottom: `1.5px solid ${RULE}`, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: fMono, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, flexShrink: 0 }}>Your Services</span>
          {SVCS.map(s => (
            <button key={s} onClick={() => toggleSvc(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fSans, fontSize: 13, fontWeight: userSvcs.includes(s) ? 700 : 400, color: userSvcs.includes(s) ? INK : MUTED, padding: 0, transition: 'all 150ms' }}>
              {s}
            </button>
          ))}
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fMono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED, padding: 0 }}>
            Edit
          </button>
        </div>

        {/* ── "Worth your headphones." ─────────────────────────────────────── */}
        <div style={{ paddingTop: 36 }}>
          <h2 style={{ fontFamily: fSer, fontSize: 'clamp(36px,6vw,56px)', fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.015em', margin: '0 0 24px' }}>
            Worth your headphones.
          </h2>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{ fontFamily: fSans, fontSize: 12, fontWeight: cat === c ? 700 : 400, padding: '7px 16px', borderRadius: 999, border: `1.5px solid ${cat === c ? INK : RULE}`, background: cat === c ? INK : 'transparent', color: cat === c ? BG : INK, cursor: 'pointer', transition: 'all 150ms' }}>
                {c}
              </button>
            ))}
          </div>

          {/* 2×2 podcast card grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1.5px solid ${RULE}`, borderRadius: 14, overflow: 'hidden', marginBottom: 52 }}>
            {GRID_PODS.map((pod, i) => (
              <div
                key={pod.id}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: BG, borderRight: i % 2 === 0 ? `1px solid ${RULE}` : 'none', borderBottom: i < 2 ? `1px solid ${RULE}` : 'none', cursor: 'pointer', transition: 'background 120ms' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#EBE6D1'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = BG; }}
              >
                <img src={pod.image} alt={pod.title} style={{ width: 54, height: 54, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ marginBottom: 5 }}>
                    <span style={{ fontFamily: fMono, fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 999, border: `1px solid ${pod.badge === 'FREE' ? '#16a34a' : '#d97706'}`, color: pod.badge === 'FREE' ? '#16a34a' : '#d97706' }}>
                      {pod.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pod.title}</div>
                  <div style={{ fontSize: 11, color: MUTED, fontFamily: fMono, letterSpacing: '0.03em', marginTop: 2 }}>{pod.author}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 01 / Podcast of the week ─────────────────────────────────────── */}
        <div style={{ fontFamily: fMono, fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: MUTED, marginBottom: 16 }}>
          01&nbsp;/&nbsp;Podcast of the week
        </div>
        <div style={{ background: LAV, borderRadius: 16, display: 'grid', gridTemplateColumns: '1fr 220px', alignItems: 'stretch', overflow: 'hidden', marginBottom: 52 }}>
          <div style={{ padding: '36px 36px' }}>
            <div style={{ fontFamily: fMono, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(12,19,8,0.5)', marginBottom: 16 }}>
              Design & Culture
            </div>
            <h3 style={{ fontFamily: fSer, fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 400, lineHeight: 1.08, color: INK, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
              A little curiosity. A whole new perspective.
            </h3>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(12,19,8,0.65)', margin: '0 0 16px', maxWidth: '42ch' }}>
              Go beyond the obvious with Design Better. Big ideas, fascinating people, and the stories behind the things we love.
            </p>
            <div style={{ fontFamily: fMono, fontSize: 10, letterSpacing: '0.08em', color: 'rgba(12,19,8,0.5)', marginBottom: 22 }}>
              Design Better&nbsp;·&nbsp;Weekly episodes
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button style={{ fontFamily: fSans, fontSize: 12, fontWeight: 700, padding: '10px 20px', borderRadius: 999, background: INK, color: BG, border: 'none', cursor: 'pointer' }}>
                Play podcast
              </button>
              <button style={{ fontFamily: fSans, fontSize: 12, fontWeight: 500, padding: '10px 20px', borderRadius: 999, background: 'transparent', color: INK, border: `1.5px solid ${INK}`, cursor: 'pointer' }}>
                Subscribe
              </button>
            </div>
          </div>
          <img
            src="https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/b1/49/70/b149707b-416e-a9e9-d054-34591c915424/mza_10163662345082686528.jpeg/600x600bb.jpg"
            alt="Design Better"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        {/* ── 02 / Book of the week ────────────────────────────────────────── */}
        <div style={{ fontFamily: fMono, fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: MUTED, marginBottom: 16 }}>
          02&nbsp;/&nbsp;Book of the week
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 148px', gap: 40, alignItems: 'center', marginBottom: 64 }}>
          <div>
            <h3 style={{ fontFamily: fSer, fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 400, lineHeight: 1.08, color: INK, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
              Small habits. Remarkable possibilities.
            </h3>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: MUTED, margin: '0 0 14px', maxWidth: '48ch' }}>
              Atomic Habits by James Clear. A practical, quietly powerful guide to getting a little better, every day.
            </p>
            <div style={{ fontFamily: fMono, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED, marginBottom: 22 }}>
              Self-Development&nbsp;·&nbsp;5h 35min
            </div>
            <button style={{ fontFamily: fSans, fontSize: 12, fontWeight: 700, padding: '10px 22px', borderRadius: 999, background: INK, color: BG, border: 'none', cursor: 'pointer' }}>
              Listen on Audible
            </button>
          </div>
          <img
            src="https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg"
            alt="Atomic Habits"
            style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: 10 }}
          />
        </div>

      </div>

      {/* ── Dark CTA — full bleed ────────────────────────────────────────────── */}
      <div style={{ background: INK, padding: '52px max(24px, env(safe-area-inset-left,0px))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', padding: '0 max(40px, env(safe-area-inset-left,0px))' }}>
          <div>
            <h2 style={{ fontFamily: fSer, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.01em', color: BG, margin: '0 0 10px' }}>
              Less scrolling. More listening.
            </h2>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(243,238,218,0.5)', margin: 0, maxWidth: '52ch' }}>
              Your favourite services. One happy place. Make room for your next obsession.
            </p>
          </div>
          <button style={{ fontFamily: fSans, fontSize: 13, fontWeight: 600, padding: '12px 24px', borderRadius: 999, background: 'transparent', color: BG, border: '1.5px solid rgba(243,238,218,0.4)', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
            Connect your services
          </button>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <div style={{ background: BG, borderTop: `1px solid ${RULE}`, padding: '20px max(24px, env(safe-area-inset-left,0px))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 max(40px, env(safe-area-inset-left,0px))' }}>
          <span style={{ fontFamily: fSer, fontSize: 17, fontWeight: 400, color: INK }}>MONO.</span>
          <span style={{ fontFamily: fMono, fontSize: 10, letterSpacing: '0.08em', color: MUTED }}>Made for curious ears. © 2026</span>
        </div>
      </div>

    </div>
  );
}
