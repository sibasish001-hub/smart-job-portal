import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { HiSearch, HiOutlineUsers, HiOutlineBriefcase, HiOutlineShieldCheck } from 'react-icons/hi';
import api from '../../services/api';
import type { ApiResponse } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
}

const AdminUsers: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data: users, isLoading, error } = useQuery<AdminUser[]>({
    queryKey: ['adminUsers'],
    queryFn: () =>
      api.get<ApiResponse<AdminUser[]>>('/admin/users').then(r => r.data.data),
  });

  const filtered = users?.filter(u => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.firstName || '').toLowerCase().includes(q) ||
      (u.lastName || '').toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const roleIcon = (role: string) => {
    if (role === 'ADMIN') return <HiOutlineShieldCheck className="w-4 h-4 text-amber-400" />;
    if (role === 'RECRUITER') return <HiOutlineBriefcase className="w-4 h-4 text-cyan-400" />;
    return <HiOutlineUsers className="w-4 h-4 text-primary-400" />;
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
      RECRUITER: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
      JOB_SEEKER: 'bg-primary-500/15 text-primary-400 border-primary-500/25',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[role] || 'bg-white/10 text-white/60 border-white/10'}`}>
        {roleIcon(role)} {role.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <HiOutlineUsers className="text-primary-400" /> User Management
        </h1>
        <p className="page-subtitle">View and manage all registered platform users.</p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users by name, email, or role..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 outline-none focus:border-primary-500/60"
        />
      </div>

      {isLoading && (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" text="Loading users..." />
        </div>
      )}

      {error && (
        <div className="glass-card p-8 text-center text-red-400">
          Failed to load users. Make sure you have admin access.
        </div>
      )}

      {!isLoading && filtered && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-sm text-white/60">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}
                        >
                          {(u.firstName || u.email).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-white">
                          {u.firstName || ''} {u.lastName || ''}
                          {!u.firstName && !u.lastName && <span className="text-white/40">—</span>}
                        </span>
                      </div>
                    </td>
                    <td className="text-white/70">{u.email}</td>
                    <td>{roleBadge(u.role)}</td>
                    <td>
                      {u.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="text-white/50 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-white/40 text-sm">
                No users match your search.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
