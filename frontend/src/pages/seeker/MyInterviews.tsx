import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiEye } from 'react-icons/hi';
import { interviewsApi } from '../../services/api';
import Badge, { statusVariant } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import type { InterviewResponse } from '../../types';

const MyInterviews: React.FC = () => {
  const { data: interviews, isLoading, error } = useQuery({
    queryKey: ['interviews'],
    queryFn: interviewsApi.myInterviews,
  });

  const [selected, setSelected] = useState<InterviewResponse | null>(null);

  if (isLoading) return <div className="py-20"><LoadingSpinner fullPage /></div>;
  if (error) return <div className="p-8 text-center text-red-400">Failed to load interviews.</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">My Interviews</h1>
        <p className="page-subtitle">Manage your scheduled and past interviews.</p>
      </div>

      <div className="glass-card overflow-hidden">
        {(!interviews || interviews.length === 0) ? (
          <div className="p-12 text-center text-white/50">
            You don't have any interviews scheduled yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Job Role</th>
                  <th>Recruiter</th>
                  <th>Location / Link</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {interviews.map(i => {
                  const isOnline = i.locationOrLink.startsWith('http');
                  return (
                  <tr key={i.id} className="hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <HiOutlineCalendar className="text-amber-400" />
                        <span className="font-semibold text-white">
                          {new Date(i.interviewDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                    </td>
                    <td className="font-medium text-white">{i.jobTitle}</td>
                    <td className="text-white/70">{i.recruiterName}</td>
                    <td>
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <HiOutlineLocationMarker className={isOnline ? 'text-cyan-400' : 'text-primary-400'} />
                        {isOnline ? (
                          <a href={i.locationOrLink} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                            Join Meeting
                          </a>
                        ) : (
                          <span>{i.locationOrLink}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge variant={statusVariant(i.status)}>{i.status}</Badge>
                    </td>
                    <td className="text-right">
                      <button 
                        onClick={() => setSelected(i)}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="View Notes"
                      >
                        <HiEye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Interview Details">
        {selected && (
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Job</span>
                <span className="text-white font-medium">{selected.jobTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Date</span>
                <span className="text-white font-medium">{new Date(selected.interviewDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Interviewer</span>
                <span className="text-white font-medium">{selected.recruiterName}</span>
              </div>
            </div>

            <div>
              <span className="block text-sm font-semibold text-white/70 mb-2">Message / Notes from Recruiter</span>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-white/80 whitespace-pre-wrap">
                {selected.notes || 'No additional notes provided.'}
              </div>
            </div>
            
            {selected.locationOrLink.startsWith('http') && (
              <div className="pt-2">
                <a 
                  href={selected.locationOrLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full btn-primary block text-center"
                >
                  Join Meeting Now
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyInterviews;
