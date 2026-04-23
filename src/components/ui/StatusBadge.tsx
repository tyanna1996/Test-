import type { ServiceStatus } from '../../types';

const config: Record<ServiceStatus, { label: string; bg: string; color: string; dot: string }> = {
  active: { label: 'Active', bg: 'rgba(34,197,94,0.12)', color: '#22c55e', dot: '#22c55e' },
  trial: { label: 'Trial', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', dot: '#f59e0b' },
  inactive: { label: 'Inactive', bg: 'rgba(100,116,139,0.15)', color: '#64748b', dot: '#64748b' },
  paused: { label: 'Paused', bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6', dot: '#8b5cf6' },
};

export default function StatusBadge({ status }: { status: ServiceStatus }) {
  const c = config[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
      {c.label}
    </span>
  );
}
