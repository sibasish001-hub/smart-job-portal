import React from 'react';
import Badge, { statusVariant } from '../ui/Badge';
import type { ApplicationResponse } from '../../types';

interface ApplicationPipelineProps {
  applications: ApplicationResponse[];
}

const STATUSES = ['APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFERED', 'REJECTED'] as const;

const ApplicationPipeline: React.FC<ApplicationPipelineProps> = ({ applications }) => {
  const grouped = STATUSES.reduce((acc, status) => {
    acc[status] = applications.filter((a) => a.status === status).length;
    return acc;
  }, {} as Record<string, number>);

  const total = applications.length || 1;

  return (
    <div className="space-y-3">
      {STATUSES.map((status) => {
        const count = grouped[status] || 0;
        const pct = Math.round((count / total) * 100);
        return (
          <div key={status}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant(status)} dot>{status}</Badge>
              </div>
              <span className="text-sm font-semibold text-white">{count}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: status === 'OFFERED'
                    ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                    : status === 'REJECTED'
                    ? 'linear-gradient(90deg,#ef4444,#dc2626)'
                    : 'linear-gradient(90deg,#6366f1,#06b6d4)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApplicationPipeline;
