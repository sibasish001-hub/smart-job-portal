import React from 'react';
import type { JobSearchFilter } from '../../types';

interface JobFiltersProps {
  filters: JobSearchFilter;
  onChange: (filters: JobSearchFilter) => void;
}

const SELECT_CLASSES = 'w-full px-3 py-2.5 rounded-xl text-sm text-white/80 outline-none transition-all duration-200 bg-white/5 border border-white/10 focus:border-primary-500/60 focus:bg-white/8 cursor-pointer appearance-none';

const JobFilters: React.FC<JobFiltersProps> = ({ filters, onChange }) => {
  const set = (key: keyof JobSearchFilter, value: string) =>
    onChange({ ...filters, [key]: value || undefined, page: 0 });

  const reset = () => onChange({ page: 0, size: 10 });

  return (
    <div className="glass-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Filters</h3>
        <button onClick={reset} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
          Clear all
        </button>
      </div>

      {/* Remote Type */}
      <div>
        <label className="field-label">Work Mode</label>
        <select
          className={SELECT_CLASSES}
          value={filters.remoteType || ''}
          onChange={(e) => set('remoteType', e.target.value)}
        >
          <option value="">All Modes</option>
          <option value="REMOTE">Remote</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ONSITE">On-site</option>
        </select>
      </div>

      {/* Job Type */}
      <div>
        <label className="field-label">Job Type</label>
        <select
          className={SELECT_CLASSES}
          value={filters.jobType || ''}
          onChange={(e) => set('jobType', e.target.value)}
        >
          <option value="">All Types</option>
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="CONTRACT">Contract</option>
          <option value="INTERNSHIP">Internship</option>
        </select>
      </div>

      {/* Experience Level */}
      <div>
        <label className="field-label">Experience Level</label>
        <select
          className={SELECT_CLASSES}
          value={filters.experienceLevel || ''}
          onChange={(e) => set('experienceLevel', e.target.value)}
        >
          <option value="">All Levels</option>
          <option value="ENTRY">Entry Level</option>
          <option value="JUNIOR">Junior</option>
          <option value="MID">Mid Level</option>
          <option value="SENIOR">Senior</option>
          <option value="LEAD">Lead / Principal</option>
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="field-label">Location</label>
        <input
          type="text"
          placeholder="e.g. New York, London"
          className="input-field text-sm"
          value={filters.location || ''}
          onChange={(e) => set('location', e.target.value)}
        />
      </div>

      {/* Skills */}
      <div>
        <label className="field-label">Skills</label>
        <input
          type="text"
          placeholder="e.g. React, Java, Python"
          className="input-field text-sm"
          value={filters.skillsRequired || ''}
          onChange={(e) => set('skillsRequired', e.target.value)}
        />
      </div>

      {/* Sort */}
      <div>
        <label className="field-label">Sort By</label>
        <select
          className={SELECT_CLASSES}
          value={`${filters.sortBy || 'createdAt'}_${filters.sortDir || 'desc'}`}
          onChange={(e) => {
            const [sortBy, sortDir] = e.target.value.split('_');
            onChange({ ...filters, sortBy, sortDir, page: 0 });
          }}
        >
          <option value="createdAt_desc">Newest First</option>
          <option value="createdAt_asc">Oldest First</option>
          <option value="title_asc">Title A–Z</option>
          <option value="title_desc">Title Z–A</option>
        </select>
      </div>
    </div>
  );
};

export default JobFilters;
