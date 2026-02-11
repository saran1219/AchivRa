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
  const hoverClass = hover ? 'hover:shadow-2xl hover:scale-[1.02] cursor-pointer' : 'hover:shadow-xl';
  const selectedClass = isSelected ? 'ring-2 ring-yellow-400 shadow-md' : '';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 ${hoverClass} ${selectedClass} ${className}`}
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
        <h3 className="font-bold text-[#001a4d] text-base truncate">{title}</h3>
        {subtitle && <div className="text-xs text-gray-500 mt-1 truncate">{subtitle}</div>}
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
  color = 'blue',
  trend,
}) => {
  const colorClasses = {
    violet: 'bg-purple-50 text-purple-700 border-purple-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    amber: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
  };

  return (
    <div
      className={`${colorClasses[color]} border rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold opacity-80 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <p className="text-xs mt-2 flex items-center gap-1 font-medium">
              <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
              <span>{trend.percentage}%</span>
            </p>
          )}
        </div>
        {icon && <div className="flex-shrink-0 text-3xl opacity-80">{icon}</div>}
      </div>
    </div>
  );
};
