import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiEye, HiOutlineExternalLink } from 'react-icons/hi';
import { jobsApi } from '../../services/api';
import Badge, { statusVariant } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Note: since the backend doesn't have a specific "get recruiter's jobs" endpoint other than through the dashboard,
// we will fetch all jobs and filter them, or just use the dashboard data. 
// A better approach would be to have `/api/jobs/my-jobs`, but for this demo, we'll use the search endpoint with a filter 
// or fetch the recruiter dashboard data which contains recent jobs.
// Wait, we can fetch the dashboard data and show `recentJobs` since it contains the recruiter's jobs.
// Let's use `dashboardApi.recruiter()` for now to get the jobs list.

import { dashboardApi } from '../../services/api';

const ManageJobs: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['recruiterDashboard'],
    queryFn: dashboardApi.recruiter,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => jobsApi.toggleActive(id, isActive),
    onSuccess: () => {
      toast.success('Job status updated');
      queryClient.invalidateQueries({ queryKey: ['recruiterDashboard'] });
    },
    onError: () => toast.error('Failed to update job status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobsApi.delete(id),
    onSuccess: () => {
      toast.success('Job deleted');
      queryClient.invalidateQueries({ queryKey: ['recruiterDashboard'] });
    },
    onError: () => toast.error('Failed to delete job'),
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="py-20"><LoadingSpinner fullPage /></div>;
  if (error || !stats) return <div className="p-8 text-center text-red-400">Failed to load jobs.</div>;

  const jobs = stats.recentJobs || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 page-header">
        <div>
          <h1 className="page-title">Manage Jobs</h1>
          <p className="page-subtitle">View, edit, and manage your job postings.</p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn-primary">
          <HiPlus className="w-5 h-5" /> Post New Job
        </Link>
      </div>

      <div className="glass-card overflow-hidden">
        {jobs.length === 0 ? (
          <div className="p-12 text-center text-white/50">
            You haven't posted any jobs yet. <Link to="/recruiter/jobs/new" className="text-primary-400 hover:underline">Post your first job</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Posted Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-white/[0.02]">
                    <td className="font-semibold text-white">
                      <Link to={`/jobs/${job.id}`} className="hover:text-primary-400 transition-colors flex items-center gap-1">
                        {job.title} <HiOutlineExternalLink />
                      </Link>
                    </td>
                    <td className="text-white/70">{job.location}</td>
                    <td>
                      <Badge variant={statusVariant(job.jobType)}>{job.jobType.replace('_', ' ')}</Badge>
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleActiveMutation.mutate({ id: job.id, isActive: !job.isActive })}
                        disabled={toggleActiveMutation.isPending}
                        className="transition-opacity hover:opacity-80"
                        title="Click to toggle status"
                      >
                        <Badge variant={job.isActive ? 'green' : 'gray'}>
                          {job.isActive ? 'Active' : 'Closed'}
                        </Badge>
                      </button>
                    </td>
                    <td className="text-white/70">{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td className="text-right space-x-2">
                      <button 
                        onClick={() => navigate(`/recruiter/jobs/${job.id}/edit`)}
                        className="p-2 text-white/50 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors inline-flex"
                        title="Edit Job"
                      >
                        <HiPencil className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(job.id)}
                        className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors inline-flex"
                        title="Delete Job"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;
