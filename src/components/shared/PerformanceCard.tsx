'use client';

interface PerformanceCardProps {
  label:    string;
  value:    string | number;
  subtitle?: string;
  color?:   'blue' | 'green' | 'red' | 'yellow';
}

const COLOR_MAP = {
  blue:   'bg-blue-50 border-blue-200 text-blue-700',
  green:  'bg-green-50 border-green-200 text-green-700',
  red:    'bg-red-50 border-red-200 text-red-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
};

export const PerformanceCard = ({
  label,
  value,
  subtitle,
  color = 'blue',
}: PerformanceCardProps) => {
  return (
    <div className={`border rounded-xl p-4 flex flex-col gap-1 ${COLOR_MAP[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-xs opacity-60">{subtitle}</p>}
    </div>
  );
};