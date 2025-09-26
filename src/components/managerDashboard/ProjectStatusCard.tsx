import React from "react";

interface ProjectStatusCardProps {
  analytics: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
  };
}

const ProjectStatusCard: React.FC<ProjectStatusCardProps> = ({ analytics }) => (

    <div
      className="rounded-3xl p-5 flex flex-col justify-between border border-white/30 bg-black/30 shadow-md w-full min-w-[280px] max-w-[362px] mx-auto"
      style={{ height: '248px', minHeight: '248px', maxHeight: '248px', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)' }}
    >
    <div className="flex items-center justify-between mb-2">
      <span className="text-lg font-semibold text-white">Project Completed</span>
      <span className="text-xs font-medium text-blue-300">
        Total projects {analytics.totalProjects}
      </span>
    </div>
    <div className="flex items-center gap-2 justify-between">
      <div className="flex flex-col gap-2 ml-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: '#A855F7' }}></span>
          <span className="text-xs text-white">Project Done <span className="font-bold">{analytics.completedProjects}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: '#FBBF72' }}></span>
          <span className="text-xs text-white">In Progress <span className="font-bold">{analytics.activeProjects}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: '#57B5E7' }}></span>
          <span className="text-xs text-white">Backlog <span className="font-bold">{analytics.totalProjects - analytics.completedProjects - analytics.activeProjects}</span></span>
        </div>
      </div>
      <svg width="180" height="180" viewBox="0 0 36 36" className="mr-2">
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="white" strokeWidth="3.5" />
        {/* Completed */}
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#A855F7" strokeWidth="3.5" strokeDasharray={`${analytics.completedProjects / (analytics.totalProjects || 1) * 100},100`} strokeDashoffset="25" />
        {/* Active */}
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#FBBF72" strokeWidth="3.5" strokeDasharray={`${analytics.activeProjects / (analytics.totalProjects || 1) * 100},100`} strokeDashoffset="75" />
        {/* Backlog */}
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#57B5E7" strokeWidth="3.5" strokeDasharray={`${(analytics.totalProjects - analytics.completedProjects - analytics.activeProjects) / (analytics.totalProjects || 1) * 100},100`} strokeDashoffset="100" />
      </svg>
    </div>
  </div>
);

export default ProjectStatusCard;
