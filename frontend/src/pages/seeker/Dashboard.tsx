import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  HiOutlineDocumentText, HiOutlineBriefcase, HiOutlineBookmark,
  HiOutlineCalendar, HiArrowRight
} from 'react-icons/hi';
import { dashboardApi } from '../../services/api';
import StatsCard from '../../components/dashboard/StatsCard';
import AtsScoreGauge from '../../components/dashboard/AtsScoreGauge';
import ApplicationPipeline from '../../components/dashboard/ApplicationPipeline';
import Badge, { statusVariant } from '../../components/ui/Badge';
import LoadingSpinner, { CardSkeleton } from '../../components/ui/LoadingSpinner';

const SeekerDashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['seekerDashboard'],
    queryFn: dashboardApi.seeker,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6"><CardSkeleton /><CardSkeleton /></div>
          <div className="space-y-6"><CardSkeleton /><CardSkeleton /></div>
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
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">Track your applications, interviews, and resume performance.</p>
      </div>

      {/* ── Stats Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={<HiOutlineBriefcase />}
          iconBg="bg-blue-500/20 text-blue-400"
          delay={0.1}
        />
        <StatsCard
          title="Saved Jobs"
          value={stats.savedJobsCount}
          icon={<HiOutlineBookmark />}
          iconBg="bg-purple-500/20 text-purple-400"
          delay={0.2}
        />
        <StatsCard
          title="Upcoming Interviews"
          value={stats.upcomingInterviews}
          icon={<HiOutlineCalendar />}
          iconBg="bg-amber-500/20 text-amber-400"
          delay={0.3}
        />
        <StatsCard
          title="Avg. ATS Score"
          value={`${stats.atsScore}%`}
          icon={<HiOutlineDocumentText />}
          iconBg="bg-green-500/20 text-green-400"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Column (Left) ──────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Applications */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Recent Applications</h2>
              <Link to="/applications" className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">
                View all
              </Link>
            </div>
            
            {stats.recentApplications && stats.recentApplications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Company</th>
                      <th>Status</th>
                      <th>Applied Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentApplications.map((app) => (
                      <tr key={app.id}>
                        <td className="font-medium text-white">{app.jobTitle}</td>
                        <td>{app.companyName}</td>
                        <td>
                          <Badge variant={statusVariant(app.status)} dot>{app.status}</Badge>
                        </td>
                        <td className="text-white/50">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-white/50 border border-dashed border-white/10 rounded-xl">
                No recent applications found. <Link to="/jobs" className="text-primary-400 underline">Find jobs</Link>
              </div>
            )}
          </div>

          {/* Application Pipeline */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-6">Application Pipeline</h2>
            {stats.totalApplications > 0 ? (
              <ApplicationPipeline applications={stats.recentApplications || []} />
            ) : (
              <p className="text-sm text-white/50 text-center py-4">No data to display.</p>
            )}
          </div>
        </div>

        {/* ── Side Column (Right) ─────────────────────────────────── */}
        <div className="space-y-6">
          
          {/* ATS Score Gauge */}
          <div className="glass-card p-6 flex flex-col items-center">
            <h2 className="text-lg font-bold text-white w-full mb-6">Latest Resume Score</h2>
            <AtsScoreGauge score={stats.atsScore} />
            <Link to="/resume" className="mt-6 text-sm text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1">
              Improve resume <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Upcoming Interviews */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Upcoming Interviews</h2>
              <Link to="/interviews" className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">
                View all
              </Link>
            </div>
            
            {stats.upcomingInterviewList && stats.upcomingInterviewList.length > 0 ? (
              <div className="space-y-4">
                {stats.upcomingInterviewList.map((interview) => (
                  <div key={interview.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                      <HiOutlineCalendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{interview.jobTitle}</h4>
                      <p className="text-xs text-white/60 mb-1">{interview.recruiterName}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-white/80">{new Date(interview.interviewDate).toLocaleString()}</span>
                        <span className="text-white/40">•</span>
                        <Badge variant="cyan">{interview.locationOrLink.startsWith('http') ? 'Online' : 'On-site'}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/50 border border-dashed border-white/10 rounded-xl">
                No upcoming interviews.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SeekerDashboard;
