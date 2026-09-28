import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { HiSearch, HiOutlineBriefcase, HiTrash, HiEye, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { ApiResponse, JobResponse, JobSearchFilter } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminAllJobs: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: jobsPage, isLoading } = useQuery({
    queryKey: ['adminJobs', search],
    queryFn: () =>
      api.get<ApiResponse<any>>('/jobs', {
        params: { query: search || undefined, size: 50, sortBy: 'createdAt', sortDir: 'desc' },
      }).then(r => r.data.data),
  });

  const jobs: JobResponse[] = jobsPage?.content || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/jobs/${id}`),
    onSuccess: () => {
      toast.success('Job deleted');
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
    },
    onError: () => toast.error('Failed to delete job'),
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <HiOutlineBriefcase className="text-primary-400" /> All Jobs
        </h1>
        <p className="page-subtitle">View and moderate all job postings on the platform.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, company..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 outline-none focus:border-primary-500/60"
        />
      </div>

      {isLoading && (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" text="Loading jobs..." />
        </div>
      )}

      {!isLoading && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <span className="text-sm text-white/60">{jobs.length} job{jobs.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, i) => (
                  <motion.tr
                    key={job.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <td className="font-medium text-white max-w-xs truncate">{job.title}</td>
                    <td className="text-white/70">{job.companyName}</td>
                    <td>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/60 border border-white/10">
                        {job.jobType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {job.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-400">
                          <HiCheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-white/40">
                          <HiXCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="text-white/50 text-xs">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          title="View Job"
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                        >
                          <HiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this job permanently?')) deleteMutation.mutate(job.id);
                          }}
                          title="Delete Job"
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {jobs.length === 0 && (
              <div className="p-12 text-center text-white/40 text-sm">No jobs found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAllJobs;
