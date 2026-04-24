'use strict';

/* ════════════════════════════════════════
   MONO — app.js
   ════════════════════════════════════════ */

/* ── Config ── */
const CONNECTED = new Set(['spotify', 'podimo', 'audible']);
const FREE_SRCS = new Set(['librivox', 'openlibrary']);

/* ── App state ── */
const state = {
  type: 'all',
  category: 'all',
  lastPodcasts: [],
  lastAudiobooks: [],
  lastErrors: {},
  popularCache: null,
};

/* ══════════════════════════════
   NAVIGATION
   ══════════════════════════════ */
function initNav() {
  document.querySelectorAll('.nav-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      showPage(btn.dataset.page);
    });
  });
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  if (name === 'popular')   loadPopular();
  if (name === 'community') renderCommunityPosts();
}

/* ══════════════════════════════
   DISCOVER — search & filters
   ══════════════════════════════ */
function initDiscover() {
  const input = document.getElementById('search-input');
  const btn   = document.getElementById('search-btn');

  const search = () => {
    const q = input.value.trim();
    if (q) doSearch(q);
  };

  btn.addEventListener('click', search);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') search(); });

  document.querySelectorAll('#type-filters .pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#type-filters .pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.type = pill.dataset.type;
      if (state.lastPodcasts.length || state.lastAudiobooks.length) applyFiltersToResults();
    });
  });

  document.querySelectorAll('#category-filters .pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#category-filters .pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.category = pill.dataset.cat;
      if (state.lastPodcasts.length || state.lastAudiobooks.length) applyFiltersToResults();
    });
  });
}

async function doSearch(query) {
  const area = document.getElementById('results-area');
  area.innerHTML = spinnerHTML();

  const errors = {};

  const itunesP = (state.type === 'all' || state.type === 'podcasts')
    ? fetchItunes(query).catch(e => { errors.iTunes = true; return []; })
    : Promise.resolve([]);

  const librivoxP = (state.type === 'all' || state.type === 'audiobooks')
    ? fetchLibrivox(query).catch(e => { errors.LibriVox = true; return []; })
    : Promise.resolve([]);

  const olP = (state.type === 'all' || state.type === 'audiobooks')
    ? fetchOpenLibrary(query).catch(e => { errors['Open Library'] = true; return []; })
    : Promise.resolve([]);

  const [podcasts, librivox, ol] = await Promise.all([itunesP, librivoxP, olP]);

  state.lastPodcasts   = podcasts;
  state.lastAudiobooks = [...librivox, ...ol];
  state.lastErrors     = errors;

  applyFiltersToResults();
}

function applyFiltersToResults() {
  let pods  = state.lastPodcasts;
  let books = state.lastAudiobooks;

  if (state.type === 'podcasts')   books = [];
  if (state.type === 'audiobooks') pods  = [];

  if (state.category !== 'all') {
    const cat = state.category.toLowerCase();
    pods  = pods.filter(p  => (p.genre  || '').toLowerCase().includes(cat));
    books = books.filter(b => (b.genre  || '').toLowerCase().includes(cat));
  }

  renderResults(pods, books, state.lastErrors);
}

/* ── API: iTunes ── */
async function fetchItunes(query) {
  const url = `https://itunes.apple.com/search?term=${enc(query)}&media=podcast&limit=12&entity=podcast`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error('iTunes ' + res.status);
  const data = await res.json();
  return (data.results || []).map(r => ({
    id:               'itunes-' + (r.collectionId || r.trackId),
    type:             'podcast',
    source:           'itunes',
    title:            r.collectionName || r.trackName || '',
    author:           r.artistName     || '',
    image:            r.artworkUrl100  ? r.artworkUrl100.replace('100x100bb', '300x300bb') : null,
    genre:            r.primaryGenreName || '',
    applePodcastsUrl: r.collectionViewUrl || null,
    free:             false,
  }));
}

