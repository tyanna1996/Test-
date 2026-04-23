import { useState } from 'react';
import { Calendar, Clock, ExternalLink, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { services } from '../data/services';
import type { Service } from '../types';
import ServiceLogo from '../components/ui/ServiceLogo';
import StatusBadge from '../components/ui/StatusBadge';

function UsageTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-lg px-3 py-2 text-xs"
        style={{ backgroundColor: '#0f1117', border: '1px solid #252d42', color: '#e8eaf0' }}
      >
        <p style={{ color: '#8892a4' }}>{label}</p>
        <p className="font-semibold" style={{ fontFamily: "'DM Mono', monospace" }}>
          {payload[0].value}h
        </p>
      </div>
    );
  }
  return null;
}

function ServiceCard({ service }: { service: Service }) {
  const [expanded, setExpanded] = useState(false);
  const isTrial = service.status === 'trial';

  const daysUntilBilling = Math.ceil(
    (new Date(service.nextBillingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: '#1a2035',
        border: `1px solid ${isTrial ? 'rgba(245,158,11,0.3)' : '#252d42'}`,
      }}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <ServiceLogo
            name={service.name}
            logoChar={service.logoChar}
            accentColor={service.accentColor}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold" style={{ color: '#e8eaf0' }}>
                  {service.name}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: '#8892a4' }}>
                  {service.tagline}
                </p>
              </div>
              <StatusBadge status={service.status} />
            </div>

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              <div>
                <p className="text-xs" style={{ color: '#8892a4' }}>
                  Plan
                </p>
                <p className="text-sm font-medium mt-0.5" style={{ color: '#e8eaf0' }}>
                  {service.plan}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: '#8892a4' }}>
                  Monthly cost
                </p>
                <p
                  className="text-sm font-medium mt-0.5"
                  style={{ fontFamily: "'DM Mono', monospace", color: '#e8eaf0' }}
                >
                  ${service.monthlyCost.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: '#8892a4' }}>
                  {isTrial ? 'Trial ends' : 'Next billing'}
                </p>
                <p
                  className="text-sm font-medium mt-0.5 flex items-center gap-1"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    color: isTrial ? '#f59e0b' : '#e8eaf0',
                  }}
                >
                  <Calendar size={11} />
                  {service.nextBillingDate}
                  {daysUntilBilling <= 14 && (
                    <span
                      className="ml-1 text-xs font-normal"
                      style={{ color: daysUntilBilling <= 7 ? '#ef4444' : '#f59e0b', fontFamily: 'inherit' }}
                    >
                      ({daysUntilBilling}d)
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: '#8892a4' }}>
                  Weekly usage
                </p>
                <p
                  className="text-sm font-medium mt-0.5 flex items-center gap-1"
                  style={{ fontFamily: "'DM Mono', monospace", color: '#e8eaf0' }}
                >
                  <Clock size={11} />
                  {service.weeklyUsageHours}h
                </p>
              </div>
            </div>
          </div>
        </div>

        {isTrial && (
          <div
            className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <AlertTriangle size={13} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <p style={{ color: '#f59e0b' }}>
              Trial expires soon — you'll be charged ${service.monthlyCost}/mo if you don't cancel.
            </p>
          </div>
        )}

        <div
          className="mt-4 pt-4 flex items-center justify-between"
          style={{ borderTop: '1px solid #252d42' }}
        >
          <div className="flex gap-2">
            <button
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: 'rgba(0,212,170,0.12)', color: '#00d4aa' }}
            >
              Manage Plan
            </button>
            {isTrial && (
              <button
                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
              >
                Cancel Trial
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              className="text-xs flex items-center gap-1 transition-colors"
              style={{ color: '#8892a4' }}
            >
              <ExternalLink size={12} />
              Open app
            </button>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs flex items-center gap-1 transition-colors"
              style={{ color: '#8892a4' }}
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {expanded ? 'Less' : 'Usage detail'}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div
          className="px-5 pb-5"
          style={{ borderTop: '1px solid #252d42', paddingTop: '16px' }}
        >
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div
              className="rounded-lg p-3 text-center"
              style={{ backgroundColor: '#0f1117' }}
            >
              <p className="text-xs" style={{ color: '#8892a4' }}>
                Total listened
              </p>
              <p
                className="text-lg font-semibold mt-1"
                style={{ fontFamily: "'DM Mono', monospace", color: '#e8eaf0' }}
              >
                {service.totalListened}h
              </p>
            </div>
            <div
              className="rounded-lg p-3 text-center"
              style={{ backgroundColor: '#0f1117' }}
            >
              <p className="text-xs" style={{ color: '#8892a4' }}>
                Titles accessed
              </p>
              <p
                className="text-lg font-semibold mt-1"
                style={{ fontFamily: "'DM Mono', monospace", color: '#e8eaf0' }}
              >
                {service.titlesAccessed}
              </p>
            </div>
            <div
              className="rounded-lg p-3 text-center"
              style={{ backgroundColor: '#0f1117' }}
            >
              <p className="text-xs" style={{ color: '#8892a4' }}>
                Cost per hour
              </p>
              <p
                className="text-lg font-semibold mt-1"
                style={{ fontFamily: "'DM Mono', monospace", color: service.accentColor }}
              >
                ${service.weeklyUsageHours > 0
                  ? ((service.monthlyCost / (service.weeklyUsageHours * 4.33))).toFixed(2)
                  : '—'}
              </p>
            </div>
          </div>
          <p className="text-xs mb-2" style={{ color: '#8892a4' }}>
            This week — hours per day
          </p>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={service.weeklyUsage} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252d42" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#8892a4', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#8892a4', fontSize: 10, fontFamily: "'DM Mono', monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<UsageTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar
                dataKey="hours"
                fill={service.accentColor}
                fillOpacity={0.75}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function Subscriptions() {
  const totalMonthly = services
    .filter((s) => s.status !== 'inactive')
    .reduce((sum, s) => sum + s.monthlyCost, 0);

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: '#e8eaf0' }}>
            My Subscriptions
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#8892a4' }}>
            {services.length} connected services ·{' '}
            <span style={{ fontFamily: "'DM Mono', monospace" }}>
              ${totalMonthly.toFixed(2)}/mo
            </span>
          </p>
        </div>
        <button
          className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: '#00d4aa', color: '#0f1117' }}
        >
          + Add service
        </button>
      </div>

      <div className="space-y-4">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
