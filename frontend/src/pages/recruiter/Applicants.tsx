import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { HiOutlineExternalLink, HiEye, HiSparkles, HiCalendar } from 'react-icons/hi';
import { applicationsApi, interviewsApi, resumesApi } from '../../services/api';
import Badge, { statusVariant } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import type { ApplicationResponse } from '../../types';

const Applicants: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: applications, isLoading, error } = useQuery({
    queryKey: ['recruiterApplications'],
    queryFn: applicationsApi.getAllForRecruiter,
  });

  const [selectedApp, setSelectedApp] = useState<ApplicationResponse | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  
  const [interviewForm, setInterviewForm] = useState({
    interviewDate: '',
    locationOrLink: '',
    notes: '',
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => applicationsApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['recruiterApplications'] });
      queryClient.invalidateQueries({ queryKey: ['recruiterDashboard'] });
      setSelectedApp(null);
    },
    onError: () => toast.error('Failed to update status'),
  });

  const scheduleMutation = useMutation({
    mutationFn: () => interviewsApi.schedule({
      applicationId: selectedApp!.id,
      ...interviewForm,
      // Need ISO string for backend
      interviewDate: new Date(interviewForm.interviewDate).toISOString(),
    }),
    onSuccess: () => {
      toast.success('Interview scheduled successfully');
      setScheduleModalOpen(false);
      // Auto update app status to INTERVIEWING
      statusMutation.mutate({ id: selectedApp!.id, status: 'INTERVIEWING' });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to schedule interview'),
  });

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewForm.interviewDate || !interviewForm.locationOrLink) {
      toast.error('Please fill required fields');
      return;
    }
    scheduleMutation.mutate();
  };

  if (isLoading) return <div className="py-20"><LoadingSpinner fullPage /></div>;
  if (error) return <div className="p-8 text-center text-red-400">Failed to load applicants.</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Applicants</h1>
        <p className="page-subtitle">Review candidates, update statuses, and schedule interviews.</p>
      </div>

      <div className="glass-card overflow-hidden">
        {(!applications || applications.length === 0) ? (
          <div className="p-12 text-center text-white/50">
            No applications received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job Role</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>AI Match</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-white/[0.02]">
                    <td className="font-semibold text-white">
                      <div>
                        {app.candidateName}
                        <div className="text-xs text-white/50 font-normal">{app.candidateEmail}</div>
                      </div>
                    </td>
                    <td className="text-white/80">
                      <Link to={`/jobs/${app.jobId}`} className="hover:text-primary-400 transition-colors inline-flex items-center gap-1">
                        {app.jobTitle} <HiOutlineExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="text-white/70">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Badge variant={statusVariant(app.status)} dot>{app.status}</Badge>
                    </td>
                    <td>
                       {app.aiMatchScore > 0 ? (
                         <div className="flex items-center gap-1 text-xs font-semibold text-primary-400">
                           <HiSparkles /> {app.aiMatchScore}%
                         </div>
                       ) : <span className="text-white/30 text-xs">Pending</span>}
                    </td>
                    <td className="text-right">
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Review Application"
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

      {/* Review Application Modal */}
      <Modal isOpen={!!selectedApp && !scheduleModalOpen} onClose={() => setSelectedApp(null)} title="Review Application" size="lg">
        {selectedApp && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedApp.candidateName}</h3>
                <p className="text-white/70">{selectedApp.candidateEmail}</p>
              </div>
              <Badge variant={statusVariant(selectedApp.status)}>{selectedApp.status}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="block text-white/50 mb-1">Applied For</span>
                <span className="text-white font-medium block truncate">{selectedApp.jobTitle}</span>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="block text-white/50 mb-1">Resume</span>
                {selectedApp.resumeId ? (
                  <a href={resumesApi.getDownloadUrl(selectedApp.resumeId)} target="_blank" rel="noreferrer" className="text-primary-400 hover:underline font-medium truncate block flex items-center gap-1">
                    Download <HiOutlineExternalLink />
                  </a>
                ) : (
                  <span className="text-white/50 italic block">No resume attached</span>
                )}
              </div>
            </div>

            {selectedApp.aiMatchScore > 0 && (
              <div className="p-4 bg-primary-500/10 rounded-xl border border-primary-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <HiSparkles className="text-primary-400" />
                    <span className="text-sm font-bold text-white">AI Candidate Match</span>
                  </div>
                  <span className="text-lg font-black text-primary-400">{selectedApp.aiMatchScore}%</span>
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

            <div className="pt-4 border-t border-white/10">
              <h4 className="text-sm font-semibold text-white mb-3">Update Status</h4>
              <div className="flex flex-wrap gap-2">
                {['SCREENING', 'INTERVIEWING', 'OFFERED', 'REJECTED'].map((status) => (
                  <Button 
                    key={status} 
                    variant={selectedApp.status === status ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => statusMutation.mutate({ id: selectedApp.id, status })}
                    disabled={statusMutation.isPending || selectedApp.status === status}
                  >
                    {status}
                  </Button>
                ))}
                
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="ml-auto !bg-amber-500 hover:!bg-amber-600 shadow-amber-500/30"
                  icon={<HiCalendar />}
                  onClick={() => setScheduleModalOpen(true)}
                >
                  Schedule Interview
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal isOpen={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} title="Schedule Interview">
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <p className="text-sm text-white/50 mb-4">
            Scheduling interview with <strong className="text-white">{selectedApp?.candidateName}</strong> for <strong className="text-white">{selectedApp?.jobTitle}</strong>.
          </p>

          <Input
            label="Date & Time *"
            type="datetime-local"
            value={interviewForm.interviewDate}
            onChange={(e) => setInterviewForm({ ...interviewForm, interviewDate: e.target.value })}
            required
            className="text-white/80" // Ensure calendar text is visible
          />
          
          <Input
            label="Location or Meeting Link *"
            placeholder="e.g. Google Meet link or Office Address"
            value={interviewForm.locationOrLink}
            onChange={(e) => setInterviewForm({ ...interviewForm, locationOrLink: e.target.value })}
            required
          />

          <div>
            <label className="field-label">Message / Notes</label>
            <textarea
              className="input-field min-h-[100px] resize-y"
              placeholder="Instructions for the candidate..."
              value={interviewForm.notes}
              onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setScheduleModalOpen(false)} type="button">Cancel</Button>
            <Button type="submit" isLoading={scheduleMutation.isPending}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Applicants;
