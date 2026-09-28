import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSparkles, HiBriefcase, HiSearch, HiUpload } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { jobsApi, savedJobsApi, resumesApi } from '../../services/api';
import type { JobSearchFilter, JobResponse, ResumeAnalysisDto } from '../../types';
import JobCard from '../../components/jobs/JobCard';
import JobFilters from '../../components/jobs/JobFilters';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuthStore } from '../../store/authStore';

type Tab = 'recommended' | 'all';

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

const JobSearch: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('recommended');
  const [filters, setFilters] = useState<JobSearchFilter>({
    page: 0,
    size: 12,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });
  const [searchInput, setSearchInput] = useState('');

  // ── Recommended jobs ─────────────────────────────────────────────────────
  const { data: recommendedJobs, isLoading: recLoading } = useQuery({
    queryKey: ['recommendedJobs'],
    queryFn: jobsApi.getRecommended,
    enabled: !!user && activeTab === 'recommended',
  });

  // ── Latest resume analysis (to compute client-side match scores) ──────────
  const { data: latestAnalysis } = useQuery<ResumeAnalysisDto | null>({
    queryKey: ['latestAnalysis'],
    queryFn: resumesApi.getLatestAnalysis,
    enabled: !!user,
    retry: false,
  });

  // ── All jobs search ───────────────────────────────────────────────────────
  const { data: allJobsPage, isLoading: allLoading, isPlaceholderData } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobsApi.search(filters),
    placeholderData: (prev) => prev,
    enabled: activeTab === 'all',
  });

  // ── Saved jobs (for bookmark state) ──────────────────────────────────────
  const { data: savedJobsData } = useQuery({
    queryKey: ['savedJobs'],
    queryFn: savedJobsApi.list,
    enabled: !!user,
  });
  const savedJobIds = new Set(savedJobsData?.map((j) => j.id) || []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab('all');
    setFilters(f => ({ ...f, query: searchInput, page: 0 }));
  }, [searchInput]);

  const handleFilterChange = (newFilters: JobSearchFilter) => setFilters(newFilters);
  const handlePageChange = (newPage: number) => setFilters(f => ({ ...f, page: newPage }));

  const hasResume = !!latestAnalysis;

  return (
    <div className="space-y-6">
      {/* ── Hero Search Section ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900/40 via-[#0f172a] to-[#1e1b4b] border border-white/10 p-8 sm:p-12">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70"
          >
            Find Your Next Dream Job
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-white/60 text-base sm:text-lg"
          >
            Discover opportunities tailored perfectly to your skills, or search across our entire global database.
          </motion.p>

          <motion.form 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            onSubmit={handleSearch} 
            className="relative max-w-2xl mx-auto mt-8 group"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 group-focus-within:text-primary-300 transition-colors">
              <HiSearch className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by job title, skill, or keyword..."
              className="w-full pl-12 sm:pl-14 pr-32 py-4 sm:py-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 outline-none focus:border-primary-400 focus:bg-white/15 transition-all text-base shadow-2xl"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary-500 to-cyan-500 hover:from-primary-400 hover:to-cyan-400 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all shadow-lg shadow-primary-500/25"
            >
              Search
            </button>
          </motion.form>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────── */}
      <div className="flex justify-center sm:justify-start">
        <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 w-fit backdrop-blur-sm shadow-xl">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'recommended'
                ? 'text-white'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            {activeTab === 'recommended' && (
              <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/25" />
            )}
            <HiSparkles className={`w-5 h-5 relative z-10 ${activeTab === 'recommended' ? 'text-yellow-300' : ''}`} />
            <span className="relative z-10">AI Recommendations</span>
          </button>
          
          <button
            onClick={() => setActiveTab('all')}
            className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'all'
                ? 'text-white'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            {activeTab === 'all' && (
              <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/25" />
            )}
            <HiBriefcase className="w-5 h-5 relative z-10" />
            <span className="relative z-10">All Jobs</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Filters Sidebar (only on All Jobs tab) ─────────────── */}
        <AnimatePresence>
          {activeTab === 'all' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="w-full lg:w-72 flex-shrink-0"
            >
              <JobFilters filters={filters} onChange={handleFilterChange} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Job List ────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">

            {/* ─── RECOMMENDED TAB ─────────────────────────────── */}
            {activeTab === 'recommended' && (
              <motion.div
                key="recommended"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Prompt if no resume uploaded */}
                {!hasResume && !recLoading && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/40 to-purple-900/20 border border-indigo-500/30 p-8 sm:p-12 text-center"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10 max-w-lg mx-auto space-y-6">
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/10">
                        <HiUpload className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Unlock AI Job Matches</h3>
                      <p className="text-white/70">
                        Upload your resume to let our advanced AI analyze your skills, experience, and career trajectory. We'll automatically find the perfect roles for you—so you can stop searching and start applying.
                      </p>
                      <Link to="/resume" className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-indigo-500/25">
                        <HiUpload className="w-5 h-5" />
                        Upload Resume Now
                      </Link>
                    </div>
                  </motion.div>
                )}

                {recLoading ? (
                  <div className="py-20 flex justify-center">
                    <LoadingSpinner size="lg" text="Finding your best matches..." />
                  </div>
                ) : recommendedJobs && recommendedJobs.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-white/60">
                        {hasResume
                          ? `${recommendedJobs.length} jobs matched to your resume`
                          : `${recommendedJobs.length} recent jobs`}
                      </p>
                      {hasResume && (
                        <span className="text-xs text-primary-400 flex items-center gap-1">
                          <HiSparkles className="w-3.5 h-3.5" /> Sorted by AI match score
                        </span>
                      )}
                    </div>
                    <div className="space-y-4">
                      {recommendedJobs.map((job: JobResponse, i: number) => {
                        const ms = hasResume ? computeMatchScore(job.skillsRequired, latestAnalysis || null) : undefined;
                        return (
                          <JobCard
                            key={job.id}
                            job={job}
                            isSaved={savedJobIds.has(job.id)}
                            matchScore={ms}
                            index={i}
                          />
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="glass-card p-12 text-center text-white/50">
                    No recommendations available yet.
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── ALL JOBS TAB ─────────────────────────────────── */}
            {activeTab === 'all' && (
              <motion.div
                key="all"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white/70">
                    {allLoading
                      ? 'Searching...'
                      : `${allJobsPage?.totalElements ?? 0} Jobs Found`}
                  </h2>
                  {isPlaceholderData && (
                    <span className="text-xs text-white/30 animate-pulse">Updating...</span>
                  )}
                </div>

                {allLoading ? (
                  <div className="py-20 flex justify-center">
                    <LoadingSpinner size="lg" text="Searching jobs..." />
                  </div>
                ) : allJobsPage?.content && allJobsPage.content.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {allJobsPage.content.map((job: JobResponse, i: number) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          isSaved={savedJobIds.has(job.id)}
                          index={i}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {allJobsPage.totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-white/5">
                        <button
                          onClick={() => handlePageChange((filters.page ?? 0) - 1)}
                          disabled={allJobsPage.first}
                          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 disabled:opacity-40 transition-colors"
                        >
                          ← Previous
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(allJobsPage.totalPages, 7) }).map((_, idx) => {
                            const currentPage = filters.page ?? 0;
                            const totalPages = allJobsPage.totalPages;
                            let pageNum = idx;
                            if (totalPages > 7) {
                              const start = Math.max(0, currentPage - 3);
                              pageNum = Math.min(start + idx, totalPages - 1);
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                  pageNum === currentPage
                                    ? 'bg-primary-500 text-white'
                                    : 'text-white/50 hover:bg-white/10'
                                }`}
                              >
                                {pageNum + 1}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => handlePageChange((filters.page ?? 0) + 1)}
                          disabled={allJobsPage.last}
                          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 disabled:opacity-40 transition-colors"
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="glass-card p-12 text-center text-white/50">
                    <HiBriefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-medium text-white/70 mb-1">No jobs found</p>
                    <p className="text-sm">Try adjusting your filters or search term.</p>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;
