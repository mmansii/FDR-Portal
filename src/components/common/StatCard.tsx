import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme?: 'navy' | 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
  trendText?: string;
  badge?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'navy',
  trendText,
  badge,
  onClick,
}) => {
  const colorStyles = {
    navy: {
      bg: 'bg-white',
      border: 'border-slate-200 hover:border-slate-300',
      iconBg: 'bg-slate-100 text-slate-800',
      valueColor: 'text-slate-900',
    },
    blue: {
      bg: 'bg-white',
      border: 'border-blue-100 hover:border-blue-300',
      iconBg: 'bg-blue-50 text-blue-700',
      valueColor: 'text-blue-950',
    },
    emerald: {
      bg: 'bg-white',
      border: 'border-emerald-100 hover:border-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-700',
      valueColor: 'text-emerald-950',
    },
    amber: {
      bg: 'bg-white',
      border: 'border-amber-100 hover:border-amber-300',
      iconBg: 'bg-amber-50 text-amber-700',
      valueColor: 'text-amber-950',
    },
    rose: {
      bg: 'bg-white',
      border: 'border-rose-100 hover:border-rose-300',
      iconBg: 'bg-rose-50 text-rose-700',
      valueColor: 'text-rose-950',
    },
    purple: {
      bg: 'bg-white',
      border: 'border-purple-100 hover:border-purple-300',
      iconBg: 'bg-purple-50 text-purple-700',
      valueColor: 'text-purple-950',
    },
  }[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-4 shadow-xs transition-all duration-150 ${colorStyles.bg} ${colorStyles.border} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight ${colorStyles.valueColor}`}>{value}</span>
            {badge && (
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                {badge}
              </span>
            )}
          </div>
        </div>
        <div className={`rounded-lg p-2.5 ${colorStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {(subtitle || trendText) && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
          <span>{subtitle}</span>
          {trendText && <span className="font-medium text-slate-700">{trendText}</span>}
        </div>
      )}
    </div>
  );
};
