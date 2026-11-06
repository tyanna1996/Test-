/**
 * AudNexus community API — aggregates Audible metadata.
 * Docs: https://audnex.us/
 *
 * Returns Audible ASIN, narrator, runtime, cover and descriptions.
 * No key required. Rate-limited to ~1 req/s.
 */
import fetch from 'node-fetch';

const BASE = 'https://api.audnex.us';

export interface AudnexBook {
  asin: string;
  title: string;
  authors: Array<{ asin?: string; name: string }>;
  narrators: Array<{ name: string }>;
  genres: Array<{ asin?: string; name: string; type: string }>;
  image: string;
  summary: string;
  runtimeLengthMin: number;
  releaseDate: string;
}

export async function lookupByAsin(asin: string): Promise<AudnexBook | null> {
  try {
    const res = await fetch(`${BASE}/books/${asin}`);
    if (!res.ok) return null;
    return (await res.json()) as AudnexBook;
  } catch {
    return null;
  }
}

export async function searchByTitle(title: string): Promise<AudnexBook | null> {
  try {
    // AudNexus doesn't have a search endpoint — look up by known ASINs map
    // For seeding, use the KNOWN_ASINS map below and fall back gracefully
    return null;
  } catch {
    return null;
  }
}

/** Well-known Audible ASINs for the audiobooks in our catalog */
export const KNOWN_ASINS: Record<string, string> = {
  'atomic-habits':                    'B07RFSSYBH',
  'sapiens':                          'B0741F3M7C',
  'educated':                         'B07CLLCNPX',
  'becoming':                         'B07B3JNTQV',
  'born-a-crime':                     'B01IW9TQPK',
  'the-alchemist':                    'B00B9TGL9A',
  'thinking-fast-and-slow':           'B005Z9GAJG',
  'dune':                             'B004FZMBK6',
  '48-laws':                          'B002V5GEB4',
  'maybe-you-should-talk-to-someone': 'B07MXX97X9',
  'atmosphere':                       'B0CZWQKMPJ',
  'james':                            'B0CRLFR6NG',
};
