import { useMemo } from 'react';
import { DollarSign, Clock, Layers, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area,
  BarChart, Bar, Cell,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { services, monthlySpendData } from '../data/services';
import ServiceLogo from '../components/ui/ServiceLogo';
import StatusBadge from '../components/ui/StatusBadge';

/* ── Shared chart tooltip ─────────────────────────────── */
function ChartTooltip({
  active, payload, label, prefix = '', suffix = '',
}: {
  active?: boolean; payload?: any[]; label?: string;
  prefix?: string; suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-xs shadow-xl" role="tooltip">
      <p className="text-text-secondary mb-0.5">{label}</p>
      <p className="font-mono font-medium text-text-primary">
        {prefix}{payload[0].value}{suffix}
      </p>
    </div>
  );
}

/* ── Stat card ────────────────────────────────────────── */
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClass = 'text-teal',
  iconBg = 'bg-teal-dim',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  iconClass?: string;
  iconBg?: string;
}) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={15} className={iconClass} strokeWidth={2} aria-hidden="true" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-semibold font-mono text-text-primary">{value}</p>
        {sub && <p className="text-xs mt-1 text-text-secondary">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Chart card wrapper ───────────────────────────────── */
function ChartCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        {sub && <p className="text-xs mt-0.5 text-text-secondary">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

/* ── Dashboard ────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();

  const { totalMonthly, totalHours, activeCount, trialService } = useMemo(() => ({
    totalMonthly: services
      .filter((s) => s.status !== 'inactive')
      .reduce((sum, s) => sum + s.monthlyCost, 0),
    totalHours: services.reduce((sum, s) => sum + s.weeklyUsageHours, 0),
    activeCount: services.filter((s) => s.status === 'active' || s.status === 'trial').length,
    trialService: services.find((s) => s.status === 'trial'),
  }), []);

  const usageBarData = useMemo(
    () => services.map((s) => ({ name: s.name, hours: s.weeklyUsageHours, color: s.accentColor })),
    [],
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Good morning, Jamie</h1>
        <p className="text-sm mt-0.5 text-text-secondary">
          Here's your audio subscription overview for April 2026.
        </p>
      </div>

      {/* Trial warning */}
      {trialService && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm bg-amber-dim border border-amber/25"
          role="alert"
        >
          <AlertTriangle size={15} className="text-amber flex-shrink-0" aria-hidden="true" />
          <p className="text-text-primary">
            <span className="text-amber font-semibold">Podimo trial</span> expires on Apr 30 — you'll
            be charged{' '}
            <span className="font-mono">${trialService.monthlyCost}/mo</span> if you don't cancel.
          </p>
          <button
            onClick={() => navigate('/subscriptions')}
            className="ml-auto flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber/15 text-amber hover:bg-amber/25"
          >
            Review
          </button>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Monthly Spend"
          value={`$${totalMonthly.toFixed(2)}`}
          sub="Across all active subs"
        />
        <StatCard
          icon={Clock}
          label="Weekly Listen"
          value={`${totalHours.toFixed(1)}h`}
          sub="Total across platforms"
          iconClass="text-purple"
          iconBg="bg-purple-dim"
        />
        <StatCard
          icon={Layers}
          label="Active Services"
          value={String(activeCount)}
          sub={`of ${services.length} connected`}
          iconClass="text-blue"
          iconBg="bg-blue-dim"
        />
        <StatCard
          icon={TrendingUp}
          label="Annual Spend"
          value={`$${(totalMonthly * 12).toFixed(0)}`}
          sub="Projected for 2026"
          iconClass="text-amber"
          iconBg="bg-amber-dim"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <ChartCard title="Monthly Spend" sub="Last 6 months" >
          <div className="lg:col-span-3">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlySpendData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00d4aa" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252d42" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#8892a4', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8892a4', fontSize: 11, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<ChartTooltip prefix="$" />} cursor={{ stroke: '#252d42', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="amount" stroke="#00d4aa" strokeWidth={2} fill="url(#spendGrad)"
                  dot={{ fill: '#00d4aa', r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: '#00d4aa', r: 5, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Weekly Usage" sub="Hours per platform">
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={usageBarData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252d42" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#8892a4', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8892a4', fontSize: 11, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}h`} />
                <Tooltip content={<ChartTooltip suffix="h" />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {usageBarData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Connected services table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">Connected Services</h2>
          <button
            onClick={() => navigate('/subscriptions')}
            className="text-xs font-medium text-teal hover:text-teal-hover"
          >
            View all →
          </button>
        </div>
        <ul role="list">
          {services.map((service, i) => (
            <li
              key={service.id}
              className={`flex items-center gap-4 px-5 py-3.5 hover:bg-bg-hover transition-colors ${i < services.length - 1 ? 'border-b border-border' : ''}`}
            >
              <ServiceLogo id={service.id} name={service.name} logoChar={service.logoChar} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{service.name}</p>
                <p className="text-xs text-text-secondary">{service.plan}</p>
              </div>
              <StatusBadge status={service.status} />
              <div className="text-right">
                <p className="text-sm font-medium font-mono text-text-primary">
                  ${service.monthlyCost.toFixed(2)}
                </p>
                <p className="text-xs text-text-secondary">/month</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
