import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  HiOutlineUsers, HiOutlineBriefcase, HiOutlineDocumentReport, HiOutlineOfficeBuilding
} from 'react-icons/hi';
import { dashboardApi } from '../../services/api';
import StatsCard from '../../components/dashboard/StatsCard';
import LoadingSpinner, { CardSkeleton } from '../../components/ui/LoadingSpinner';

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: dashboardApi.admin,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Admin Overview</h1>
        <p className="page-subtitle">Platform-wide statistics and metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<HiOutlineUsers />}
          iconBg="bg-blue-500/20 text-blue-400"
          delay={0.1}
        />
        <StatsCard
          title="Total Recruiters"
          value={stats.totalRecruiters}
          icon={<HiOutlineOfficeBuilding />}
          iconBg="bg-purple-500/20 text-purple-400"
          delay={0.2}
        />
        <StatsCard
          title="Total Jobs Posted"
          value={stats.totalJobsPosted}
          icon={<HiOutlineBriefcase />}
          iconBg="bg-emerald-500/20 text-emerald-400"
          delay={0.3}
        />
        <StatsCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={<HiOutlineDocumentReport />}
          iconBg="bg-amber-500/20 text-amber-400"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="glass-card p-8 text-center space-y-4">
           <h2 className="text-xl font-bold text-white mb-2">User Management</h2>
           <p className="text-white/50 text-sm mb-4">View and manage all registered platform users.</p>
           <button className="btn-secondary w-full max-w-xs mx-auto disabled:opacity-50" disabled>Coming Soon</button>
        </div>
        
        <div className="glass-card p-8 text-center space-y-4">
           <h2 className="text-xl font-bold text-white mb-2">System Analytics</h2>
           <p className="text-white/50 text-sm mb-4">View detailed platform usage and API metrics.</p>
           <button className="btn-secondary w-full max-w-xs mx-auto disabled:opacity-50" disabled>Coming Soon</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
