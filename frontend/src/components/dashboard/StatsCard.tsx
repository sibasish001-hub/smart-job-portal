import React from 'react';
import { motion } from 'framer-motion';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: { value: number; label: string };
  subtitle?: string;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  iconBg = 'bg-primary-500/20',
  trend,
  subtitle,
  delay = 0,
}) => {
  const isPositive = trend && trend.value >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card p-6 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/50">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-white/40 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${iconBg} text-2xl`}>{icon}</div>
      </div>

      {trend && (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? (
            <HiTrendingUp className="w-4 h-4" />
          ) : (
            <HiTrendingDown className="w-4 h-4" />
          )}
          <span>
            {isPositive ? '+' : ''}{trend.value}% {trend.label}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default StatsCard;
