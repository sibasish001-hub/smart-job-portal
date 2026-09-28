import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { HiLocationMarker, HiBriefcase, HiClock, HiCurrencyDollar, HiArrowLeft, HiBookmark, HiOutlineBookmark } from 'react-icons/hi';
import { jobsApi, savedJobsApi, applicationsApi, resumesApi } from '../../services/api';
import Badge, { statusVariant } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { useAuthStore } from '../../store/authStore';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.getById(id!),
    enabled: !!id,
  });

  const { data: isSaved } = useQuery({
    queryKey: ['savedJob', id],
    queryFn: () => savedJobsApi.check(id!),
    enabled: !!user && !!id,
  });

  const { data: resumes } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumesApi.list,
    enabled: !!user && applyModalOpen,
  });
  
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');

  const { data: applications } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationsApi.myApplications,
    enabled: !!user,
  });

  const existingApplication = applications?.find(a => a.jobId === id);

  const saveMutation = useMutation({
    mutationFn: () => isSaved ? savedJobsApi.unsave(id!) : savedJobsApi.save(id!),
    onSuccess: () => {
      toast.success(isSaved ? 'Job unsaved' : 'Job saved');
      queryClient.invalidateQueries({ queryKey: ['savedJob', id] });
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
    },
    onError: () => toast.error('Action failed'),
  });

  const applyMutation = useMutation({
    mutationFn: () => applicationsApi.apply(id!, { coverLetter, resumeId: selectedResumeId || undefined }),
    onSuccess: () => {
      toast.success('Successfully applied to job!');
      setApplyModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to apply'),
  });

  if (isLoading) return <LoadingSpinner fullPage text="Loading job details..." />;
  if (error || !job) return <div className="p-8 text-center text-red-400">Failed to load job details.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
        <HiArrowLeft /> Back
      </button>

      {/* Header Card */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/30 to-cyan-500/30 flex items-center justify-center border border-white/10 flex-shrink-0">
              <span className="text-2xl font-bold text-white">{job.companyName.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{job.title}</h1>
              <p className="text-lg text-white/70 mb-4">{job.companyName}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/50">
                <span className="flex items-center gap-1.5"><HiLocationMarker className="text-cyan-400" /> {job.location}</span>
                <span className="flex items-center gap-1.5"><HiBriefcase className="text-primary-400" /> {job.experienceLevel}</span>
                {job.salaryRange && <span className="flex items-center gap-1.5"><HiCurrencyDollar className="text-green-400" /> {job.salaryRange}</span>}
                <span className="flex items-center gap-1.5"><HiClock /> {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-row md:flex-col items-center md:items-end justify-center md:justify-start gap-3">
            {existingApplication ? (
              <div className="flex flex-col items-end gap-2">
                <Button disabled variant="secondary" className="!text-green-400 border-green-500/30 bg-green-500/10">
                  Applied
                </Button>
                {existingApplication.aiMatchScore > 0 && (
                   <span className="text-xs font-semibold text-primary-400 bg-primary-500/10 px-2 py-1 rounded-lg border border-primary-500/20">
                     AI Match: {existingApplication.aiMatchScore}%
                   </span>
                )}
              </div>
            ) : (
              <Button onClick={() => user ? setApplyModalOpen(true) : navigate('/login')} className="px-8 w-full md:w-auto">
                Apply Now
              </Button>
            )}
            <button 
              onClick={() => saveMutation.mutate()} 
              disabled={saveMutation.isPending}
              className="p-3 rounded-xl border border-white/10 text-white/70 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
            >
              {isSaved ? <HiBookmark className="w-5 h-5 text-primary-400" /> : <HiOutlineBookmark className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5">
          <Badge variant={statusVariant(job.remoteType)}>{job.remoteType}</Badge>
          <Badge variant={statusVariant(job.jobType)}>{job.jobType.replace('_', ' ')}</Badge>
          {job.skillsRequired?.split(',').map(s => (
            <Badge key={s.trim()} variant="gray">{s.trim()}</Badge>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Job Description</h2>
          <div className="text-white/70 whitespace-pre-wrap leading-relaxed text-sm">
            {job.description}
          </div>
        </div>

        {job.requirements && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Requirements</h2>
            <div className="text-white/70 whitespace-pre-wrap leading-relaxed text-sm">
              {job.requirements}
            </div>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      <Modal isOpen={applyModalOpen} onClose={() => setApplyModalOpen(false)} title={`Apply to ${job.companyName}`}>
        <div className="space-y-4">
          <p className="text-sm text-white/50 mb-4">You are applying for the <strong className="text-white">{job.title}</strong> position.</p>
          
          <div>
            <label className="field-label">Select Resume (Optional)</label>
            <select 
              className="input-field" 
              value={selectedResumeId} 
              onChange={(e) => setSelectedResumeId(e.target.value)}
            >
              <option value="">No resume selected</option>
              {resumes?.map(r => (
                <option key={r.id} value={r.id}>{r.fileName}</option>
              ))}
            </select>
            {(!resumes || resumes.length === 0) && (
              <p className="text-xs text-yellow-400 mt-2">
                You don't have any resumes uploaded. <Link to="/resume" className="underline">Upload one here.</Link>
              </p>
            )}
          </div>

          <div>
            <label className="field-label">Cover Letter (Optional)</label>
            <textarea
              className="input-field min-h-[120px] resize-y"
              placeholder="Tell the employer why you're a great fit..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setApplyModalOpen(false)}>Cancel</Button>
            <Button onClick={() => applyMutation.mutate()} isLoading={applyMutation.isPending}>
              Submit Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobDetail;
