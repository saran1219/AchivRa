import React from 'react';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className = '',
  hover = true,
  onClick,
  isSelected = false,
}) => {
  const hoverClass = hover ? 'hover:shadow-lg hover:scale-105 cursor-pointer' : '';
  const selectedClass = isSelected ? 'ring-2 ring-[#5F4A8B] shadow-md' : '';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm transition-all duration-300 ${hoverClass} ${selectedClass} ${className}`}
    >
      {children}
    </div>
  );
};

interface HorizontalCardProps extends ModernCardProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  rightContent?: React.ReactNode;
  actions?: React.ReactNode;
}

export const HorizontalCard: React.FC<HorizontalCardProps> = ({
  icon,
  title,
  subtitle,
  rightContent,
  actions,
  children,
  className = '',
  ...props
}) => {
  return (
    <ModernCard className={`p-4 flex items-center gap-4 ${className}`} {...props}>
      {icon && <div className="flex-shrink-0 text-3xl">{icon}</div>}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-[#5F4A8B] text-sm truncate">{title}</h3>
        {subtitle && <p className="text-xs text-gray-600 mt-1 truncate">{subtitle}</p>}
        {children}
      </div>
      {rightContent && <div className="flex-shrink-0">{rightContent}</div>}
      {actions && <div className="flex-shrink-0 flex gap-2">{actions}</div>}
    </ModernCard>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'violet' | 'green' | 'amber' | 'red' | 'blue';
  trend?: { direction: 'up' | 'down'; percentage: number };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = 'violet',
  trend,
}) => {
  const colorClasses = {
    violet: 'bg-[#5F4A8B]/10 text-[#5F4A8B]',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4 transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium opacity-75">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <p className="text-xs mt-2 flex items-center gap-1">
              <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
              <span>{trend.percentage}%</span>
            </p>
          )}
        </div>
        {icon && <div className="flex-shrink-0 text-2xl">{icon}</div>}
      </div>
    </div>
  );
};
