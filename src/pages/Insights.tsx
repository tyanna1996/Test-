import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { services } from '../data/services';
import ServiceLogo from '../components/ui/ServiceLogo';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const combinedDailyData = DAYS.map((day, i) => {
  const entry: Record<string, number | string> = { day };
  services.forEach((s) => {
    entry[s.id] = s.weeklyUsage[i]?.hours ?? 0;
  });
  return entry;
});

const categoryData = [
  { name: 'Audiobooks', value: 10.7, color: '#f59e0b' },
  { name: 'Music', value: 12.4, color: '#22c55e' },
  { name: 'Podcasts', value: 1.8, color: '#ef4444' },
];

const monthlyListeningTrend = [
  { month: 'Nov', hours: 68 },
  { month: 'Dec', hours: 82 },
  { month: 'Jan', hours: 74 },
  { month: 'Feb', hours: 91 },
  { month: 'Mar', hours: 87 },
  { month: 'Apr', hours: 103 },
];

const valueScore = services.map((s) => ({
  name: s.name,
  score: parseFloat((s.weeklyUsageHours / s.monthlyCost * 10).toFixed(1)),
  color: s.accentColor,
}));

function ChartCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: '#1a2035', border: '1px solid #252d42' }}
    >
      <div className="mb-5">
        <h2 className="text-sm font-semibold" style={{ color: '#e8eaf0' }}>
          {title}
        </h2>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: '#8892a4' }}>
            {sub}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

const GenericTooltip = ({ active, payload, label, unit = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-lg px-3 py-2 text-xs space-y-1"
        style={{ backgroundColor: '#0f1117', border: '1px solid #252d42', color: '#e8eaf0' }}
      >
        <p style={{ color: '#8892a4' }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="font-semibold" style={{ color: p.color, fontFamily: "'DM Mono', monospace" }}>
            {p.name ? `${p.name}: ` : ''}{p.value}{unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Insights() {
  const totalHours = services.reduce((sum, s) => sum + s.weeklyUsageHours, 0);
  const topService = [...services].sort((a, b) => b.weeklyUsageHours - a.weeklyUsageHours)[0];
  const bestValue = [...valueScore].sort((a, b) => b.score - a.score)[0];

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: '#e8eaf0' }}>
          Usage & Insights
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#8892a4' }}>
          Understand your listening habits and subscription value.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total this week', value: `${totalHours.toFixed(1)}h`, sub: 'across all platforms' },
          { label: 'Most used', value: topService.name, sub: `${topService.weeklyUsageHours}h this week`, color: topService.accentColor },
          { label: 'Best value', value: bestValue.name, sub: `${bestValue.score} hrs/$`, color: bestValue.color },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4"
            style={{ backgroundColor: '#1a2035', border: '1px solid #252d42' }}
          >
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8892a4' }}>
              {stat.label}
            </p>
            <p
              className="text-xl font-semibold mt-2"
              style={{ color: stat.color ?? '#e8eaf0', fontFamily: "'DM Mono', monospace" }}
            >
              {stat.value}
            </p>
            <p className="text-xs mt-1" style={{ color: '#8892a4' }}>
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Daily Listening Breakdown" sub="This week — hours per platform">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={combinedDailyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252d42" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#8892a4', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8892a4', fontSize: 10, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
              <Tooltip content={<GenericTooltip unit="h" />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              {services.map((s) => (
                <Bar key={s.id} dataKey={s.id} name={s.name} stackId="a" fill={s.accentColor} fillOpacity={0.8} />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-3">
            {services.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.accentColor }} />
                <span className="text-xs" style={{ color: '#8892a4' }}>{s.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Listening by Category" sub="Weekly hour split">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [`${v}h`, '']}
                contentStyle={{ backgroundColor: '#0f1117', border: '1px solid #252d42', borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: '#e8eaf0' }}
                labelStyle={{ color: '#8892a4' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-1">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs" style={{ color: '#8892a4' }}>{cat.name}</span>
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ fontFamily: "'DM Mono', monospace", color: '#e8eaf0' }}
                >
                  {cat.value}h
                </span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Value Score" sub="Weekly hours per dollar spent">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={valueScore}
              layout="vertical"
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#252d42" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#8892a4', fontSize: 10, fontFamily: "'DM Mono', monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#8892a4', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip content={<GenericTooltip unit=" hrs/$" />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {valueScore.map((entry, index) => (
                  <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Monthly Listening Trend" sub="Total hours across all platforms">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={monthlyListeningTrend} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#252d42" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#8892a4', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: '#8892a4', fontSize: 11, fontFamily: "'DM Mono', monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}h`}
            />
            <Tooltip content={<GenericTooltip unit="h" />} cursor={{ stroke: '#252d42', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="hours"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#trendGrad)"
              dot={{ fill: '#8b5cf6', r: 3, strokeWidth: 0 }}
              activeDot={{ fill: '#8b5cf6', r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div
        className="rounded-xl"
        style={{ backgroundColor: '#1a2035', border: '1px solid #252d42' }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: '1px solid #252d42' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: '#e8eaf0' }}>
            Platform Comparison
          </h2>
          <p className="text-xs mt-0.5" style={{ color: '#8892a4' }}>
            Side-by-side stats across your subscriptions
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #252d42' }}>
                {['Service', 'Monthly cost', 'Weekly usage', 'Titles', 'Cost/hr', 'Value'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: '#8892a4' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => {
                const costPerHr = s.weeklyUsageHours > 0
                  ? (s.monthlyCost / (s.weeklyUsageHours * 4.33)).toFixed(2)
                  : '—';
                const vs = valueScore.find((v) => v.name === s.name)!;
                const maxScore = Math.max(...valueScore.map((v) => v.score));
                return (
                  <tr
                    key={s.id}
                    style={{ borderBottom: i < services.length - 1 ? '1px solid #252d42' : undefined }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <ServiceLogo name={s.name} logoChar={s.logoChar} accentColor={s.accentColor} size="sm" />
                        <span style={{ color: '#e8eaf0' }}>{s.name}</span>
                      </div>
                    </td>
                    <td
                      className="px-5 py-3"
                      style={{ fontFamily: "'DM Mono', monospace", color: '#e8eaf0' }}
                    >
                      ${s.monthlyCost.toFixed(2)}
                    </td>
                    <td
                      className="px-5 py-3"
                      style={{ fontFamily: "'DM Mono', monospace", color: '#e8eaf0' }}
                    >
                      {s.weeklyUsageHours}h
                    </td>
                    <td
                      className="px-5 py-3"
                      style={{ fontFamily: "'DM Mono', monospace", color: '#e8eaf0' }}
                    >
                      {s.titlesAccessed}
                    </td>
                    <td
                      className="px-5 py-3"
                      style={{ fontFamily: "'DM Mono', monospace", color: '#e8eaf0' }}
                    >
                      ${costPerHr}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: '#252d42', maxWidth: 80 }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(vs.score / maxScore) * 100}%`,
                              backgroundColor: s.accentColor,
                            }}
                          />
                        </div>
                        <span
                          className="text-xs"
                          style={{ fontFamily: "'DM Mono', monospace", color: s.accentColor }}
                        >
                          {vs.score}
                        </span>
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
