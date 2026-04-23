/* Maps service IDs to CSS variable-based color pairs so we can use Tailwind. */
const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  audible:  { bg: 'bg-amber-dim',  text: 'text-amber',   ring: 'ring-amber/20'   },
  storytel: { bg: 'bg-purple-dim', text: 'text-purple',  ring: 'ring-purple/20'  },
  podimo:   { bg: 'bg-danger-dim', text: 'text-danger',  ring: 'ring-danger/20'  },
  spotify:  { bg: 'bg-green-dim',  text: 'text-green',   ring: 'ring-green/20'   },
  scribd:   { bg: 'bg-blue-dim',   text: 'text-blue',    ring: 'ring-blue/20'    },
  blinkist: { bg: 'bg-cyan/10',    text: 'text-cyan',    ring: 'ring-cyan/20'    },
  luminary: { bg: 'bg-purple-dim', text: 'text-purple',  ring: 'ring-purple/20'  },
  findaway: { bg: 'bg-orange/10',  text: 'text-orange',  ring: 'ring-orange/20'  },
};

const fallback = { bg: 'bg-teal-dim', text: 'text-teal', ring: 'ring-teal/20' };

const sizes = {
  sm: 'w-9 h-9 rounded-lg text-sm',
  md: 'w-11 h-11 rounded-xl text-base',
  lg: 'w-14 h-14 rounded-xl text-lg',
};

interface ServiceLogoProps {
  id: string;
  name: string;
  logoChar: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ServiceLogo({ id, name, logoChar, size = 'md' }: ServiceLogoProps) {
  const c = colorMap[id] ?? fallback;
  return (
    <div
      className={`${sizes[size]} ${c.bg} ${c.text} flex items-center justify-center font-bold flex-shrink-0 ring-1 ${c.ring}`}
      aria-label={name}
      role="img"
    >
      <span aria-hidden="true">{logoChar}</span>
    </div>
  );
}
