export type ServiceStatus = 'active' | 'inactive' | 'trial' | 'paused';

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
  accentColor: string;
  logoChar: string;
  status: ServiceStatus;
  plan: string;
  nextBillingDate: string;
  monthlyCost: number;
  weeklyUsageHours: number;
  weeklyUsage: WeeklyUsage[];
  category: 'audiobooks' | 'podcasts' | 'music' | 'mixed';
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
  accentColor: string;
  logoChar: string;
  category: string;
  monthlyCost: number;
  rating: number;
  userCount: string;
  highlights: string[];
}
