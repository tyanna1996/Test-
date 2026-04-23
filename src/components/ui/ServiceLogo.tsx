interface ServiceLogoProps {
  name: string;
  logoChar: string;
  accentColor: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { outer: 'w-9 h-9', text: 'text-sm' },
  md: { outer: 'w-11 h-11', text: 'text-base' },
  lg: { outer: 'w-14 h-14', text: 'text-lg' },
};

export default function ServiceLogo({ name, logoChar, accentColor, size = 'md' }: ServiceLogoProps) {
  const s = sizes[size];
  return (
    <div
      className={`${s.outer} rounded-xl flex items-center justify-center font-bold ${s.text} flex-shrink-0`}
      style={{ backgroundColor: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}33` }}
      title={name}
    >
      {logoChar}
    </div>
  );
}
