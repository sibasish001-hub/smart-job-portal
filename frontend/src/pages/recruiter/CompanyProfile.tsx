import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { HiOfficeBuilding } from 'react-icons/hi';
import { companiesApi } from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { CompanyRequest, CompanyResponse } from '../../types';

const CompanyProfile: React.FC = () => {
  const queryClient = useQueryClient();
  
  const { data: companies, isLoading, error } = useQuery({
    queryKey: ['myCompanies'],
    queryFn: companiesApi.myCompanies,
  });

  // A recruiter generally has one company in this portal design
  const company = companies?.[0];

  const [form, setForm] = useState<CompanyRequest>({
    name: '',
    description: '',
    industry: '',
    website: '',
    logoUrl: '',
  });

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name,
        description: company.description || '',
        industry: company.industry || '',
        website: company.website || '',
        logoUrl: company.logoUrl || '',
      });
    }
  }, [company]);

  const createMutation = useMutation({
    mutationFn: (data: CompanyRequest) => companiesApi.create(data),
    onSuccess: () => {
      toast.success('Company profile created!');
      queryClient.invalidateQueries({ queryKey: ['myCompanies'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create company'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: CompanyRequest) => companiesApi.update(company!.id, data),
    onSuccess: () => {
      toast.success('Company profile updated!');
      queryClient.invalidateQueries({ queryKey: ['myCompanies'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update company'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error('Company Name is required');
      return;
    }
    
    if (company) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  if (isLoading) return <div className="py-20"><LoadingSpinner fullPage /></div>;
  if (error && !company) return <div className="p-8 text-center text-red-400">Failed to load company data.</div>;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Company Profile</h1>
        <p className="page-subtitle">Manage your company details to attract top talent.</p>
      </div>

      <div className="glass-card p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/30 to-cyan-500/30 flex items-center justify-center border border-white/10 flex-shrink-0 overflow-hidden">
            {form.logoUrl ? (
              <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <HiOfficeBuilding className="w-10 h-10 text-white/50" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{form.name || 'Your Company Name'}</h2>
            <p className="text-white/50 text-sm mt-1">This information will be displayed on all your job postings.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Company Name *"
                placeholder="e.g. Acme Corp"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <Input
              label="Industry"
              placeholder="e.g. Technology, Healthcare, Finance"
              value={form.industry || ''}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
            />

            <Input
              label="Website URL"
              type="url"
              placeholder="https://example.com"
              value={form.website || ''}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />

            <div className="md:col-span-2">
              <Input
                label="Logo Image URL"
                type="url"
                placeholder="https://example.com/logo.png"
                value={form.logoUrl || ''}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                hint="Provide a direct link to an image file (PNG, JPG)."
              />
            </div>

            <div className="md:col-span-2">
              <label className="field-label">Company Description</label>
              <textarea
                className="input-field min-h-[120px] resize-y"
                placeholder="Tell candidates what your company does and why it's a great place to work..."
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <Button type="submit" isLoading={isPending}>
              {company ? 'Update Profile' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
