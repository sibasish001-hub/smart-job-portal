import React from 'react';

type BadgeVariant = 'primary' | 'cyan' | 'green' | 'red' | 'yellow' | 'gray' | 'orange';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantMap: Record<BadgeVariant, string> = {
  primary: 'badge-primary',
  cyan: 'badge-cyan',
  green: 'badge-green',
  red: 'badge-red',
  yellow: 'badge-yellow',
  gray: 'badge-gray',
  orange: 'bg-orange-500/20 text-orange-300 border border-orange-500/30 badge',
};

const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray', className = '', dot = false }) => {
  return (
    <span className={`${variantMap[variant]} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
};

// Utility to map status strings to badge variants
export const statusVariant = (status: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    APPLIED: 'cyan',
    SCREENING: 'yellow',
    INTERVIEWING: 'primary',
    OFFERED: 'green',
    REJECTED: 'red',
    SCHEDULED: 'primary',
    COMPLETED: 'green',
    CANCELLED: 'red',
    ACTIVE: 'green',
    INACTIVE: 'gray',
    REMOTE: 'cyan',
    HYBRID: 'yellow',
    ONSITE: 'gray',
    FULL_TIME: 'primary',
    PART_TIME: 'orange',
    CONTRACT: 'yellow',
    INTERNSHIP: 'cyan',
  };
  return map[status?.toUpperCase()] || 'gray';
};

export default Badge;
