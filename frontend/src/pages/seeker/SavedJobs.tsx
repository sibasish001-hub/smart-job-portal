import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineBookmark, HiTrash, HiBriefcase, HiSparkles } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { savedJobsApi, resumesApi } from '../../services/api';
import type { JobResponse, ResumeAnalysisDto } from '../../types';
import JobCard from '../../components/jobs/JobCard';
import LoadingSpinner, { CardSkeleton } from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const computeMatchScore = (jobSkills: string | null, analysis: ResumeAnalysisDto | null): number => {
  if (!jobSkills || !analysis) return 0;
  const jobTokens = jobSkills.toLowerCase().split(/[,\s]+/).filter(s => s.length > 2);
  const userStrengths = (analysis.strengths || '').toLowerCase();
  const userMissing = (analysis.missingSkills || '').toLowerCase();
  
  if (jobTokens.length === 0) return 0;
  
  let matchCount = 0;
  for (const skill of jobTokens) {
    if (userStrengths.includes(skill)) {
      matchCount++;
    } else if (!userMissing.includes(skill)) {
      matchCount += 0.5;
    }
  }
  
  return Math.max(30, Math.round((matchCount / jobTokens.length) * 100));
};

const SavedJobs: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: jobs, isLoading, error } = useQuery<JobResponse[]>({
    queryKey: ['savedJobs'],
    queryFn: savedJobsApi.list,
  });

  const { data: analysis } = useQuery<ResumeAnalysisDto | null>({
    queryKey: ['latestAnalysis'],
    queryFn: resumesApi.getLatestAnalysis,
    retry: false,
  });

  const unsaveMutation = useMutation({
    mutationFn: (jobId: string) => savedJobsApi.unsave(jobId),
    onSuccess: () => {
      toast.success('Job removed from saved list');
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
    },
    onError: () => toast.error('Failed to remove job'),
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <HiOutlineBookmark className="text-primary-400" />
          Saved Jobs
        </h1>
        <p className="page-subtitle">Jobs you've bookmarked for later.</p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      )}

      {error && (
        <div className="glass-card p-8 text-center text-red-400">
          Failed to load saved jobs.
        </div>
      )}

      {!isLoading && jobs && jobs.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <HiOutlineBookmark className="w-8 h-8 text-white/30" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No saved jobs yet</h3>
          <p className="text-white/50 text-sm mb-6">
            Browse jobs and click the bookmark icon to save them here for later.
          </p>
          <Link to="/jobs" className="btn-primary inline-flex">
            <HiBriefcase className="w-4 h-4" />
            Find Jobs
          </Link>
        </motion.div>
      )}

      {!isLoading && jobs && jobs.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">
              {jobs.length} saved job{jobs.length !== 1 ? 's' : ''}
            </p>
            {analysis && (
              <span className="text-xs text-primary-400 flex items-center gap-1">
                <HiSparkles className="w-3.5 h-3.5" /> Resume match scores shown
              </span>
            )}
          </div>

          <AnimatePresence>
            <div className="space-y-4">
              {jobs.map((job, i) => (
                <div key={job.id} className="relative group">
                  <JobCard
                    job={job}
                    isSaved={true}
                    matchScore={analysis ? computeMatchScore(job.skillsRequired, analysis) : undefined}
                    index={i}
                  />
                  {/* Quick unsave button */}
                  <button
                    onClick={() => unsaveMutation.mutate(job.id)}
                    disabled={unsaveMutation.isPending}
                    title="Remove from saved"
                    className="absolute top-4 right-14 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 z-10"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default SavedJobs;
