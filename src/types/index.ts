export type ServiceStatus = 'active' | 'inactive' | 'trial' | 'paused';
export type ServiceCategory = 'audiobooks' | 'podcasts' | 'music' | 'mixed';

export interface WeeklyUsage {
  day: string;
  hours: number;
}

export interface MonthlySpend {
  month: string;
  amount: number;
}

export interface Service {
  id: string;
  name: string;
  tagline: string;
  logoChar: string;
  /** CSS hex accent colour — used for charts only; UI chrome uses Tailwind token classes */
  accentColor: string;
  status: ServiceStatus;
  plan: string;
  /** ISO date string YYYY-MM-DD */
  nextBillingDate: string;
  monthlyCost: number;
  weeklyUsageHours: number;
  /** Always 7 entries, Mon–Sun */
  weeklyUsage: WeeklyUsage[];
  category: ServiceCategory;
  /** Present only when status === 'trial' */
  trialEndsDate?: string;
  totalListened: number;
  titlesAccessed: number;
}

export interface Notification {
  id: string;
  type: 'billing' | 'trial' | 'new' | 'usage';
  message: string;
  time: string;
  read: boolean;
}

export interface DiscoverService {
  id: string;
  name: string;
  tagline: string;
  logoChar: string;
  category: string;
  monthlyCost: number;
  rating: number;
  userCount: string;
  highlights: string[];
}
