import type { ServiceStatus } from '../../types';

const config: Record<ServiceStatus, { label: string; classes: string; dot: string }> = {
  active:   { label: 'Active',   classes: 'bg-green-dim  text-green',   dot: 'bg-green'   },
  trial:    { label: 'Trial',    classes: 'bg-amber-dim  text-amber',   dot: 'bg-amber'   },
  inactive: { label: 'Inactive', classes: 'bg-border/60  text-text-muted', dot: 'bg-text-muted' },
  paused:   { label: 'Paused',   classes: 'bg-purple-dim text-purple',  dot: 'bg-purple'  },
};

export default function StatusBadge({ status }: { status: ServiceStatus }) {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.classes}`}
      role="status"
      aria-label={`Status: ${c.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} aria-hidden="true" />
      {c.label}
    </span>
  );
}
