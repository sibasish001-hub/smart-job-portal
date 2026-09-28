import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { jobsApi } from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import type { JobRequest } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const EditJob: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.getById(id!),
    enabled: !!id,
  });

  const [form, setForm] = useState<JobRequest>({
    title: '',
    description: '',
    requirements: '',
    skillsRequired: '',
    location: '',
    remoteType: 'ONSITE',
    jobType: 'FULL_TIME',
    experienceLevel: 'ENTRY',
    salaryRange: '',
  });

  useEffect(() => {
    if (job) {
      setForm({
        title: job.title,
        description: job.description,
        requirements: job.requirements || '',
        skillsRequired: job.skillsRequired || '',
        location: job.location,
        remoteType: job.remoteType,
        jobType: job.jobType,
        experienceLevel: job.experienceLevel,
        salaryRange: job.salaryRange || '',
      });
    }
  }, [job]);

  const mutation = useMutation({
    mutationFn: () => jobsApi.update(id!, form),
    onSuccess: () => {
      toast.success('Job updated successfully!');
      navigate('/recruiter/jobs');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update job'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.location) {
      toast.error('Please fill in all required fields.');
      return;
    }
    mutation.mutate();
  };

  if (isLoading) return <LoadingSpinner fullPage />;
  if (error || !job) return <div className="p-8 text-center text-red-400">Failed to load job details.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Edit Job: {job.title}</h1>
        <p className="page-subtitle">Update the details of your job posting.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Job Title *"
              placeholder="e.g. Senior Software Engineer"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <Input
            label="Location *"
            placeholder="e.g. San Francisco, CA"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
          />

          <Input
            label="Salary Range"
            placeholder="e.g. $120k - $150k"
            value={form.salaryRange || ''}
            onChange={(e) => setForm({ ...form, salaryRange: e.target.value })}
          />

          <div>
            <label className="field-label">Work Mode *</label>
            <select className="input-field" value={form.remoteType} onChange={(e) => setForm({ ...form, remoteType: e.target.value as any })}>
              <option value="ONSITE">On-site</option>
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
            </select>
          </div>

          <div>
            <label className="field-label">Job Type *</label>
            <select className="input-field" value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value as any })}>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>

          <div>
            <label className="field-label">Experience Level *</label>
            <select className="input-field" value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value as any })}>
              <option value="ENTRY">Entry Level</option>
              <option value="JUNIOR">Junior</option>
              <option value="MID">Mid Level</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead / Principal</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <Input
              label="Skills Required"
              placeholder="e.g. React, Node.js, TypeScript (comma separated)"
              value={form.skillsRequired || ''}
              onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="field-label">Job Description *</label>
            <textarea
              className="input-field min-h-[150px] resize-y"
              placeholder="Describe the role..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="field-label">Requirements</label>
            <textarea
              className="input-field min-h-[150px] resize-y"
              placeholder="List the requirements..."
              value={form.requirements || ''}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
          <Button variant="ghost" onClick={() => navigate('/recruiter/jobs')} type="button">Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
