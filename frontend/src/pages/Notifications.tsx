import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { HiBell, HiCheck, HiCheckCircle, HiInformationCircle, HiExclamation } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { notificationsApi } from '../services/api';
import type { NotificationDto } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const iconFor = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('interview')) return <HiInformationCircle className="w-5 h-5 text-cyan-400" />;
  if (t.includes('reject') || t.includes('declined')) return <HiExclamation className="w-5 h-5 text-red-400" />;
  if (t.includes('offer') || t.includes('accept') || t.includes('success')) return <HiCheckCircle className="w-5 h-5 text-green-400" />;
  return <HiBell className="w-5 h-5 text-primary-400" />;
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const Notifications: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery<NotificationDto[]>({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
    refetchInterval: 30000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <HiBell className="text-primary-400" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="page-subtitle">Stay updated on your applications and interviews.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-1.5"
          >
            <HiCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {isLoading && (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" text="Loading notifications..." />
        </div>
      )}

      {!isLoading && (!notifications || notifications.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <HiBell className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">All caught up!</h3>
          <p className="text-white/50 text-sm">No notifications yet. We'll let you know when something happens.</p>
        </motion.div>
      )}

      {!isLoading && notifications && notifications.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => !n.isRead && markRead.mutate(n.id)}
                className={`
                  flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer
                  ${!n.isRead
                    ? 'bg-primary-500/5 border-primary-500/20 hover:bg-primary-500/10'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/5 opacity-60'
                  }
                `}
              >
                {/* Icon */}
                <div className={`
                  p-2 rounded-xl flex-shrink-0 mt-0.5
                  ${!n.isRead ? 'bg-primary-500/15' : 'bg-white/5'}
                `}>
                  {iconFor(n.title)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-semibold ${!n.isRead ? 'text-white' : 'text-white/70'}`}>
                      {n.title}
                    </h4>
                    <span className="text-xs text-white/40 flex-shrink-0">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="text-sm text-white/60 mt-0.5 leading-relaxed">{n.message}</p>
                </div>

                {/* Unread dot */}
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0 mt-1.5" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Notifications;
