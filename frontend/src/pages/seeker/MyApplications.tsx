import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { HiOutlineExternalLink, HiEye, HiSparkles } from 'react-icons/hi';
import { applicationsApi } from '../../services/api';
import Badge, { statusVariant } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import type { ApplicationResponse } from '../../types';

const MyApplications: React.FC = () => {
  const { data: applications, isLoading, error } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationsApi.myApplications,
  });

  const [selectedApp, setSelectedApp] = useState<ApplicationResponse | null>(null);

  if (isLoading) return <div className="py-20"><LoadingSpinner fullPage /></div>;
  if (error) return <div className="p-8 text-center text-red-400">Failed to load applications.</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">My Applications</h1>
        <p className="page-subtitle">Track the status of your job applications.</p>
      </div>

      <div className="glass-card overflow-hidden">
        {(!applications || applications.length === 0) ? (
          <div className="p-12 text-center text-white/50">
            You haven't applied to any jobs yet. <Link to="/jobs" className="text-primary-400 hover:underline">Find jobs now</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Role</th>
                  <th>Company</th>
                  <th>Applied Date</th>
                  <th>Resume Used</th>
                  <th>Status</th>
                  <th>Match</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-white/[0.02]">
                    <td className="font-semibold text-white">
                      <Link to={`/jobs/${app.jobId}`} className="hover:text-primary-400 transition-colors flex items-center gap-1">
                        {app.jobTitle} <HiOutlineExternalLink />
                      </Link>
                    </td>
                    <td>{app.companyName}</td>
                    <td className="text-white/70">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="text-white/50 text-xs">{app.resumeName}</td>
                    <td>
                      <Badge variant={statusVariant(app.status)} dot>{app.status}</Badge>
                    </td>
                    <td>
                       {app.aiMatchScore > 0 ? (
                         <div className="flex items-center gap-1 text-xs font-semibold text-primary-400">
                           <HiSparkles /> {app.aiMatchScore}%
                         </div>
                       ) : <span className="text-white/30 text-xs">N/A</span>}
                    </td>
                    <td className="text-right">
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <HiEye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title="Application Details" size="lg">
        {selectedApp && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedApp.jobTitle}</h3>
                <p className="text-white/70">{selectedApp.companyName}</p>
              </div>
              <Badge variant={statusVariant(selectedApp.status)}>{selectedApp.status}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="block text-white/50 mb-1">Applied On</span>
                <span className="text-white font-medium">{new Date(selectedApp.createdAt).toLocaleString()}</span>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="block text-white/50 mb-1">Resume Used</span>
                <span className="text-white font-medium truncate block">{selectedApp.resumeName}</span>
              </div>
            </div>

            {selectedApp.aiMatchScore > 0 && (
              <div className="p-4 bg-primary-500/10 rounded-xl border border-primary-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <HiSparkles className="text-primary-400" />
                  <span className="text-sm font-bold text-white">AI Match Analysis ({selectedApp.aiMatchScore}%)</span>
                </div>
                <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                  {selectedApp.aiMatchDetails || 'No details provided.'}
                </p>
              </div>
            )}

            {selectedApp.coverLetter && (
              <div>
                <span className="block text-sm font-semibold text-white/70 mb-2">Cover Letter</span>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-white/80 whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedApp.coverLetter}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyApplications;