/* ── API: LibriVox ── */
async function fetchLibrivox(query) {
  const url = `https://librivox.org/api/feed/audiobooks/?title=^${enc(query)}&format=json&extended=1&limit=8`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error('LibriVox ' + res.status);
  const data = await res.json();
  const books = data.books;
  if (!books || typeof books === 'string') return [];
  return books.map(b => ({
    id:          'lv-' + b.id,
    type:        'audiobook',
    source:      'librivox',
    title:       b.title        || '',
    author:      authorFromLV(b.authors),
    image:       null,
    genre:       (b.genres?.[0]?.name) || '',
    librivoxUrl: b.url_librivox  || null,
    free:        true,
  }));
}
function authorFromLV(authors) {
  if (!authors || !authors.length) return 'Unknown';
  const a = authors[0];
  return ((a.first_name || '') + ' ' + (a.last_name || '')).trim() || 'Unknown';
}

/* ── API: Open Library ── */
async function fetchOpenLibrary(query) {
  const url = `https://openlibrary.org/search.json?q=${enc(query)}&has_fulltext=true&limit=8`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error('Open Library ' + res.status);
  const data = await res.json();
  return (data.docs || []).map(d => ({
    id:             'ol-' + (d.key || '').replace(/\//g, '-'),
    type:           'audiobook',
    source:         'openlibrary',
    title:          d.title           || '',
    author:         (d.author_name?.[0]) || 'Unknown',
    image:          d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null,
    genre:          (d.subject?.[0])  || '',
    openLibraryKey: d.key             || null,
    free:           true,
  }));
}

/* ── Render results ── */
function renderResults(podcasts, audiobooks, errors) {
  const area = document.getElementById('results-area');

  let html = '';

  // Error notices
  const errNames = Object.keys(errors);
  if (errNames.length) {
    html += '<div style="margin-bottom:16px">' +
      errNames.map(n => `<span class="error-notice">⚠ ${esc(n)} unavailable</span>`).join('') +
      '</div>';
  }

  if (!podcasts.length && !audiobooks.length) {
    area.innerHTML = html + `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>No results found</h3>
        <p>Try a different search term or adjust the filters</p>
      </div>`;
    return;
  }

  if (podcasts.length) {
    html += `
      <div class="results-section">
        <div class="results-header">
          <span class="results-title">Podcasts</span>
          <span class="results-meta">${podcasts.length} result${podcasts.length !== 1 ? 's' : ''} · iTunes</span>
        </div>
        <div class="card-grid" data-section="podcasts">
          ${podcasts.map(cardHTML).join('')}
        </div>
      </div>`;
  }

  if (audiobooks.length) {
    const srcs = [...new Set(audiobooks.map(b => b.source === 'librivox' ? 'LibriVox' : 'Open Library'))].join(', ');
    html += `
      <div class="results-section">
        <div class="results-header">
          <span class="results-title">Audiobooks</span>
          <span class="results-meta">${audiobooks.length} result${audiobooks.length !== 1 ? 's' : ''} · ${srcs}</span>
        </div>
        <div class="card-grid" data-section="audiobooks">
          ${audiobooks.map(cardHTML).join('')}
        </div>
      </div>`;
  }

  area.innerHTML = html;

  // Card click → modal
  const allItems = [...podcasts, ...audiobooks];
  area.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const item = allItems.find(i => i.id === card.dataset.id);
      if (item) openModal(item);
    });
  });
}

