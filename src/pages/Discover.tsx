import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PODCASTS, AUDIOBOOKS, PLATFORM_COLORS } from '../data/content';
import type { Podcast, Audiobook } from '../data/content';

const BG    = '#F3EEDA';
const INK   = '#23003F';
const MUTED = '#5C6448';
const RULE  = '#C8C5B0';
const LAV   = '#9A98CC';

const fSer  = "'DM Serif Display', Georgia, serif";
const fMono = "'DM Mono', 'Courier New', monospace";
const fSans = "'DM Sans', system-ui, sans-serif";

const SVCS  = ['Audible', 'Storytel', 'Podimo', 'Spotify'];
const NTABS = ['Discover', 'Podcasts', 'Audiobooks'] as const;

const POD_CATS  = ['All', 'True Crime', 'News', 'Business', 'History', 'Culture', 'Design'];
const BOOK_CATS = ['All', 'Fiction', 'Biography', 'History', 'Business', 'Science', 'Self-Help'];

const BADGE_STYLE: Record<string, { border: string; color: string }> = {
  FREE:      { border: '#16a34a', color: '#16a34a' },
  TRENDING:  { border: '#d97706', color: '#d97706' },
  EXCLUSIVE: { border: '#7c3aed', color: '#7c3aed' },
  NEW:       { border: '#0369a1', color: '#0369a1' },
  AWARD:     { border: '#b45309', color: '#b45309' },
};

function PlatformChips({ platforms }: { platforms: string[] }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 7 }}>
      {platforms.map(p => (
        <span key={p} style={{
          fontFamily: fMono, fontSize: 8, letterSpacing: '0.07em', fontWeight: 700,
          padding: '2px 6px', borderRadius: 4,
          background: (PLATFORM_COLORS[p] ?? '#888') + '1A',
          color: PLATFORM_COLORS[p] ?? '#888',
          border: `1px solid ${(PLATFORM_COLORS[p] ?? '#888')}44`,
        }}>
          {p}
        </span>
      ))}
    </div>
  );
}

