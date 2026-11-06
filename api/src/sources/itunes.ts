/**
 * iTunes Search API client.
 * Docs: https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/
 *
 * Public API — no key required. Fetches podcast and audiobook metadata
 * including Apple IDs and high-res artwork URLs.
 */
import fetch from 'node-fetch';

const BASE = 'https://itunes.apple.com';
const TIMEOUT = 8000;

export interface ItunesPodcast {
  trackId: number;
  trackName: string;
  artistName: string;
  primaryGenreName: string;
  artworkUrl600: string;
  trackViewUrl: string;
  description?: string;
}

export interface ItunesAudiobook {
  collectionId: number;
  collectionName: string;
  artistName: string;
  primaryGenreName: string;
  artworkUrl600: string;
  description?: string;
  collectionViewUrl: string;
  trackTimeMillis?: number;
}

export async function searchPodcasts(term: string, limit = 25): Promise<ItunesPodcast[]> {
  const url = `${BASE}/search?media=podcast&term=${encodeURIComponent(term)}&limit=${limit}&country=us`;
  const res = await fetchWithTimeout(url);
  const data = (await res.json()) as { results: ItunesPodcast[] };
  return data.results ?? [];
}

export async function lookupPodcast(appleId: number): Promise<ItunesPodcast | null> {
  const url = `${BASE}/lookup?id=${appleId}&media=podcast`;
  const res = await fetchWithTimeout(url);
  const data = (await res.json()) as { results: ItunesPodcast[] };
  return data.results?.[0] ?? null;
}

export async function searchAudiobooks(term: string, limit = 25): Promise<ItunesAudiobook[]> {
  const url = `${BASE}/search?media=audiobook&term=${encodeURIComponent(term)}&limit=${limit}&country=us`;
  const res = await fetchWithTimeout(url);
  const data = (await res.json()) as { results: ItunesAudiobook[] };
  return data.results ?? [];
}

export async function lookupAudiobook(appleId: number): Promise<ItunesAudiobook | null> {
  const url = `${BASE}/lookup?id=${appleId}&media=audiobook`;
  const res = await fetchWithTimeout(url);
  const data = (await res.json()) as { results: ItunesAudiobook[] };
  return data.results?.[0] ?? null;
}

async function fetchWithTimeout(url: string) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    return await fetch(url, { signal: ctrl.signal as import('node-fetch').RequestInit['signal'] });
  } finally {
    clearTimeout(id);
  }
}
