import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineCalendar, HiPlus
} from 'react-icons/hi';
import { dashboardApi } from '../../services/api';
import StatsCard from '../../components/dashboard/StatsCard';
import Badge, { statusVariant } from '../../components/ui/Badge';
import LoadingSpinner, { CardSkeleton } from '../../components/ui/LoadingSpinner';

const RecruiterDashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['recruiterDashboard'],
    queryFn: dashboardApi.recruiter,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="glass-card p-12 text-center text-red-400">
        Failed to load dashboard data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 page-header">
        <div>
          <h1 className="page-title">Recruiter Dashboard</h1>
          <p className="page-subtitle">Overview of your job postings and candidates.</p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn-primary">
          <HiPlus className="w-5 h-5" /> Post New Job
        </Link>
      </div>

      {/* ── Stats Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Active Jobs"
          value={stats.activeJobsCount}
          icon={<HiOutlineBriefcase />}
          iconBg="bg-blue-500/20 text-blue-400"
          delay={0.1}
        />
        <StatsCard
          title="Total Applicants"
          value={stats.totalApplicants}
          icon={<HiOutlineUserGroup />}
          iconBg="bg-purple-500/20 text-purple-400"
          delay={0.2}
        />
        <StatsCard
          title="Scheduled Interviews"
          value={stats.scheduledInterviews}
          icon={<HiOutlineCalendar />}
          iconBg="bg-amber-500/20 text-amber-400"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Jobs */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Recent Job Postings</h2>
            <Link to="/recruiter/jobs" className="text-sm font-medium text-primary-400 hover:text-primary-300">
              View all
            </Link>
          </div>
          
          {stats.recentJobs && stats.recentJobs.length > 0 ? (
            <div className="space-y-4">
              {stats.recentJobs.map((job) => (
                <div key={job.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-colors">
                  <div>
                    <Link to={`/jobs/${job.id}`} className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                      {job.title}
                    </Link>
                    <div className="flex gap-2 text-xs text-white/50 mt-1">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge variant={job.isActive ? 'green' : 'gray'}>
                    {job.isActive ? 'Active' : 'Closed'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/50 border border-dashed border-white/10 rounded-xl">
              No jobs posted yet.
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Recent Applicants</h2>
            <Link to="/recruiter/applications" className="text-sm font-medium text-primary-400 hover:text-primary-300">
              View all
            </Link>
          </div>
          
          {stats.recentApplications && stats.recentApplications.length > 0 ? (
            <div className="space-y-4">
              {stats.recentApplications.map((app) => (
                <div key={app.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-white">{app.candidateName}</span>
                      <p className="text-xs text-white/50">Applied for <strong className="text-white/70">{app.jobTitle}</strong></p>
                    </div>
                    <Badge variant={statusVariant(app.status)}>{app.status}</Badge>
                  </div>
                  {app.aiMatchScore > 0 && (
                     <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                       <div 
                         className="h-full rounded-full" 
                         style={{
                           width: `${app.aiMatchScore}%`,
                           background: app.aiMatchScore >= 70 ? '#22c55e' : app.aiMatchScore >= 50 ? '#6366f1' : '#f59e0b'
                         }}
                       />
                     </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/50 border border-dashed border-white/10 rounded-xl">
              No applications received yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RecruiterDashboard;
