import { useState, useMemo, useEffect } from 'react';
import {
  Calendar, Clock, ExternalLink, AlertTriangle,
  ChevronDown, ChevronUp, X, Check, Plus,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { services } from '../data/services';
import type { Service } from '../types';
import ServiceLogo from '../components/ui/ServiceLogo';
import StatusBadge from '../components/ui/StatusBadge';

/* ── Expected weekly hours per service (for usage bar) ── */
const EXPECTED_HOURS: Record<string, number> = {
  audible:  8,
  storytel: 6,
  podimo:   5,
  spotify: 16,
};

/* ── Platforms available to connect ──────────────────── */
const CONNECTABLE = [
  { id: 'scribd',      name: 'Scribd',         logoChar: 'S', tagline: 'Unlimited books, audiobooks & docs',    monthlyCost: 11.99 },
  { id: 'blinkist',    name: 'Blinkist',        logoChar: 'B', tagline: 'Key ideas from nonfiction books',       monthlyCost: 15.99 },
  { id: 'luminary',    name: 'Luminary',        logoChar: 'L', tagline: 'Premium podcast originals',             monthlyCost:  7.99 },
  { id: 'librofm',     name: 'Libro.fm',        logoChar: 'L', tagline: 'Audiobooks + local bookstore support',  monthlyCost: 14.99 },
  { id: 'apple',       name: 'Apple Podcasts',  logoChar: 'A', tagline: 'Free podcasts & premium channels',      monthlyCost:  6.99 },
  { id: 'deezer',      name: 'Deezer',          logoChar: 'D', tagline: 'Music, podcasts & live radio',          monthlyCost: 10.99 },
  { id: 'pocketcasts', name: 'Pocket Casts',    logoChar: 'P', tagline: 'Cross-platform podcast manager',        monthlyCost:  3.99 },
  { id: 'bookbeat',    name: 'BookBeat',         logoChar: 'B', tagline: 'Scandinavian audiobook library',        monthlyCost: 12.99 },
];

/* ── Connect New Service modal ────────────────────────── */
function ConnectModal({ onClose }: { onClose: () => void }) {
  const [connected, setConnected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggle = (id: string) =>
    setConnected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-title"
    >
      <div className="card w-full max-w-2xl max-h-[82vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 id="connect-title" className="text-base font-semibold text-text-primary">
              Connect a Service
            </h2>
            <p className="text-xs mt-0.5 text-text-secondary">
              Link your subscriptions to track them in MONO
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover"
            aria-label="Close"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>

        {/* Platform grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CONNECTABLE.map((p) => {
              const done = connected.has(p.id);
              return (
                <div
                  key={p.id}
                  className={`card p-4 flex items-center gap-3 transition-colors ${
                    done ? 'border-green/30 bg-green/5' : 'hover:bg-bg-hover'
                  }`}
                >
                  <ServiceLogo id={p.id} name={p.name} logoChar={p.logoChar} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                    <p className="text-xs text-text-secondary truncate">{p.tagline}</p>
                    <p className="text-xs font-mono text-text-muted mt-0.5">${p.monthlyCost}/mo</p>
                  </div>
                  {done ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-dim text-green flex-shrink-0">
                      <Check size={10} aria-hidden="true" />
                      Connected
                    </span>
                  ) : (
                    <button
                      onClick={() => toggle(p.id)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-teal-dim text-teal hover:bg-teal-dim-hover flex-shrink-0 whitespace-nowrap"
                    >
                      Connect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer — shown once something is connected */}
        {connected.size > 0 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between flex-shrink-0 bg-bg-secondary">
            <p className="text-xs text-text-secondary">
              <span className="font-semibold text-text-primary">{connected.size}</span>{' '}
              service{connected.size > 1 ? 's' : ''} connected
            </p>
            <button
              onClick={onClose}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-teal text-bg-primary hover:bg-teal-hover"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────── */
function UsageTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-xs shadow-xl" role="tooltip">
      <p className="text-text-secondary">{label}</p>
      <p className="font-mono font-medium text-text-primary">{payload[0].value}h</p>
    </div>
  );
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr + 'T00:00:00').getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

/* ── Service card ─────────────────────────────────────── */
function ServiceCard({ service }: { service: Service }) {
  const [expanded, setExpanded] = useState(false);
  const isTrial = service.status === 'trial';
  const days = useMemo(() => daysUntil(service.nextBillingDate), [service.nextBillingDate]);

  const expected = EXPECTED_HOURS[service.id] ?? 10;
  const usagePct = Math.min(100, Math.round((service.weeklyUsageHours / expected) * 100));

  const costPerHr = useMemo(() => {
    if (service.weeklyUsageHours <= 0) return null;
    return (service.monthlyCost / (service.weeklyUsageHours * 4.33)).toFixed(2);
  }, [service.monthlyCost, service.weeklyUsageHours]);

  /* usage bar colour: red if < 30%, amber if 30–59%, service colour otherwise */
  const barColor =
    usagePct < 30 ? '#ef4444' : usagePct < 60 ? '#f59e0b' : service.accentColor;

  return (
    <article
      className={`card overflow-hidden ${isTrial ? 'border-amber/30' : ''}`}
      aria-label={`${service.name} subscription`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <ServiceLogo id={service.id} name={service.name} logoChar={service.logoChar} size="lg" />

          <div className="flex-1 min-w-0">
            {/* Name + badge */}
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="text-base font-semibold text-text-primary">{service.name}</h3>
                <p className="text-xs mt-0.5 text-text-secondary">{service.tagline}</p>
              </div>
              <StatusBadge status={service.status} />
            </div>

            {/* Stats */}
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
                {
                  label: 'Weekly usage',
                  value: `${service.weeklyUsageHours}h`,
                  mono: true,
                  icon: Clock,
                },
              ].map(({ label, value, mono, badge, icon: Icon }) => (
                <div key={label}>
                  <dt className="text-xs text-text-secondary">{label}</dt>
                  <dd
                    className={`text-sm font-medium mt-0.5 flex items-center gap-1 text-text-primary ${
                      mono ? 'font-mono' : ''
                    }`}
                  >
                    {Icon && (
                      <Icon size={11} aria-hidden="true" className="text-text-muted" />
                    )}
                    {value}
                    {badge && (
                      <span className={`text-xs font-sans ${badge.cls}`}>({badge.text})</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Usage bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-text-secondary">Usage vs expected</span>
                <span className="text-xs font-mono text-text-primary">
                  {service.weeklyUsageHours}h&thinsp;/&thinsp;{expected}h
                  <span className="text-text-muted ml-1">({usagePct}%)</span>
                </span>
              </div>
              <div
                className="h-1.5 rounded-full bg-border"
                role="progressbar"
                aria-valuenow={usagePct}
                aria-valuemax={100}
                aria-label={`${usagePct}% of expected weekly usage`}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${usagePct}%`, backgroundColor: barColor }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trial warning */}
        {isTrial && (
          <div
            className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-amber-dim border border-amber/20"
            role="alert"
          >
            <AlertTriangle size={13} className="text-amber flex-shrink-0" aria-hidden="true" />
            <p className="text-amber">
              Trial expires soon — you'll be charged ${service.monthlyCost}/mo if you don't cancel.
            </p>
          </div>
        )}

        {/* Action bar */}
        <div className="mt-4 pt-4 flex items-center justify-between border-t border-border">
          <div className="flex gap-2">
            <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-teal-dim text-teal hover:bg-teal-dim-hover">
              Manage
            </button>
            {isTrial ? (
              <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-danger-dim text-danger hover:bg-danger/20">
                Cancel Trial
              </button>
            ) : (
              <button className="text-xs font-medium px-3 py-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-dim transition-colors">
                Disconnect
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
              {expanded ? (
                <ChevronUp size={13} aria-hidden="true" />
              ) : (
                <ChevronDown size={13} aria-hidden="true" />
              )}
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
                <dd
                  className={`text-lg font-semibold font-mono mt-1 ${
                    accent ? 'text-teal' : 'text-text-primary'
                  }`}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="text-xs text-text-secondary mb-2">This week — hours per day</p>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart
              data={service.weeklyUsage}
              margin={{ top: 4, right: 4, left: -30, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#252d42" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#8892a4', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#8892a4', fontSize: 10, fontFamily: 'DM Mono, monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<UsageTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar
                dataKey="hours"
                fill={service.accentColor}
                fillOpacity={0.8}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}
    </article>
  );
}

/* ── Page ─────────────────────────────────────────────── */
export default function Subscriptions() {
  const [modalOpen, setModalOpen] = useState(false);

  const totalMonthly = useMemo(
    () =>
      services
        .filter((s) => s.status !== 'inactive')
        .reduce((sum, s) => sum + s.monthlyCost, 0),
    [],
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">My Subscriptions</h1>
          <p className="text-sm mt-0.5 text-text-secondary">
            {services.length} connected services ·{' '}
            <span className="font-mono">${totalMonthly.toFixed(2)}/mo</span>
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="text-sm font-medium px-4 py-2 rounded-lg bg-teal text-bg-primary hover:bg-teal-hover flex-shrink-0 flex items-center gap-1.5"
        >
          <Plus size={15} aria-hidden="true" />
          Connect New Service
        </button>
      </div>

      {/* Service cards */}
      <div className="space-y-4">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {/* Modal */}
      {modalOpen && <ConnectModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
