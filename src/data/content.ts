export type ContentBadge = 'FREE' | 'TRENDING' | 'EXCLUSIVE' | 'NEW' | 'AWARD';

export interface Podcast {
  id: string;
  title: string;
  author: string;
  category: 'True Crime' | 'News' | 'Business' | 'History' | 'Culture' | 'Design';
  image: string;
  badge: ContentBadge;
  platforms: string[];
  description: string;
}

export interface Audiobook {
  id: string;
  title: string;
  author: string;
  narrator: string;
  category: 'Self-Help' | 'Biography' | 'History' | 'Fiction' | 'Science' | 'Business';
  image: string;
  badge: ContentBadge;
  platforms: string[];
  runtime: string;
  description: string;
}

// ── Podcasts ──────────────────────────────────────────────────────────────────
// Source: Apple Podcasts 2025 year-end charts + Edison Research Q4 2025 US reach data
export const PODCASTS: Podcast[] = [
  // ── True Crime ──
  {
    id: 'crime-junkie',
    title: 'Crime Junkie',
    author: 'audiochuck',
    category: 'True Crime',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/f3/de/6d/f3de6d4e-e6e1-440b-b3f3-9f1b37f3d0d1/mza_5260484491791012706.jpeg/600x600bb.jpg',
    badge: 'TRENDING',
    platforms: ['Spotify', 'Apple Podcasts', 'Amazon Music'],
    description: 'No-nonsense true crime weekly. Every Monday, a new case you have to know about.',
  },
  {
    id: 'serial',
    title: 'Serial',
    author: 'This American Life / WBEZ',
    category: 'True Crime',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/85/c6/9d/85c69d0c-6d5b-5cd5-c038-4a3f1a8f5e72/mza_8671785891099897702.jpeg/600x600bb.jpg',
    badge: 'FREE',
    platforms: ['Spotify', 'Apple Podcasts', 'Amazon Music'],
    description: 'The original investigative journalism podcast. One story told week by week.',
  },
  {
    id: 'dateline-nbc',
    title: 'Dateline NBC',
    author: 'NBCUniversal News Group',
    category: 'True Crime',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/08/d3/06/08d306ad-df60-7c5f-6888-21f2bb4cab12/mza_8249673428065025523.jpeg/600x600bb.jpg',
    badge: 'TRENDING',
    platforms: ['Spotify', 'Apple Podcasts', 'Amazon Music'],
    description: "NBC's longest-running newsmagazine. Classic reporting on crime and justice.",
  },
  {
    id: 'morbid',
    title: 'Morbid',
    author: 'Morbid Network | Wondery',
    category: 'True Crime',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/8c/51/8c/8c518c8b-1e09-19bf-cbf7-6de4f1a4c6b0/mza_14001393701505449571.jpeg/600x600bb.jpg',
    badge: 'FREE',
    platforms: ['Spotify', 'Apple Podcasts', 'Amazon Music'],
    description: 'A true crime and all things spooky podcast with a wicked sense of humour.',
  },

  // ── News ──
  {
    id: 'the-daily',
    title: 'The Daily',
    author: 'The New York Times',
    category: 'News',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/e3/cd/90/e3cd9020-4027-be43-9b3d-8ea72a0fbab8/mza_6346736052854145720.jpeg/600x600bb.jpg',
    badge: 'TRENDING',
    platforms: ['Spotify', 'Apple Podcasts', 'Amazon Music'],
    description: 'The biggest stories of our time, with Michael Barbaro. 20 minutes every weekday.',
  },
  {
    id: 'up-first',
    title: 'Up First',
    author: 'NPR',
    category: 'News',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/27/01/8f/27018f9e-1a0e-7e98-56be-c5f1d57cddfd/mza_17264546665325616613.jpeg/600x600bb.jpg',
    badge: 'FREE',
    platforms: ['Spotify', 'Apple Podcasts', 'Amazon Music'],
    description: 'NPR's morning news in 10 minutes or less. Available before you get to work.',
  },
  {
    id: 'pod-save-america',
    title: 'Pod Save America',
    author: 'Crooked Media',
    category: 'News',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/35/37/a9/3537a9db-45eb-9c79-0d9d-1f0e3f2ee394/mza_12152388754264413527.jpeg/600x600bb.jpg',
    badge: 'FREE',
    platforms: ['Spotify', 'Apple Podcasts'],
    description: 'Four former Obama aides talking politics without the BS.',
  },

  // ── Business ──
  {
    id: 'mel-robbins',
    title: 'The Mel Robbins Podcast',
    author: 'Mel Robbins',
    category: 'Business',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/d8/8e/f8/d88ef8a7-1764-6e7f-6e8e-c48de3bb5c0e/mza_12654765406497609432.jpeg/600x600bb.jpg',
    badge: 'TRENDING',
    platforms: ['Spotify', 'Apple Podcasts', 'Amazon Music'],
    description: 'Actionable advice on motivation, habits, and personal growth.',
  },
  {
    id: 'how-i-built-this',
    title: 'How I Built This',
    author: 'Guy Raz / NPR',
    category: 'Business',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/16/42/c0/1642c03c-9456-78db-32e0-13843edea76b/mza_8818028394726124578.jpeg/600x600bb.jpg',
    badge: 'FREE',
    platforms: ['Spotify', 'Apple Podcasts', 'Amazon Music'],
    description: 'The stories behind the most iconic companies and the people who built them.',
  },
  {
    id: 'diary-of-a-ceo',
    title: 'The Diary of a CEO',
    author: 'Steven Bartlett',
    category: 'Business',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/f1/b2/44/f1b244de-0a84-aad4-7d57-4ba38aeb5063/mza_15756019609447027.jpeg/600x600bb.jpg',
    badge: 'TRENDING',
    platforms: ['Spotify', 'Apple Podcasts', 'Amazon Music'],
    description: 'No-filter conversations with the world's most successful business leaders.',
  },

  // ── History ──
  {
    id: 'hardcore-history',
    title: 'Hardcore History',
    author: 'Dan Carlin',
    category: 'History',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/68/8e/5a/688e5a61-25b2-6700-a2e9-cee33cff78ec/mza_11781750741965673434.jpeg/600x600bb.jpg',
    badge: 'FREE',
    platforms: ['Spotify', 'Apple Podcasts', 'Amazon Music'],
    description: "Monumental history told in Dan Carlin's singular, deeply researched style.",
  },
  {
    id: 'revolutions',
    title: 'Revolutions',
    author: 'Mike Duncan',
    category: 'History',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts122/v4/5f/0d/5b/5f0d5b7c-1b41-7b8b-7f28-7f4ffe3d8bd2/mza_6730565803893289929.jpeg/600x600bb.jpg',
    badge: 'FREE',
    platforms: ['Spotify', 'Apple Podcasts'],
    description: 'An exploration of the great political revolutions that have shaped our world.',
  },

  // ── Culture ──
  {
    id: 'joe-rogan',
    title: 'The Joe Rogan Experience',
    author: 'Joe Rogan',
    category: 'Culture',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/9e/db/5c/9edb5c74-3ed4-61e5-e8d2-26f18fc47f3a/mza_8588849462545484491.jpeg/600x600bb.jpg',
    badge: 'TRENDING',
    platforms: ['Spotify', 'Apple Podcasts', 'Amazon Music'],
    description: '#1 podcast in the world. Long-form conversations with comedians, athletes, scientists and thinkers.',
  },
  {
    id: 'smartless',
    title: 'SmartLess',
    author: 'Jason Bateman, Sean Hayes, Will Arnett',
    category: 'Culture',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/07/ac/dc/07acdc20-5892-4a76-a386-15e3867e7cbe/mza_7897700440753636613.jpeg/600x600bb.jpg',
    badge: 'TRENDING',
    platforms: ['Spotify', 'Apple Podcasts', 'Amazon Music'],
    description: 'Three A-list comedians surprise each other with a mystery celebrity guest each episode.',
  },
  {
    id: 'conan-needs-a-friend',
    title: 'Conan O\'Brien Needs a Friend',
    author: 'Team Coco & SiriusXM',
    category: 'Culture',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/f7/39/db/f739db73-23e6-6a4f-a9c2-a26c78ba39a4/mza_14451754665561700038.jpeg/600x600bb.jpg',
    badge: 'FREE',
    platforms: ['Spotify', 'Apple Podcasts', 'Amazon Music'],
    description: 'After 25 years Conan realises he has no friends. His podcast is the journey to fix that.',
  },
  {
    id: 'call-her-daddy',
    title: 'Call Her Daddy',
    author: 'Alex Cooper / Unwell Network',
    category: 'Culture',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/c9/0d/f2/c90df212-5b13-14e1-28ba-db5f9d8bbcea/mza_16697200085282085506.jpeg/600x600bb.jpg',
    badge: 'TRENDING',
    platforms: ['Spotify', 'Apple Podcasts', 'Amazon Music'],
    description: 'The No. 1 podcast for women — raw, unfiltered conversations about life, sex and culture.',
  },

  // ── Design ──
  {
    id: '99pi',
    title: '99% Invisible',
    author: 'Roman Mars',
    category: 'Design',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/d2/5c/26/d25c2654-b050-24f9-5b96-33db1a3c8c86/mza_7580960052898468882.jpeg/600x600bb.jpg',
    badge: 'FREE',
    platforms: ['Spotify', 'Apple Podcasts', 'Amazon Music'],
    description: 'A show about all the thought that goes into the things we don\'t think about.',
  },
];

