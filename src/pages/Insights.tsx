import { useMemo } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar, Cell,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
  PieChart, Pie,
} from 'recharts';
import { services } from '../data/services';
import ServiceLogo from '../components/ui/ServiceLogo';

/* ── Constants (computed once, outside render) ─────────── */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const combinedDailyData = DAYS.map((day, i) => {
  const entry: Record<string, number | string> = { day };
  services.forEach((s) => { entry[s.id] = s.weeklyUsage[i]?.hours ?? 0; });
  return entry;
});

/* Category hours derived from real service data */
const categoryHours = services.reduce<Record<string, number>>((acc, s) => {
  const key = s.category === 'audiobooks' ? 'Audiobooks'
    : s.category === 'podcasts' ? 'Podcasts'
    : s.category === 'music' ? 'Music'
    : 'Mixed';  // spotify 'mixed' goes here
  acc[key] = (acc[key] ?? 0) + s.weeklyUsageHours;
  return acc;
}, {});

const categoryData = [
  { name: 'Audiobooks', value: +(categoryHours['Audiobooks'] ?? 0).toFixed(1), color: '#f59e0b' },
  { name: 'Podcasts',   value: +(categoryHours['Podcasts'] ?? 0).toFixed(1),   color: '#ef4444' },
  { name: 'Mixed',      value: +(categoryHours['Mixed'] ?? 0).toFixed(1),      color: '#22c55e' },
  { name: 'Music',      value: +(categoryHours['Music'] ?? 0).toFixed(1),      color: '#8b5cf6' },
].filter((d) => d.value > 0);

const monthlyListeningTrend = [
  { month: 'Nov', hours: 68 },
  { month: 'Dec', hours: 82 },
  { month: 'Jan', hours: 74 },
  { month: 'Feb', hours: 91 },
  { month: 'Mar', hours: 87 },
  { month: 'Apr', hours: 103 },
];

/* ── Tooltip ───────────────────────────────────────────── */
function ChartTooltip({ active, payload, label, unit = '' }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-xs shadow-xl" role="tooltip">
      <p className="text-text-secondary mb-0.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-mono font-medium" style={{ color: p.color ?? '#e8eaf0' }}>
          {p.name ? `${p.name}: ` : ''}{p.value}{unit}
        </p>
      ))}
    </div>
  );
}

/* ── Reusable chart wrapper ────────────────────────────── */
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

/* ── Insights page ─────────────────────────────────────── */
export default function Insights() {
  const { totalHours, topService, valueScore } = useMemo(() => {
    const total = services.reduce((sum, s) => sum + s.weeklyUsageHours, 0);
    const top = [...services].sort((a, b) => b.weeklyUsageHours - a.weeklyUsageHours)[0];
    const scores = services.map((s) => ({
      name: s.name,
      id: s.id,
      score: parseFloat((s.weeklyUsageHours / s.monthlyCost * 10).toFixed(1)),
      color: s.accentColor,
    }));
    return { totalHours: total, topService: top, valueScore: scores };
  }, []);

  const bestValue = useMemo(
    () => [...valueScore].sort((a, b) => b.score - a.score)[0],
    [valueScore],
  );

  const maxScore = useMemo(() => Math.max(...valueScore.map((v) => v.score)), [valueScore]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Usage & Insights</h1>
        <p className="text-sm mt-0.5 text-text-secondary">
          Understand your listening habits and subscription value.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total this week', value: `${totalHours.toFixed(1)}h`, sub: 'across all platforms', accent: '' },
          { label: 'Most used', value: topService.name, sub: `${topService.weeklyUsageHours}h this week`, accent: topService.accentColor },
          { label: 'Best value', value: bestValue.name, sub: `${bestValue.score} hrs/$`, accent: bestValue.color },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">{stat.label}</p>
            <p className="text-xl font-semibold font-mono mt-2 text-text-primary" style={stat.accent ? { color: stat.accent } : {}}>
              {stat.value}
            </p>
            <p className="text-xs mt-1 text-text-secondary">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stacked daily bar */}
        <ChartCard title="Daily Listening Breakdown" sub="This week — hours per platform">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={combinedDailyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252d42" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#8892a4', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8892a4', fontSize: 10, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip unit="h" />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              {services.map((s) => (
                <Bar key={s.id} dataKey={s.id} name={s.name} stackId="a" fill={s.accentColor} fillOpacity={0.85} />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
            {services.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.accentColor }} aria-hidden="true" />
                <span className="text-xs text-text-secondary">{s.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Category pie */}
        <ChartCard title="Listening by Category" sub="Weekly hour split">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [`${v}h`, '']}
                contentStyle={{ backgroundColor: '#1a2035', border: '1px solid #252d42', borderRadius: 8, fontSize: 12, color: '#e8eaf0' }}
                itemStyle={{ color: '#e8eaf0' }}
                labelStyle={{ color: '#8892a4' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <dl className="flex flex-col gap-2 mt-1">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} aria-hidden="true" />
                  <dt className="text-xs text-text-secondary">{cat.name}</dt>
                </div>
                <dd className="text-xs font-medium font-mono text-text-primary">{cat.value}h</dd>
              </div>
            ))}
          </dl>
        </ChartCard>

        {/* Value score */}
        <ChartCard title="Value Score" sub="Weekly hours per dollar spent">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={valueScore} layout="vertical" margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252d42" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#8892a4', fontSize: 10, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#8892a4', fontSize: 10 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip content={<ChartTooltip unit=" hrs/$" />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {valueScore.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Monthly listening trend */}
      <ChartCard title="Monthly Listening Trend" sub="Total hours across all platforms">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={monthlyListeningTrend} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#252d42" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#8892a4', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8892a4', fontSize: 11, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}h`} />
            <Tooltip content={<ChartTooltip unit="h" />} cursor={{ stroke: '#252d42', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} fill="url(#trendGrad)"
              dot={{ fill: '#8b5cf6', r: 3, strokeWidth: 0 }}
              activeDot={{ fill: '#8b5cf6', r: 5, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Comparison table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">Platform Comparison</h2>
          <p className="text-xs mt-0.5 text-text-secondary">Side-by-side stats across your subscriptions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Platform comparison">
            <thead>
              <tr className="border-b border-border">
                {['Service', 'Monthly cost', 'Weekly usage', 'Titles', 'Cost/hr', 'Value'].map((h) => (
                  <th key={h} scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => {
                const costPerHr = s.weeklyUsageHours > 0
                  ? `$${(s.monthlyCost / (s.weeklyUsageHours * 4.33)).toFixed(2)}`
                  : '—';
                const vs = valueScore.find((v) => v.name === s.name)!;
                return (
                  <tr key={s.id} className={i < services.length - 1 ? 'border-b border-border' : ''}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <ServiceLogo id={s.id} name={s.name} logoChar={s.logoChar} size="sm" />
                        <span className="text-text-primary">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-text-primary">${s.monthlyCost.toFixed(2)}</td>
                    <td className="px-5 py-3 font-mono text-text-primary">{s.weeklyUsageHours}h</td>
                    <td className="px-5 py-3 font-mono text-text-primary">{s.titlesAccessed}</td>
                    <td className="px-5 py-3 font-mono text-text-primary">{costPerHr}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-border" style={{ maxWidth: 80 }} role="progressbar" aria-valuenow={vs.score} aria-valuemax={maxScore} aria-label={`Value score ${vs.score}`}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(vs.score / maxScore) * 100}%`, backgroundColor: s.accentColor }}
                          />
                        </div>
                        <span className="text-xs font-mono" style={{ color: s.accentColor }}>{vs.score}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