function CoverImg({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div style={{ background: `${INK}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
        <span style={{ fontFamily: fSer, fontSize: 11, color: MUTED, opacity: 0.5 }}>{alt[0]}</span>
      </div>
    );
  }
  return <img src={src} alt={alt} style={style} onError={() => setErr(true)} />;
}

export default function Discover() {
  const navigate = useNavigate();
  const [q,       setQ]       = useState('');
  const [navTab,  setNavTab]  = useState<typeof NTABS[number]>('Discover');
  const [podCat,  setPodCat]  = useState('All');
  const [bookCat, setBookCat] = useState('All');
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

  const filteredPods: Podcast[] = useMemo(() => {
    let list = PODCASTS;
    if (podCat !== 'All') list = list.filter(p => p.category === podCat);
    if (q.trim()) {
      const lq = q.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(lq) || p.author.toLowerCase().includes(lq));
    }
    return list;
  }, [podCat, q]);

  const filteredBooks: Audiobook[] = useMemo(() => {
    let list = AUDIOBOOKS;
    if (bookCat !== 'All') list = list.filter(b => b.category === bookCat);
    if (q.trim()) {
      const lq = q.toLowerCase();
      list = list.filter(b => b.title.toLowerCase().includes(lq) || b.author.toLowerCase().includes(lq));
    }
    return list;
  }, [bookCat, q]);

  const showPods  = navTab === 'Discover' || navTab === 'Podcasts';
  const showBooks = navTab === 'Discover' || navTab === 'Audiobooks';

  return (
    <div style={{ minHeight: '100vh', background: BG, color: INK, fontFamily: fSans }}>

      {/* ── Dark editorial nav ───────────────────────────────────────────────── */}
      <nav style={{ background: INK, height: 52, display: 'flex', alignItems: 'center', padding: '0 max(24px, env(safe-area-inset-left,0px))', position: 'sticky', top: 0, zIndex: 100 }}>
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
        <div style={{ flex: 1, textAlign: 'center', fontFamily: fMono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(243,238,218,0.38)' }}>
          Stream smarter. Not harder.
        </div>
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
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fSer, fontSize: 26, fontWeight: 400, color: BG, letterSpacing: '-0.02em', lineHeight: 1, padding: 0 }}>MONO.</button>
        </div>
      </nav>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div style={{ padding: '0 max(40px, env(safe-area-inset-left,0px))' }}>

        {/* Search */}
        <div style={{ padding: '28px 0 20px' }}>
          <p style={{ fontSize: 13, lineHeight: 1.65, color: MUTED, margin: '0 0 16px' }}>
            Find a podcast or audiobook you'll love. Search below, or explore our picks.
          </p>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }} />
            <input
              type="search" value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search podcasts, audiobooks, or creators…"
              style={{ width: '100%', border: `1.5px solid ${RULE}`, borderRadius: 999, padding: '12px 44px', fontSize: 13, fontFamily: fSans, background: 'rgba(255,252,245,0.7)', color: INK, outline: 'none', boxSizing: 'border-box' }}
            />
            {q && (
              <button onClick={() => setQ('')} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: fMono, fontSize: 10, letterSpacing: '0.08em', color: MUTED }}>Clear</button>
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
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: fMono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED, padding: 0 }}>Edit</button>
        </div>

        {/* ── Podcasts section ─────────────────────────────────────────────────── */}
        {showPods && (
          <div style={{ paddingTop: 36 }}>
            <h2 style={{ fontFamily: fSer, fontSize: 'clamp(32px,5vw,52px)', fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.015em', margin: '0 0 20px' }}>
              Worth your headphones.
            </h2>

            {/* Category pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {POD_CATS.map(c => (
                <button key={c} onClick={() => setPodCat(c)} style={{ fontFamily: fSans, fontSize: 12, fontWeight: podCat === c ? 700 : 400, padding: '7px 16px', borderRadius: 999, border: `1.5px solid ${podCat === c ? INK : RULE}`, background: podCat === c ? INK : 'transparent', color: podCat === c ? BG : INK, cursor: 'pointer', transition: 'all 150ms' }}>
                  {c}
                </button>
              ))}
            </div>

            {/* 3-column podcast grid */}
            {filteredPods.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: `1.5px solid ${RULE}`, borderRadius: 14, overflow: 'hidden', marginBottom: navTab === 'Discover' ? 52 : 64 }}>
                {filteredPods.map((pod, i) => {
                  const cols = 3;
                  const isLastRow = i >= filteredPods.length - (filteredPods.length % cols || cols);
                  const isLastCol = (i + 1) % cols === 0;
                  const bs = BADGE_STYLE[pod.badge] ?? BADGE_STYLE.FREE;
                  return (
                    <div
                      key={pod.id}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 20px', background: BG, borderRight: !isLastCol ? `1px solid ${RULE}` : 'none', borderBottom: !isLastRow ? `1px solid ${RULE}` : 'none', cursor: 'pointer', transition: 'background 120ms' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#EBE6D1'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = BG; }}
                    >
                      <CoverImg src={pod.image} alt={pod.title} style={{ width: 54, height: 54, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ marginBottom: 5 }}>
                          <span style={{ fontFamily: fMono, fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 999, border: `1px solid ${bs.border}`, color: bs.color }}>
                            {pod.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pod.title}</div>
                        <div style={{ fontSize: 11, color: MUTED, fontFamily: fMono, letterSpacing: '0.03em', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pod.author}</div>
                        <PlatformChips platforms={pod.platforms} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: MUTED, fontFamily: fMono, fontSize: 12, padding: '32px 0 52px', letterSpacing: '0.04em' }}>No podcasts match.</p>
            )}
          </div>
        )}

        {/* ── Audiobooks section ───────────────────────────────────────────────── */}
        {showBooks && (
          <div style={{ paddingTop: navTab === 'Discover' ? 0 : 36 }}>
            <h2 style={{ fontFamily: fSer, fontSize: 'clamp(32px,5vw,52px)', fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.015em', margin: '0 0 20px' }}>
              Listen to the world's best books.
            </h2>

            {/* Book category pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {BOOK_CATS.map(c => (
                <button key={c} onClick={() => setBookCat(c)} style={{ fontFamily: fSans, fontSize: 12, fontWeight: bookCat === c ? 700 : 400, padding: '7px 16px', borderRadius: 999, border: `1.5px solid ${bookCat === c ? INK : RULE}`, background: bookCat === c ? INK : 'transparent', color: bookCat === c ? BG : INK, cursor: 'pointer', transition: 'all 150ms' }}>
                  {c}
                </button>
              ))}
            </div>

            {filteredBooks.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 64 }}>
                {filteredBooks.map(book => {
                  const bs = BADGE_STYLE[book.badge] ?? BADGE_STYLE.FREE;
                  return (
                    <div
                      key={book.id}
                      style={{ background: BG, border: `1.5px solid ${RULE}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 150ms' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(35,0,63,0.10)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                    >
                      <div style={{ position: 'relative' }}>
                        <CoverImg src={book.image} alt={book.title}
                          style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                        <span style={{ position: 'absolute', top: 10, left: 10, fontFamily: fMono, fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 999, background: BG, color: bs.color, border: `1px solid ${bs.border}` }}>
                          {book.badge}
                        </span>
                      </div>
                      <div style={{ padding: '14px 14px 16px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
                        <div style={{ fontSize: 11, color: MUTED, fontFamily: fMono, letterSpacing: '0.03em', marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.author}</div>
                        <div style={{ fontSize: 10, color: MUTED, fontFamily: fMono, letterSpacing: '0.03em', marginBottom: 8 }}>{book.runtime}</div>
                        <PlatformChips platforms={book.platforms} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: MUTED, fontFamily: fMono, fontSize: 12, padding: '32px 0 52px', letterSpacing: '0.04em' }}>No audiobooks match.</p>
            )}
          </div>
        )}

        {/* ── 01 / Podcast of the week (Discover tab only) ─────────────────── */}
        {navTab === 'Discover' && (
          <>
            <div style={{ fontFamily: fMono, fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: MUTED, marginBottom: 16 }}>
              01&nbsp;/&nbsp;Podcast of the week
            </div>
            <div style={{ background: LAV, borderRadius: 16, display: 'grid', gridTemplateColumns: '1fr 220px', alignItems: 'stretch', overflow: 'hidden', marginBottom: 52 }}>
              <div style={{ padding: '36px 36px' }}>
                <div style={{ fontFamily: fMono, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(35,0,63,0.5)', marginBottom: 16 }}>
                  True Crime · audiochuck
                </div>
                <h3 style={{ fontFamily: fSer, fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 400, lineHeight: 1.08, color: INK, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
                  Every Monday. A new obsession.
                </h3>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(35,0,63,0.65)', margin: '0 0 16px', maxWidth: '42ch' }}>
                  Crime Junkie delivers a new true crime story every single week — no-nonsense, deeply researched, never sensationalised.
                </p>
                <div style={{ fontFamily: fMono, fontSize: 10, letterSpacing: '0.08em', color: 'rgba(35,0,63,0.5)', marginBottom: 8 }}>
                  Available on
                </div>
                <PlatformChips platforms={['Spotify', 'Apple Podcasts', 'Amazon Music']} />
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
                  <button style={{ fontFamily: fSans, fontSize: 12, fontWeight: 700, padding: '10px 20px', borderRadius: 999, background: INK, color: BG, border: 'none', cursor: 'pointer' }}>Play podcast</button>
                  <button style={{ fontFamily: fSans, fontSize: 12, fontWeight: 500, padding: '10px 20px', borderRadius: 999, background: 'transparent', color: INK, border: `1.5px solid ${INK}`, cursor: 'pointer' }}>Subscribe</button>
                </div>
              </div>
              <CoverImg
                src="https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/f3/de/6d/f3de6d4e-e6e1-440b-b3f3-9f1b37f3d0d1/mza_5260484491791012706.jpeg/600x600bb.jpg"
                alt="Crime Junkie"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* ── 02 / Audiobook of the week ───────────────────────────────── */}
            <div style={{ fontFamily: fMono, fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: MUTED, marginBottom: 16 }}>
              02&nbsp;/&nbsp;Audiobook of the year
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 148px', gap: 40, alignItems: 'center', marginBottom: 64 }}>
              <div>
                <div style={{ fontFamily: fMono, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, marginBottom: 16 }}>
                  Audible Audiobook of the Year 2025
                </div>
                <h3 style={{ fontFamily: fSer, fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 400, lineHeight: 1.08, color: INK, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
                  The first woman in space. Her story changes everything.
                </h3>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: MUTED, margin: '0 0 14px', maxWidth: '48ch' }}>
                  Atmosphere by Taylor Jenkins Reid, narrated by Kristen DiMercurio & Julia Whelan. Audible's most awarded audiobook of 2025.
                </p>
                <div style={{ fontFamily: fMono, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED, marginBottom: 10 }}>
                  Fiction&nbsp;·&nbsp;14h 2m
                </div>
                <PlatformChips platforms={['Audible', 'Spotify']} />
                <button style={{ fontFamily: fSans, fontSize: 12, fontWeight: 700, padding: '10px 22px', borderRadius: 999, background: INK, color: BG, border: 'none', cursor: 'pointer', marginTop: 18 }}>
                  Listen on Audible
                </button>
              </div>
              <CoverImg
                src="https://covers.openlibrary.org/b/isbn/0593448553-L.jpg"
                alt="Atmosphere"
                style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: 10 }}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Dark CTA ─────────────────────────────────────────────────────────── */}
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

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <div style={{ background: BG, borderTop: `1px solid ${RULE}`, padding: '20px max(24px, env(safe-area-inset-left,0px))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 max(40px, env(safe-area-inset-left,0px))' }}>
          <span style={{ fontFamily: fSer, fontSize: 17, fontWeight: 400, color: INK }}>MONO.</span>
          <span style={{ fontFamily: fMono, fontSize: 10, letterSpacing: '0.08em', color: MUTED }}>Made for curious ears. © 2026</span>
        </div>
      </div>

    </div>
  );
}
