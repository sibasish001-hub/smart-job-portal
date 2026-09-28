import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AtsScoreGaugeProps {
  score: number;
  size?: number;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return { primary: '#22c55e', bg: 'rgba(34,197,94,0.15)', label: 'Excellent', textColor: 'text-green-400' };
  if (score >= 60) return { primary: '#6366f1', bg: 'rgba(99,102,241,0.15)', label: 'Good', textColor: 'text-primary-400' };
  if (score >= 40) return { primary: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Fair', textColor: 'text-yellow-400' };
  return { primary: '#ef4444', bg: 'rgba(239,68,68,0.15)', label: 'Needs Work', textColor: 'text-red-400' };
};

const AtsScoreGauge: React.FC<AtsScoreGaugeProps> = ({ score, size = 180 }) => {
  const { primary, bg, label, textColor } = getScoreColor(score);

  const data = {
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: [primary, 'rgba(255,255,255,0.05)'],
        borderColor: ['transparent', 'transparent'],
        borderWidth: 0,
        circumference: 270,
        rotation: 225,
      },
    ],
  };

  const options = {
    cutout: '75%',
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    responsive: true,
    maintainAspectRatio: true,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative" style={{ width: size, height: size }}>
        <Doughnut data={data} options={options as any} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${textColor}`}>{score}</span>
          <span className="text-xs text-white/50 font-medium">ATS Score</span>
        </div>
      </div>
      <div className={`px-4 py-1.5 rounded-full text-sm font-semibold ${textColor}`}
        style={{ background: bg }}>
        {label}
      </div>
      <p className="text-xs text-white/40 text-center max-w-[160px]">
        {score >= 80
          ? 'Your resume is highly optimized for ATS systems.'
          : score >= 60
          ? 'Good resume. Minor improvements can boost your score.'
          : score >= 40
          ? 'Resume needs some work to pass ATS filters.'
          : 'Resume needs significant improvements.'}
      </p>
    </motion.div>
  );
};

export default AtsScoreGauge;
