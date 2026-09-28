import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HiUser, HiMail, HiPhone, HiLocationMarker, HiLink,
  HiPencil, HiSave, HiX, HiIdentification,
} from 'react-icons/hi';
import { FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import type { ApiResponse, Profile } from '../types';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const profileApi = {
  update: (data: Profile) =>
    api.put<ApiResponse<Profile>>('/profile/me', data).then(r => r.data.data),
  get: () =>
    api.get<ApiResponse<Profile>>('/profile/me').then(r => r.data.data),
};

const ProfileSettings: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState<Profile>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: '',
    location: '',
    bio: '',
    title: '',
    githubUrl: '',
    linkedinUrl: '',
    websiteUrl: '',
  });

  const set = (key: keyof Profile, val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const mutation = useMutation({
    mutationFn: () => profileApi.update(form),
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['seekerDashboard'] });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || 'Failed to update profile'),
  });

  const avatar = `${(user?.firstName || 'U').charAt(0).toUpperCase()}${(user?.lastName || '').charAt(0).toUpperCase()}`;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">Profile &amp; Settings</h1>
        <p className="page-subtitle">Manage your personal information and preferences.</p>
      </div>

      {/* Avatar + Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}
          >
            {avatar}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
            <p className="text-white/50 text-sm">{user?.email}</p>
            <span
              className="inline-flex mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/30"
            >
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? 'btn-secondary' : 'btn-primary'}
          >
            {isEditing ? (
              <><HiX className="w-4 h-4" /> Cancel</>
            ) : (
              <><HiPencil className="w-4 h-4" /> Edit Profile</>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-6 space-y-6"
      >
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <HiIdentification className="text-primary-400" /> Personal Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            icon={<HiUser className="w-4 h-4" />}
            value={form.firstName || ''}
            onChange={e => set('firstName', e.target.value)}
            disabled={!isEditing}
            placeholder="John"
          />
          <Input
            label="Last Name"
            icon={<HiUser className="w-4 h-4" />}
            value={form.lastName || ''}
            onChange={e => set('lastName', e.target.value)}
            disabled={!isEditing}
            placeholder="Doe"
          />
          <Input
            label="Professional Title"
            icon={<HiIdentification className="w-4 h-4" />}
            value={form.title || ''}
            onChange={e => set('title', e.target.value)}
            disabled={!isEditing}
            placeholder="Full Stack Developer"
          />
          <Input
            label="Phone"
            icon={<HiPhone className="w-4 h-4" />}
            value={form.phone || ''}
            onChange={e => set('phone', e.target.value)}
            disabled={!isEditing}
            placeholder="+91 98765 43210"
          />
          <div className="sm:col-span-2">
            <Input
              label="Location"
              icon={<HiLocationMarker className="w-4 h-4" />}
              value={form.location || ''}
              onChange={e => set('location', e.target.value)}
              disabled={!isEditing}
              placeholder="Bangalore, India"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="field-label">Bio / Summary</label>
          <textarea
            value={form.bio || ''}
            onChange={e => set('bio', e.target.value)}
            disabled={!isEditing}
            rows={4}
            placeholder="Write a short professional summary about yourself..."
            className="input-field resize-none"
          />
        </div>
      </motion.div>

      {/* Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="glass-card p-6 space-y-4"
      >
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <HiLink className="text-primary-400" /> Social Links
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="LinkedIn"
            icon={<FaLinkedin className="w-4 h-4 text-blue-400" />}
            value={form.linkedinUrl || ''}
            onChange={e => set('linkedinUrl', e.target.value)}
            disabled={!isEditing}
            placeholder="https://linkedin.com/in/username"
          />
          <Input
            label="GitHub"
            icon={<FaGithub className="w-4 h-4" />}
            value={form.githubUrl || ''}
            onChange={e => set('githubUrl', e.target.value)}
            disabled={!isEditing}
            placeholder="https://github.com/username"
          />
          <Input
            label="Portfolio / Website"
            icon={<FaGlobe className="w-4 h-4 text-cyan-400" />}
            value={form.websiteUrl || ''}
            onChange={e => set('websiteUrl', e.target.value)}
            disabled={!isEditing}
            placeholder="https://myportfolio.com"
          />
        </div>
      </motion.div>

      {/* Save Button */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <Button
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="btn-primary"
          >
            <HiSave className="w-4 h-4" />
            Save Changes
          </Button>
        </motion.div>
      )}

      {/* Account Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <HiMail className="text-primary-400" /> Account Information
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-sm text-white/50">Email Address</span>
            <span className="text-sm text-white font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-sm text-white/50">Account Role</span>
            <span className="text-sm text-white font-medium">{user?.role?.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-white/50">Verification Status</span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              Verified
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSettings;
