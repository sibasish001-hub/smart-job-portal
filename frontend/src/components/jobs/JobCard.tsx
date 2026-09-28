import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HiLocationMarker, HiCurrencyDollar, HiClock,
  HiBookmark, HiOutlineBookmark, HiSparkles,
  HiLightningBolt, HiArrowRight,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import type { JobResponse } from '../../types';
import { savedJobsApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface JobCardProps {
  job: JobResponse;
  isSaved?: boolean;
  matchScore?: number;    // 0-100 AI recommendation score
  index?: number;
  compact?: boolean;       // smaller variant for dashboard lists
}

const remoteColors: Record<string, string> = {
  REMOTE: 'bg-green-500/15 text-green-400 border-green-500/25',
  HYBRID: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  ONSITE: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
};

const jobTypeColors: Record<string, string> = {
  FULL_TIME: 'bg-primary-500/15 text-primary-400 border-primary-500/25',
  PART_TIME: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  CONTRACT: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  INTERNSHIP: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
};

const scoreColor = (score: number) => {
  if (score >= 75) return { text: 'text-green-400', bar: '#22c55e', bg: 'bg-green-500/10 border-green-500/30', label: 'Excellent' };
  if (score >= 55) return { text: 'text-primary-400', bar: '#6366f1', bg: 'bg-primary-500/10 border-primary-500/30', label: 'Good' };
  if (score >= 35) return { text: 'text-amber-400', bar: '#f59e0b', bg: 'bg-amber-500/10 border-amber-500/30', label: 'Fair' };
  return { text: 'text-red-400', bar: '#ef4444', bg: 'bg-red-500/10 border-red-500/30', label: 'Low' };
};

const timeSince = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved = false,
  matchScore,
  index = 0,
  compact = false,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [saved, setSaved] = useState(isSaved);

  const saveMutation = useMutation({
    mutationFn: () => saved ? savedJobsApi.unsave(job.id) : savedJobsApi.save(job.id),
    onSuccess: () => {
      setSaved(!saved);
      toast.success(saved ? 'Removed from saved jobs' : 'Job saved!');
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Action failed'),
  });

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    saveMutation.mutate();
  };

  const skills = job.skillsRequired
    ? job.skillsRequired.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const sc = matchScore !== undefined ? scoreColor(matchScore) : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={() => navigate(`/jobs/${job.id}`)}
      className={`
        group relative block w-full rounded-2xl cursor-pointer
        transition-all duration-300
        ${compact ? 'p-4' : 'p-5'}
        ${matchScore !== undefined && matchScore >= 80 
          ? 'bg-[#0f172a] border border-primary-500/40 hover:border-primary-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]'
          : 'bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05]'}
      `}
    >
      {/* High Match Glow Overlay */}
      {matchScore !== undefined && matchScore >= 80 && (
         <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent rounded-2xl pointer-events-none" />
      )}

      {/* Top-right glow on hover */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary-500/5 blur-xl group-hover:bg-primary-500/15 transition-colors duration-500 pointer-events-none" />

      {/* AI Match badge — top right corner if score is high */}
      {sc && matchScore !== undefined && matchScore >= 55 && (
        <div className={`absolute top-4 right-14 flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${sc.bg} ${sc.text}`}>
          <HiSparkles className="w-3 h-3" />
          {matchScore}% Match
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className={`
          flex-shrink-0 rounded-xl border border-white/10 overflow-hidden
          flex items-center justify-center font-bold text-white
          ${compact ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-lg'}
        `}
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(6,182,212,0.15))' }}
        >
          {job.companyLogoUrl ? (
            <img
              src={job.companyLogoUrl}
              alt={job.companyName}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            job.companyName?.charAt(0).toUpperCase()
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title + save btn */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`font-bold text-white group-hover:text-primary-300 transition-colors line-clamp-1 ${compact ? 'text-sm' : 'text-base'}`}>
              {job.title}
            </h3>
            <button
              onClick={handleSave}
              className="flex-shrink-0 p-1.5 rounded-lg text-white/40 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
              title={saved ? 'Remove from saved' : 'Save job'}
            >
              {saved
                ? <HiBookmark className="w-4 h-4 text-primary-400" />
                : <HiOutlineBookmark className="w-4 h-4" />}
            </button>
          </div>

          {/* Company name */}
          <p className="text-sm text-white/55 mb-3">{job.companyName}</p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3">
            <span className="flex items-center gap-1 text-xs text-white/50">
              <HiLocationMarker className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              {job.location}
            </span>
            {job.salaryRange && (
              <span className="flex items-center gap-1 text-xs text-white/50">
                <HiCurrencyDollar className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                {job.salaryRange}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-white/40">
              <HiClock className="w-3.5 h-3.5 flex-shrink-0" />
              {timeSince(job.createdAt)}
            </span>
          </div>

          {/* Type badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${remoteColors[job.remoteType] || 'bg-white/10 text-white/60 border-white/10'}`}>
              {job.remoteType}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${jobTypeColors[job.jobType] || 'bg-white/10 text-white/60 border-white/10'}`}>
              {job.jobType?.replace('_', ' ')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-white/5 text-white/50 border-white/10">
              {job.experienceLevel}
            </span>
          </div>

          {/* Skills chips */}
          {!compact && skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-lg bg-primary-500/8 text-primary-300/80 text-xs border border-primary-500/15 font-medium"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 5 && (
                <span className="px-2 py-0.5 rounded-lg bg-white/5 text-white/40 text-xs">
                  +{skills.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Match score bar — shown when score is present */}
      {sc && matchScore !== undefined && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <HiSparkles className={`w-3.5 h-3.5 ${sc.text}`} />
              AI Resume Match
            </div>
            <span className={`text-xs font-bold ${sc.text}`}>{sc.label} — {matchScore}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/8 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${matchScore}%` }}
              transition={{ delay: index * 0.04 + 0.3, duration: 0.6, ease: 'easeOut' }}
              style={{ background: `linear-gradient(90deg, ${sc.bar}aa, ${sc.bar})` }}
            />
          </div>
        </div>
      )}

      {/* Quick-apply CTA (appears on hover) */}
      <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center gap-1 text-xs text-primary-400 font-semibold">
          View Details <HiArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

export default JobCard;
