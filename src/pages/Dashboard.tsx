import { useMemo } from 'react';
import { DollarSign, Clock, Layers, AlertTriangle, Calendar } from 'lucide-react';
import {
  AreaChart, Area,
  BarChart, Bar, Cell,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { services, monthlySpendData } from '../data/services';
import type { Service } from '../types';
import ServiceLogo from '../components/ui/ServiceLogo';
import StatusBadge from '../components/ui/StatusBadge';

/* ── Chart tooltip ────────────────────────────────────── */
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
  icon: Icon, label, value, sub,
  iconClass = 'text-teal', iconBg = 'bg-teal-dim',
}: {
  icon: React.ElementType;
  label: string; value: string; sub?: string;
  iconClass?: string; iconBg?: string;
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
function ChartCard({
  title, sub, children, className = '',
}: {
  title: string; sub?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        {sub && <p className="text-xs mt-0.5 text-text-secondary">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

/* ── Connected-service card ───────────────────────────── */
function ServiceGridCard({ service, onClick }: { service: Service; onClick: () => void }) {
  const billingLabel = new Date(service.nextBillingDate + 'T00:00:00')
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <button
      onClick={onClick}
      className="card p-4 flex flex-col gap-3 hover:bg-bg-hover transition-colors text-left w-full group"
      aria-label={`${service.name} — ${service.status}`}
    >
      <div className="flex items-start justify-between">
        <ServiceLogo id={service.id} name={service.name} logoChar={service.logoChar} size="md" />
        <StatusBadge status={service.status} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-text-primary group-hover:text-teal transition-colors">
          {service.name}
        </h3>
        <p className="text-xs mt-0.5 text-text-secondary truncate">{service.plan}</p>
      </div>
      <div className="pt-3 border-t border-border flex items-end justify-between">
        <div>
          <p className="text-xs text-text-muted">Next billing</p>
          <p className="text-xs font-mono text-text-secondary mt-0.5">{billingLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold font-mono text-text-primary leading-none">
            ${service.monthlyCost.toFixed(2)}
          </p>
          <p className="text-xs text-text-muted mt-0.5">/month</p>
        </div>
      </div>
    </button>
  );
}

/* ── Renewal timeline ─────────────────────────────────── */
function RenewalTimeline() {
  const TODAY = new Date('2026-04-23T00:00:00');
  const WINDOW = 30;
  const TRACK_TOP = 68;

  const events = useMemo(() => {
    const sorted = services
      .filter((s) => s.status !== 'inactive')
      .map((s) => {
        const date = new Date(s.nextBillingDate + 'T00:00:00');
        const days = Math.round((date.getTime() - TODAY.getTime()) / 86400000);
        const pct = Math.min(96, Math.max(4, (days / WINDOW) * 100));
        return { ...s, days, pct };
      })
      .filter((e) => e.days >= 0 && e.days <= WINDOW)
      .sort((a, b) => a.days - b.days);
    return sorted.map((e, i) => ({ ...e, above: i % 2 === 0 }));
  }, []);

  const fmtDate = (s: string) =>
    new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="card p-5 pb-6">
      <h2 className="text-sm font-semibold text-text-primary">Renewal Timeline</h2>
      <p className="text-xs mt-0.5 text-text-secondary mb-6">
        Upcoming billing dates — next 30 days
      </p>

      <div className="overflow-x-auto">
        <div style={{ position: 'relative', height: 156, minWidth: 320 }}>

          {/* Labels ABOVE track */}
          {events.filter((e) => e.above).map((e) => (
            <div
              key={e.id}
              style={{
                position: 'absolute',
                left: `${e.pct}%`,
                top: 4,
                transform: 'translateX(-50%)',
              }}
              className="flex flex-col items-center"
            >
              <p className="text-xs font-semibold text-text-primary whitespace-nowrap leading-tight">
                {e.name}
              </p>
              <p
                className="text-xs font-mono whitespace-nowrap leading-tight"
                style={{ color: e.accentColor }}
              >
                ${e.monthlyCost}
              </p>
              <p className="text-xs text-text-muted whitespace-nowrap leading-tight mt-0.5">
                {fmtDate(e.nextBillingDate)}
              </p>
              {/* connector */}
              <div
                style={{
                  width: 1,
                  height: 14,
                  backgroundColor: e.accentColor,
                  opacity: 0.45,
                  marginTop: 4,
                }}
              />
            </div>
          ))}

          {/* Track */}
          <div
            style={{ position: 'absolute', left: 0, right: 0, top: TRACK_TOP, height: 2 }}
            className="bg-border rounded-full"
          >
            {/* Today marker */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: -10,
                width: 2,
                height: 22,
                borderRadius: 2,
              }}
              className="bg-teal"
            />

            {/* Event dots */}
            {events.map((e) => (
              <div
                key={e.id}
                style={{
                  position: 'absolute',
                  left: `${e.pct}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: e.accentColor,
                  }}
                  className="ring-2 ring-bg-card"
                />
              </div>
            ))}
          </div>

          {/* Labels BELOW track */}
          {events.filter((e) => !e.above).map((e) => (
            <div
              key={e.id}
              style={{
                position: 'absolute',
                left: `${e.pct}%`,
                top: TRACK_TOP + 14,
                transform: 'translateX(-50%)',
              }}
              className="flex flex-col items-center"
            >
              {/* connector */}
              <div
                style={{
                  width: 1,
                  height: 12,
                  backgroundColor: e.accentColor,
                  opacity: 0.45,
                  marginBottom: 4,
                }}
              />
              <p className="text-xs font-semibold text-text-primary whitespace-nowrap leading-tight">
                {e.name}
              </p>
              <p
                className="text-xs font-mono whitespace-nowrap leading-tight"
                style={{ color: e.accentColor }}
              >
                ${e.monthlyCost}
              </p>
              <p className="text-xs text-text-muted whitespace-nowrap leading-tight mt-0.5">
                {fmtDate(e.nextBillingDate)}
              </p>
            </div>
          ))}

          {/* Window labels */}
          <div style={{ position: 'absolute', left: 0, bottom: 0 }}>
            <p className="text-xs text-text-muted flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal inline-block" aria-hidden="true" />
              Today · Apr 23
            </p>
          </div>
          <div style={{ position: 'absolute', right: 0, bottom: 0 }}>
            <p className="text-xs text-text-muted">May 23</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard page ───────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();

  const { totalMonthly, totalMonthlyHours, activeCount, upcomingCount, trialService } =
    useMemo(() => {
      const now = Date.now();
      const in14 = now + 14 * 86_400_000;
      return {
        totalMonthly: services
          .filter((s) => s.status !== 'inactive')
          .reduce((sum, s) => sum + s.monthlyCost, 0),
        totalMonthlyHours: +(
          services.reduce((sum, s) => sum + s.weeklyUsageHours, 0) * 4.33
        ).toFixed(0),
        activeCount: services.filter(
          (s) => s.status === 'active' || s.status === 'trial',
        ).length,
        upcomingCount: services.filter((s) => {
          const t = new Date(s.nextBillingDate + 'T00:00:00').getTime();
          return t >= now && t <= in14;
        }).length,
        trialService: services.find((s) => s.status === 'trial'),
      };
    }, []);

  const usageBarData = useMemo(
    () => services.map((s) => ({ name: s.name, hours: s.weeklyUsageHours, color: s.accentColor })),
    [],
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl">
      {/* Heading */}
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
            <span className="text-amber font-semibold">Podimo trial</span> expires on Apr 30 —
            you'll be charged{' '}
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
          label="Hours This Month"
          value={`${totalMonthlyHours}h`}
          sub="Est. from weekly avg"
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
          icon={Calendar}
          label="Upcoming Renewals"
          value={String(upcomingCount)}
          sub="Bills due in 14 days"
          iconClass="text-amber"
          iconBg="bg-amber-dim"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Monthly Spend" sub="Last 6 months" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlySpendData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#252d42" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#8892a4', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#8892a4', fontSize: 11, fontFamily: 'DM Mono, monospace' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                content={<ChartTooltip prefix="$" />}
                cursor={{ stroke: '#252d42', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#00d4aa"
                strokeWidth={2}
                fill="url(#spendGrad)"
                dot={{ fill: '#00d4aa', r: 3, strokeWidth: 0 }}
                activeDot={{ fill: '#00d4aa', r: 5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Weekly Usage" sub="Hours per platform">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={usageBarData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252d42" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#8892a4', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#8892a4', fontSize: 11, fontFamily: 'DM Mono, monospace' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}h`}
              />
              <Tooltip
                content={<ChartTooltip suffix="h" />}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {usageBarData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Connected Services grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Connected Services</h2>
          <button
            onClick={() => navigate('/subscriptions')}
            className="text-xs font-medium text-teal hover:text-teal-hover transition-colors"
          >
            Manage all →
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service) => (
            <ServiceGridCard
              key={service.id}
              service={service}
              onClick={() => navigate('/subscriptions')}
            />
          ))}
        </div>
      </div>

      {/* Renewal Timeline */}
      <RenewalTimeline />
    </div>
  );
}
