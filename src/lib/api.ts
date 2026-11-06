/**
 * Audify API client.
 * Falls back to static data from content.ts if the API is unreachable.
 */
import { PODCASTS as STATIC_PODS, AUDIOBOOKS as STATIC_BOOKS } from '../data/content';
import type { Podcast, Audiobook } from '../data/content';

const BASE = import.meta.env.VITE_API_URL ?? '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}

export interface ApiPodcast {
  id: string; apple_id: number | null; title: string; author: string;
  category: string; image_url: string | null; description: string | null;
  badge: string; platforms: string[];
}

export interface ApiAudiobook {
  id: string; apple_id: number | null; asin: string | null;
  title: string; author: string; narrator: string | null;
  category: string; image_url: string | null; description: string | null;
  runtime_minutes: number | null; badge: string; platforms: string[];
}

function toPodcast(a: ApiPodcast): Podcast {
  return {
    id: a.id, title: a.title, author: a.author,
    category: a.category as Podcast['category'],
    image: a.image_url ?? '',
    badge: a.badge as Podcast['badge'],
    platforms: a.platforms,
    description: a.description ?? '',
  };
}

function toAudiobook(a: ApiAudiobook): Audiobook {
  const mins = a.runtime_minutes ?? 0;
  const h = Math.floor(mins / 60), m = mins % 60;
  const runtime = h > 0 ? `${h}h ${m.toString().padStart(2,'0')}m` : `${m}m`;
  return {
    id: a.id, title: a.title, author: a.author,
    narrator: a.narrator ?? '',
    category: a.category as Audiobook['category'],
    image: a.image_url ?? '',
    badge: a.badge as Audiobook['badge'],
    platforms: a.platforms,
    runtime,
    description: a.description ?? '',
  };
}

export async function fetchPodcasts(params: {
  q?: string; category?: string; platform?: string; limit?: number;
} = {}): Promise<Podcast[]> {
  try {
    const qs = new URLSearchParams();
    if (params.q)        qs.set('q', params.q);
    if (params.category) qs.set('category', params.category);
    if (params.platform) qs.set('platform', params.platform);
    if (params.limit)    qs.set('limit', String(params.limit));
    const { data } = await get<{ data: ApiPodcast[] }>(`/podcasts?${qs}`);
    return data.map(toPodcast);
  } catch {
    // API unavailable — use static data
    let list = STATIC_PODS;
    if (params.category && params.category !== 'All') list = list.filter(p => p.category === params.category);
    if (params.q) { const lq = params.q.toLowerCase(); list = list.filter(p => p.title.toLowerCase().includes(lq) || p.author.toLowerCase().includes(lq)); }
    return list;
  }
}

export async function fetchAudiobooks(params: {
  q?: string; category?: string; platform?: string; limit?: number;
} = {}): Promise<Audiobook[]> {
  try {
    const qs = new URLSearchParams();
    if (params.q)        qs.set('q', params.q);
    if (params.category) qs.set('category', params.category);
    if (params.platform) qs.set('platform', params.platform);
    if (params.limit)    qs.set('limit', String(params.limit));
    const { data } = await get<{ data: ApiAudiobook[] }>(`/audiobooks?${qs}`);
    return data.map(toAudiobook);
  } catch {
    let list = STATIC_BOOKS;
    if (params.category && params.category !== 'All') list = list.filter(b => b.category === params.category);
    if (params.q) { const lq = params.q.toLowerCase(); list = list.filter(b => b.title.toLowerCase().includes(lq) || b.author.toLowerCase().includes(lq)); }
    return list;
  }
}

export async function search(q: string): Promise<{ podcasts: Podcast[]; audiobooks: Audiobook[] }> {
  try {
    const r = await get<{ podcasts: ApiPodcast[]; audiobooks: ApiAudiobook[] }>(`/search?q=${encodeURIComponent(q)}`);
    return { podcasts: r.podcasts.map(toPodcast), audiobooks: r.audiobooks.map(toAudiobook) };
  } catch {
    const lq = q.toLowerCase();
    return {
      podcasts:   STATIC_PODS.filter(p => p.title.toLowerCase().includes(lq) || p.author.toLowerCase().includes(lq)),
      audiobooks: STATIC_BOOKS.filter(b => b.title.toLowerCase().includes(lq) || b.author.toLowerCase().includes(lq)),
    };
  }
}