function cardHTML(item) {
  const emoji = item.type === 'podcast' ? '🎙' : '📚';
  const coverInner = item.image
    ? `<img src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy"
         onerror="this.parentElement.outerHTML='<div class=&quot;card-cover-emoji&quot;>${emoji}</div>'">`
    : '';
  const coverEl = item.image
    ? `<div class="card-cover">${coverInner}</div>`
    : `<div class="card-cover-emoji">${emoji}</div>`;

  const srcLabel = item.source === 'itunes' ? 'iTunes'
    : item.source === 'librivox' ? 'LibriVox' : 'Open Library';

  return `
    <div class="card" data-id="${esc(item.id)}" role="button" tabindex="0" aria-label="${esc(item.title)}">
      ${coverEl}
      <div class="card-body">
        <div class="card-title">${esc(item.title)}</div>
        <div class="card-author">${esc(item.author)}</div>
        <div class="card-tags">
          <span class="tag tag-type">${item.type === 'podcast' ? 'Podcast' : 'Audiobook'}</span>
          <span class="tag tag-${item.source}">${esc(srcLabel)}</span>
          ${item.free ? '<span class="tag tag-free">Free</span>' : ''}
        </div>
      </div>
    </div>`;
}

/* ══════════════════════════════
   MODAL
   ══════════════════════════════ */
function openModal(item) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  const emoji   = item.type === 'podcast' ? '🎙' : '📚';

  const coverEl = item.image
    ? `<img class="modal-cover" src="${esc(item.image)}" alt="${esc(item.title)}"
          onerror="this.outerHTML='<div class=&quot;modal-cover-emoji&quot;>${emoji}</div>'">`
    : `<div class="modal-cover-emoji">${emoji}</div>`;

  const srcLabel = item.source === 'itunes' ? 'iTunes'
    : item.source === 'librivox' ? 'LibriVox' : 'Open Library';

  const platforms = buildPlatformButtons(item);

  content.innerHTML = `
    <div class="modal-header">
      ${coverEl}
      <div class="modal-info">
        <div class="modal-title">${esc(item.title)}</div>
        <div class="modal-author">${esc(item.author)}</div>
        <div class="modal-tags">
          <span class="tag tag-type">${item.type === 'podcast' ? 'Podcast' : 'Audiobook'}</span>
          <span class="tag tag-${item.source}">${esc(srcLabel)}</span>
          ${item.free ? '<span class="tag tag-free">Free</span>' : ''}
        </div>
      </div>
    </div>
    <hr class="modal-divider">
    <div class="modal-section-label">Listen on</div>
    <div class="platform-list">
      ${platforms.map(p => `
        <a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer"
           class="platform-btn platform-btn-${p.style}">
          <span>${esc(p.label)}</span>
          <span class="arrow">↗</span>
        </a>`).join('')}
    </div>`;

  overlay.classList.remove('hidden');
  overlay.focus();
}

