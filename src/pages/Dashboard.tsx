import { DollarSign, Clock, Layers, AlertTriangle } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { services, monthlySpendData } from '../data/services';
import ServiceLogo from '../components/ui/ServiceLogo';
import StatusBadge from '../components/ui/StatusBadge';
import { useNavigate } from 'react-router-dom';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3"
      style={{ backgroundColor: '#1a2035', border: '1px solid #252d42' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8892a4' }}>
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: accent ? `${accent}18` : 'rgba(0,212,170,0.12)' }}
        >
          <Icon size={15} style={{ color: accent ?? '#00d4aa' }} strokeWidth={2} />
        </div>
      </div>
      <div>
        <p
          className="text-2xl font-semibold"
          style={{ fontFamily: "'DM Mono', monospace", color: '#e8eaf0' }}
        >
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-1" style={{ color: '#8892a4' }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-lg px-3 py-2 text-xs"
        style={{ backgroundColor: '#1a2035', border: '1px solid #252d42', color: '#e8eaf0' }}
      >
        <p style={{ color: '#8892a4' }}>{label}</p>
        <p className="font-semibold mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>
          ${payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const UsageTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-lg px-3 py-2 text-xs"
        style={{ backgroundColor: '#1a2035', border: '1px solid #252d42', color: '#e8eaf0' }}
      >
        <p style={{ color: '#8892a4' }}>{label}</p>
        <p className="font-semibold mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>
          {payload[0].value}h
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const activeServices = services.filter((s) => s.status === 'active' || s.status === 'trial');
  const totalMonthly = services
    .filter((s) => s.status !== 'inactive')
    .reduce((sum, s) => sum + s.monthlyCost, 0);
  const totalHours = services.reduce((sum, s) => sum + s.weeklyUsageHours, 0);
  const trialService = services.find((s) => s.status === 'trial');

  const usageBarData = services.map((s) => ({
    name: s.name,
    hours: s.weeklyUsageHours,
    color: s.accentColor,
  }));

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: '#e8eaf0' }}>
          Good morning, Jamie
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#8892a4' }}>
          Here's your audio subscription overview for April 2026.
        </p>
      </div>

      {trialService && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{
            backgroundColor: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.25)',
          }}
        >
          <AlertTriangle size={15} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <p style={{ color: '#e8eaf0' }}>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>Podimo trial</span> expires on Apr 30
            — decide to keep or cancel before you're charged{' '}
            <span style={{ fontFamily: "'DM Mono', monospace" }}>${trialService.monthlyCost}/mo</span>.
          </p>
          <button
            onClick={() => navigate('/subscriptions')}
            className="ml-auto flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}
          >
            Review
          </button>
        </div>
      )}

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
          accent="#8b5cf6"
        />
        <StatCard
          icon={Layers}
          label="Active Services"
          value={`${activeServices.length}`}
          sub={`of ${services.length} connected`}
          accent="#3b82f6"
        />
        <StatCard
          icon={DollarSign}
          label="Annual Spend"
          value={`$${(totalMonthly * 12).toFixed(0)}`}
          sub="Projected for 2026"
          accent="#f59e0b"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div
          className="lg:col-span-3 rounded-xl p-5"
          style={{ backgroundColor: '#1a2035', border: '1px solid #252d42' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: '#e8eaf0' }}>
                Monthly Spend
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#8892a4' }}>
                Last 6 months
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlySpendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.2} />
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
                tick={{ fill: '#8892a4', fontSize: 11, fontFamily: "'DM Mono', monospace" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#252d42', strokeWidth: 1 }} />
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
        </div>

        <div
          className="lg:col-span-2 rounded-xl p-5"
          style={{ backgroundColor: '#1a2035', border: '1px solid #252d42' }}
        >
          <div className="mb-5">
            <h2 className="text-sm font-semibold" style={{ color: '#e8eaf0' }}>
              Weekly Usage
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#8892a4' }}>
              Hours per platform
            </p>
          </div>
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
                tick={{ fill: '#8892a4', fontSize: 11, fontFamily: "'DM Mono', monospace" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}h`}
              />
              <Tooltip content={<UsageTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {usageBarData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        className="rounded-xl"
        style={{ backgroundColor: '#1a2035', border: '1px solid #252d42' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #252d42' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: '#e8eaf0' }}>
            Connected Services
          </h2>
          <button
            onClick={() => navigate('/subscriptions')}
            className="text-xs font-medium transition-colors"
            style={{ color: '#00d4aa' }}
          >
            View all →
          </button>
        </div>
        <div className="divide-y" style={{ borderColor: '#252d42' }}>
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-bg-hover transition-colors"
            >
              <ServiceLogo
                name={service.name}
                logoChar={service.logoChar}
                accentColor={service.accentColor}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: '#e8eaf0' }}>
                  {service.name}
                </p>
                <p className="text-xs" style={{ color: '#8892a4' }}>
                  {service.plan}
                </p>
              </div>
              <StatusBadge status={service.status} />
              <div className="text-right">
                <p
                  className="text-sm font-medium"
                  style={{ fontFamily: "'DM Mono', monospace", color: '#e8eaf0' }}
                >
                  ${service.monthlyCost.toFixed(2)}
                </p>
                <p className="text-xs" style={{ color: '#8892a4' }}>
                  /month
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
