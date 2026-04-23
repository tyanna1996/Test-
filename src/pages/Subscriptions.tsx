import { useState, useMemo } from 'react';
import { Calendar, Clock, ExternalLink, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { services } from '../data/services';
import type { Service } from '../types';
import ServiceLogo from '../components/ui/ServiceLogo';
import StatusBadge from '../components/ui/StatusBadge';

function UsageTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-xs shadow-xl" role="tooltip">
      <p className="text-text-secondary">{label}</p>
      <p className="font-mono font-medium text-text-primary">{payload[0].value}h</p>
    </div>
  );
}

/** Returns days until a YYYY-MM-DD date string, clamped to ≥ 0 */
function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function ServiceCard({ service }: { service: Service }) {
  const [expanded, setExpanded] = useState(false);
  const isTrial = service.status === 'trial';
  const days = useMemo(() => daysUntil(service.nextBillingDate), [service.nextBillingDate]);

  const costPerHr = useMemo(() => {
    if (service.weeklyUsageHours <= 0) return null;
    return (service.monthlyCost / (service.weeklyUsageHours * 4.33)).toFixed(2);
  }, [service.monthlyCost, service.weeklyUsageHours]);

  return (
    <article
      className={`card overflow-hidden ${isTrial ? 'border-amber/30' : ''}`}
      aria-label={`${service.name} subscription`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <ServiceLogo id={service.id} name={service.name} logoChar={service.logoChar} size="lg" />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="text-base font-semibold text-text-primary">{service.name}</h3>
                <p className="text-xs mt-0.5 text-text-secondary">{service.tagline}</p>
              </div>
              <StatusBadge status={service.status} />
            </div>

            {/* Stats row */}
            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {[
                { label: 'Plan', value: service.plan, mono: false },
                { label: 'Monthly cost', value: `$${service.monthlyCost.toFixed(2)}`, mono: true },
                {
                  label: isTrial ? 'Trial ends' : 'Next billing',
                  value: service.nextBillingDate,
                  mono: true,
                  badge:
                    days <= 14
                      ? { text: `${days}d`, cls: days <= 7 ? 'text-danger' : 'text-amber' }
                      : null,
                  icon: Calendar,
                },
                { label: 'Weekly usage', value: `${service.weeklyUsageHours}h`, mono: true, icon: Clock },
              ].map(({ label, value, mono, badge, icon: Icon }) => (
                <div key={label}>
                  <dt className="text-xs text-text-secondary">{label}</dt>
                  <dd className={`text-sm font-medium mt-0.5 flex items-center gap-1 text-text-primary ${mono ? 'font-mono' : ''}`}>
                    {Icon && <Icon size={11} aria-hidden="true" className="text-text-muted" />}
                    {value}
                    {badge && (
                      <span className={`text-xs font-sans ${badge.cls}`}>({badge.text})</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Trial alert */}
        {isTrial && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-amber-dim border border-amber/20" role="alert">
            <AlertTriangle size={13} className="text-amber flex-shrink-0" aria-hidden="true" />
            <p className="text-amber">
              Trial expires soon — you'll be charged ${service.monthlyCost}/mo if you don't cancel.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pt-4 flex items-center justify-between border-t border-border">
          <div className="flex gap-2">
            <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-teal-dim text-teal hover:bg-teal-dim-hover">
              Manage Plan
            </button>
            {isTrial && (
              <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-danger-dim text-danger hover:bg-danger/20">
                Cancel Trial
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button className="text-xs flex items-center gap-1 text-text-secondary hover:text-text-primary">
              <ExternalLink size={12} aria-hidden="true" />
              Open app
            </button>
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-controls={`detail-${service.id}`}
              className="text-xs flex items-center gap-1 text-text-secondary hover:text-text-primary"
            >
              {expanded ? <ChevronUp size={13} aria-hidden="true" /> : <ChevronDown size={13} aria-hidden="true" />}
              {expanded ? 'Less' : 'Usage detail'}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <section
          id={`detail-${service.id}`}
          className="px-5 pb-5 pt-4 border-t border-border"
          aria-label={`${service.name} usage details`}
        >
          <dl className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Total listened', value: `${service.totalListened}h` },
              { label: 'Titles accessed', value: String(service.titlesAccessed) },
              { label: 'Cost per hour', value: costPerHr ? `$${costPerHr}` : '—', accent: true },
            ].map(({ label, value, accent }) => (
              <div key={label} className="bg-bg-primary rounded-lg p-3 text-center">
                <dt className="text-xs text-text-secondary">{label}</dt>
                <dd className={`text-lg font-semibold font-mono mt-1 ${accent ? 'text-teal' : 'text-text-primary'}`}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="text-xs text-text-secondary mb-2">This week — hours per day</p>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={service.weeklyUsage} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252d42" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#8892a4', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8892a4', fontSize: 10, fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
              <Tooltip content={<UsageTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="hours" fill={service.accentColor} fillOpacity={0.8} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}
    </article>
  );
}

export default function Subscriptions() {
  const totalMonthly = useMemo(
    () => services.filter((s) => s.status !== 'inactive').reduce((sum, s) => sum + s.monthlyCost, 0),
    [],
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">My Subscriptions</h1>
          <p className="text-sm mt-0.5 text-text-secondary">
            {services.length} connected services ·{' '}
            <span className="font-mono">${totalMonthly.toFixed(2)}/mo</span>
          </p>
        </div>
        <button className="text-sm font-medium px-4 py-2 rounded-lg bg-teal text-bg-primary hover:bg-teal-hover flex-shrink-0">
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