function buildPlatformButtons(item) {
  const t   = enc(item.title);
  const out = [];

  if (item.type === 'podcast') {
    if (item.applePodcastsUrl) {
      out.push({ label: 'Apple Podcasts', url: item.applePodcastsUrl, style: 'visit' });
    }
    out.push(
      { label: 'Spotify',        url: `https://open.spotify.com/search/${t}`,                  style: CONNECTED.has('spotify') ? 'connected' : 'visit' },
      { label: 'Podimo',         url: `https://podimo.com/search?q=${t}`,                       style: CONNECTED.has('podimo')  ? 'connected' : 'visit' },
      { label: 'Wondery',        url: `https://wondery.com/search?q=${t}`,                      style: 'visit' },
      { label: 'Google Podcasts',url: `https://podcasts.google.com/search/${t}`,                style: 'visit' },
      { label: 'YouTube',        url: `https://youtube.com/results?search_query=${t}+podcast`,  style: 'visit' },
    );
  } else {
    if (item.librivoxUrl) {
      out.push({ label: 'LibriVox — Free Listen', url: item.librivoxUrl, style: 'free' });
    }
    if (item.openLibraryKey) {
      out.push({ label: 'Open Library — Free', url: `https://openlibrary.org${item.openLibraryKey}`, style: 'free' });
    }
    out.push(
      { label: 'Internet Archive — Free', url: `https://archive.org/search?query=${t}+audiobook`, style: 'free' },
      { label: 'Audible',  url: `https://www.audible.com/search?keywords=${t}`,    style: CONNECTED.has('audible') ? 'connected' : 'visit' },
      { label: 'Storytel', url: `https://www.storytel.com/search#query=${t}`,      style: 'visit' },
      { label: 'Scribd',   url: `https://www.scribd.com/search?query=${t}`,        style: 'visit' },
      { label: 'Kobo',     url: `https://www.kobo.com/search?query=${t}`,          style: 'visit' },
    );
  }
  return out;
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

/* ══════════════════════════════
   POPULAR
   ══════════════════════════════ */
async function loadPopular() {
  if (state.popularCache) { renderPopular(state.popularCache); return; }

  const list = document.getElementById('popular-list');
  list.innerHTML = spinnerHTML();

  try {
    const res  = await fetch('https://itunes.apple.com/us/rss/toppodcasts/limit=20/json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    state.popularCache = data.feed?.entry || [];
    renderPopular(state.popularCache);
  } catch (e) {
    list.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📡</div><h3>Charts unavailable</h3><p>Could not load Apple Podcast charts. Try again later.</p></div>`;
  }
}

const CAT_COLORS = {
  'True Crime':       { bg: '#FBE8E8', border: '#E57373', text: '#C62828' },
  'Comedy':           { bg: '#F3E8FB', border: '#BA68C8', text: '#6A1B9A' },
  'Business':         { bg: '#E8F0FB', border: '#64B5F6', text: '#1565C0' },
  'Technology':       { bg: '#E8EEF8', border: '#7986CB', text: '#283593' },
  'Society & Culture':{ bg: '#E8F5EE', border: '#66BB6A', text: '#2E7D32' },
  'Health & Fitness': { bg: '#FBF0E8', border: '#FFA726', text: '#E65100' },
  'Education':        { bg: '#FBF8E8', border: '#FFD54F', text: '#F57F17' },
  'History':          { bg: '#F2EDE8', border: '#A1887F', text: '#4E342E' },
  'Science':          { bg: '#E8F5F3', border: '#4DB6AC', text: '#00695C' },
  'Sports':           { bg: '#E8F0F8', border: '#42A5F5', text: '#0D47A1' },
  'News':             { bg: '#EFEFEF', border: '#BDBDBD', text: '#424242' },
};

function renderPopular(entries) {
  const list = document.getElementById('popular-list');
  list.innerHTML = `<div class="popular-list">` +
    entries.map((e, i) => {
      const rank   = i + 1;
      const title  = e['im:name']?.label || 'Unknown';
      const author = e['im:artist']?.label || '';
      const img    = e['im:image']?.[1]?.label || e['im:image']?.[0]?.label || '';
      const cat    = e['category']?.attributes?.label || '';
      const url    = e['id']?.label || '#';
      const cols   = CAT_COLORS[cat] || { bg: '#F5F5F5', border: '#CCC', text: '#555' };
      const rankCls= rank <= 3 ? 'rank-top' : 'rank-normal';

      return `
        <div class="popular-row">
          <div class="popular-rank ${rankCls}">${rank}</div>
          <img class="popular-art" src="${esc(img)}" alt="${esc(title)}" loading="lazy"
               onerror="this.style.background='var(--beige)';this.src=''">
          <div class="popular-info">
            <div class="popular-title">${esc(title)}</div>
            <div class="popular-author">${esc(author)}</div>
          </div>
          <div class="popular-right">
            ${cat ? `<span class="cat-pill" style="background:${cols.bg};border-color:${cols.border};color:${cols.text}">${esc(cat)}</span>` : ''}
            <a href="${esc(url)}" target="_blank" rel="noopener" class="popular-apple">Apple ↗</a>
          </div>
        </div>`;
    }).join('') + `</div>`;
}

/* ══════════════════════════════
   COMMUNITY
   ══════════════════════════════ */
const DEMO_POSTS = [
  {
    id: 1, initials: 'MK', username: 'MIA K', time: '2h ago',
    source: null, category: 'True Crime',
    text: "Just finished 'My Favorite Murder' and I need more. Anyone obsessed with how Karen and Georgia blend comedy with true crime? It's become my daily commute ritual 🎙",
    likes: 14, liked: false,
  },
  {
    id: 2, initials: 'NL', username: 'u/NPRlover', time: '5h ago',
    source: 'reddit', category: 'Psychology',
    text: "Hidden Brain is genuinely one of the most underrated podcasts. Every episode makes me rethink something I assumed about human behavior. Shankar Vedantam is a genius.",
    likes: 87, liked: false,
  },
  {
    id: 3, initials: 'AD', username: '@audiophile.daily', time: '1d ago',
    source: 'tiktok', category: 'Comedy',
    text: "Found 'Conan O'Brien Needs a Friend' through MONO's cross-platform search and I literally cannot stop laughing 💀 This is the only app that searches everywhere at once.",
    likes: 342, liked: false,
  },
  {
    id: 4, initials: 'JR', username: 'JONAS R', time: '2d ago',
    source: null, category: 'Question',
    text: "Does anyone here use Storytel? I keep seeing it in MONO search results and wondering if it's worth subscribing alongside Audible. Any thoughts on the library size?",
    likes: 5, liked: false,
  },
];

let posts = DEMO_POSTS.map(p => ({ ...p }));

function initCommunity() {
  document.getElementById('post-btn').addEventListener('click', submitPost);
  document.getElementById('post-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitPost();
  });
}

function submitPost() {
  const input = document.getElementById('post-input');
  const text  = input.value.trim();
  if (!text) return;
  posts.unshift({
    id:       Date.now(),
    initials: 'AS',
    username: 'AS',
    time:     'Just now',
    source:   null,
    category: null,
    text,
    likes: 0,
    liked: false,
  });
  input.value = '';
  renderCommunityPosts();
}

function renderCommunityPosts() {
  const grid = document.getElementById('community-grid');
  grid.innerHTML = posts.map(postHTML).join('');

  grid.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id   = Number(btn.dataset.id);
      const post = posts.find(p => p.id === id);
      if (!post) return;
      post.liked  = !post.liked;
      post.likes += post.liked ? 1 : -1;
      renderCommunityPosts();
    });
  });
}

function postHTML(p) {
  const sourceBadge = p.source === 'reddit'
    ? `<span class="badge badge-coral">Reddit</span>`
    : p.source === 'tiktok'
    ? `<span class="badge badge-black">TikTok</span>`
    : '';
  const catBadge = p.category
    ? `<span class="badge badge-grey">${esc(p.category)}</span>`
    : '';
  const badges = (sourceBadge || catBadge)
    ? `<div class="post-badges">${sourceBadge}${catBadge}</div>`
    : '';

  return `
    <div class="post-card">
      <div class="post-header">
        <div class="post-avatar">${esc(p.initials)}</div>
        <div class="post-meta">
          <div class="post-username">${esc(p.username)}</div>
          <div class="post-time">${esc(p.time)}</div>
        </div>
      </div>
      ${badges}
      <div class="post-text">${esc(p.text)}</div>
      <div class="post-actions">
        <button class="post-action like-btn ${p.liked ? 'liked' : ''}" data-id="${p.id}">
          ♥ ${p.likes}
        </button>
        <button class="post-action">↩ Reply</button>
        <button class="post-action">⤴ Share</button>
      </div>
    </div>`;
}

/* ══════════════════════════════
   HELPERS
   ══════════════════════════════ */
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function enc(str) {
  return encodeURIComponent(str || '');
}

function spinnerHTML() {
  return '<div class="spinner-wrap"><div class="spinner"></div></div>';
}

/* ══════════════════════════════
   INIT
   ══════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initDiscover();
  initCommunity();
  renderCommunityPosts();

  // Modal close handlers
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});
