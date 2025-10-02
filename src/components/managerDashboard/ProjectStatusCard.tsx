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
      className="flex flex-col justify-between border border-white/30 bg-black/30  backdrop-blur-[101.67px]   shadow-md w-full mx-auto"
      style={{
        minHeight: '240px',
        borderRadius: '20px',
        borderWidth: '1px',
        padding: '16px',
        opacity: 1,
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
        background: '#0000004D',
        backdropFilter: 'blur(101.67px)',
        backgroundBlendMode: 'luminosity',
      }}
    >
    <div className="flex items-center justify-between mb-2">
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontStyle: 'normal',
          fontSize: '18.3px',
          lineHeight: '28.47px',
          letterSpacing: '0px',
          verticalAlign: 'middle',
          color: '#fff',
        }}
      >
        Project Completed
      </span>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: '14.23px',
          lineHeight: '20.33px',
          letterSpacing: '0px',
          verticalAlign: 'middle',
          color: '#0CA9F6', // text-blue-300
        }}
      >
        Total projects {analytics.totalProjects}
      </span>
    </div>
    <div className="flex items-center gap-2 justify-between space-evenly">
      <div className="flex flex-col gap-2 ml-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: '#A855F7' }}></span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: '14.23px',
              lineHeight: '20.33px',
              letterSpacing: '0px',
              verticalAlign: 'middle',
              color: '#fff',
            }}
          >
            Project Done <span style={{ fontWeight: 600 }}>{analytics.completedProjects}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: '#FBBF72' }}></span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: '14.23px',
              lineHeight: '20.33px',
              letterSpacing: '0px',
              verticalAlign: 'middle',
              color: '#fff',
            }}
          >
            In Progress <span style={{ fontWeight: 600 }}>{analytics.activeProjects}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: '#57B5E7' }}></span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: '14.23px',
              lineHeight: '20.33px',
              letterSpacing: '0px',
              verticalAlign: 'middle',
              color: '#fff',
            }}
          >
            Backlog <span style={{ fontWeight: 600 }}>{analytics.totalProjects - analytics.completedProjects - analytics.activeProjects}</span>
          </span>
        </div>
      </div>
      <svg width="175" height="175" viewBox="0 0 36 36" className="mr-2">
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