// ── Audiobooks ────────────────────────────────────────────────────────────────
// Source: Audible 2025 Audiobook of the Year, NYPL 2025 most-borrowed, Penguin RH Library list
export const AUDIOBOOKS: Audiobook[] = [
  {
    id: 'atmosphere',
    title: 'Atmosphere',
    author: 'Taylor Jenkins Reid',
    narrator: 'Kristen DiMercurio & Julia Whelan',
    category: 'Fiction',
    image: 'https://covers.openlibrary.org/b/isbn/0593448553-L.jpg',
    badge: 'AWARD',
    platforms: ['Audible', 'Spotify'],
    runtime: '14h 2m',
    description: "Audible's Audiobook of the Year 2025. A stunning novel about the first woman in space.",
  },
  {
    id: 'james',
    title: 'James',
    author: 'Percival Everett',
    narrator: 'Dominic Hoffman',
    category: 'Fiction',
    image: 'https://covers.openlibrary.org/b/isbn/0385550367-L.jpg',
    badge: 'AWARD',
    platforms: ['Audible', 'Storytel', 'Spotify'],
    runtime: '9h 51m',
    description: 'NYPL\'s most-borrowed audiobook of 2025. A radical reimagining of Huckleberry Finn through James\'s eyes.',
  },
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    narrator: 'James Clear',
    category: 'Self-Help',
    image: 'https://covers.openlibrary.org/b/isbn/0735211299-L.jpg',
    badge: 'TRENDING',
    platforms: ['Audible', 'Storytel', 'Spotify', 'Libro.fm'],
    runtime: '5h 35m',
    description: 'The definitive guide to building good habits and breaking bad ones, backed by science.',
  },
  {
    id: 'sapiens',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    narrator: 'Derek Perkins',
    category: 'History',
    image: 'https://covers.openlibrary.org/b/isbn/0062316117-L.jpg',
    badge: 'FREE',
    platforms: ['Audible', 'Storytel', 'Spotify'],
    runtime: '15h 17m',
    description: "A sweeping narrative that challenges everything we thought we knew about humanity's origins.",
  },
  {
    id: 'educated',
    title: 'Educated',
    author: 'Tara Westover',
    narrator: 'Julia Whelan',
    category: 'Biography',
    image: 'https://covers.openlibrary.org/b/isbn/0399590501-L.jpg',
    badge: 'TRENDING',
    platforms: ['Audible', 'Storytel', 'Spotify', 'Libro.fm'],
    runtime: '12h 10m',
    description: 'A memoir about a woman who grew up in a survivalist family and educated herself into Cambridge.',
  },
  {
    id: 'becoming',
    title: 'Becoming',
    author: 'Michelle Obama',
    narrator: 'Michelle Obama',
    category: 'Biography',
    image: 'https://covers.openlibrary.org/b/isbn/1524763136-L.jpg',
    badge: 'FREE',
    platforms: ['Audible', 'Storytel', 'Spotify'],
    runtime: '19h 3m',
    description: 'A deeply personal memoir by the former First Lady, narrated in her own voice.',
  },
  {
    id: 'born-a-crime',
    title: 'Born a Crime',
    author: 'Trevor Noah',
    narrator: 'Trevor Noah',
    category: 'Biography',
    image: 'https://covers.openlibrary.org/b/isbn/0399588191-L.jpg',
    badge: 'TRENDING',
    platforms: ['Audible', 'Storytel', 'Spotify', 'Libro.fm'],
    runtime: '8h 44m',
    description: "Stories from a South African childhood under apartheid, told with humour and heart.",
  },
  {
    id: 'thinking-fast-and-slow',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    narrator: 'Patrick Egan',
    category: 'Science',
    image: 'https://covers.openlibrary.org/b/isbn/0374533555-L.jpg',
    badge: 'FREE',
    platforms: ['Audible', 'Storytel'],
    runtime: '20h 2m',
    description: 'A Nobel laureate explores the two systems that shape our judgements and choices.',
  },
  {
    id: 'dune',
    title: 'Dune',
    author: 'Frank Herbert',
    narrator: 'Scott Brick, Orlagh Cassidy, et al.',
    category: 'Fiction',
    image: 'https://covers.openlibrary.org/b/isbn/0441013597-L.jpg',
    badge: 'TRENDING',
    platforms: ['Audible', 'Storytel', 'Spotify'],
    runtime: '21h 2m',
    description: 'The greatest science-fiction novel ever written. A fully cast performance edition.',
  },
  {
    id: 'the-alchemist',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    narrator: 'Jeremy Irons',
    category: 'Fiction',
    image: 'https://covers.openlibrary.org/b/isbn/0062315007-L.jpg',
    badge: 'FREE',
    platforms: ['Audible', 'Storytel', 'Spotify'],
    runtime: '4h 21m',
    description: 'A fable about a young shepherd following his dreams across the Sahara to the pyramids.',
  },
  {
    id: '48-laws',
    title: 'The 48 Laws of Power',
    author: 'Robert Greene',
    narrator: 'Richard Poe',
    category: 'Business',
    image: 'https://covers.openlibrary.org/b/isbn/0670881465-L.jpg',
    badge: 'FREE',
    platforms: ['Audible', 'Storytel'],
    runtime: '24h 10m',
    description: 'Distilled from 3,000 years of history — the definitive guide to power and influence.',
  },
  {
    id: 'maybe-you-should-talk-to-someone',
    title: 'Maybe You Should Talk to Someone',
    author: 'Lori Gottlieb',
    narrator: 'Brittany Pressley',
    category: 'Self-Help',
    image: 'https://covers.openlibrary.org/b/isbn/1328662055-L.jpg',
    badge: 'NEW',
    platforms: ['Audible', 'Storytel', 'Spotify', 'Libro.fm'],
    runtime: '14h 15m',
    description: 'A therapist goes to therapy — a candid, funny look at what it means to be human.',
  },
];

export const PLATFORM_COLORS: Record<string, string> = {
  'Audible':        '#F59E0B',
  'Spotify':        '#1DB954',
  'Storytel':       '#8B5CF6',
  'Apple Podcasts': '#FC3C44',
  'Amazon Music':   '#00A8E1',
  'Podimo':         '#EF4444',
  'Libro.fm':       '#D97706',
};
