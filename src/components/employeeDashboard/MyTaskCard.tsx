"use client"
import { FC } from "react"

interface MyTaskCardProps {
  total: number
  completed: number
  pending: number
  totalProjects: number
  inProgress: number
  // completed: number
  // pending: number
}

const MyTaskCard: FC<MyTaskCardProps> = ({
  total,
  completed,
  pending
}) => {
  // Calculate percentages for the chart
  const completedPercentage = Math.round((completed / total) * 100) || 0
  const pendingPercentage = Math.round((pending / total) * 100) || 0
  
  return (
    <div
      className="flex flex-col justify-between [border:var(--border-style)]
     [box-shadow:var(--shadow-combined)] [background:var(--container-bg)] backdrop-blur-[101.67px]   shadow-md w-full mx-auto"
      style={{
        minHeight: '240px',
        borderRadius: '20px',
        borderWidth: '1px',
        padding: '16px',
        opacity: 1,
       
        // background: '#0000004D',
        // backdropFilter: 'blur(101.67px)',
        // backgroundBlendMode: 'luminosity',
      }}
    >
    <div className="flex items-center justify-between mb-2 text-text-main">
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontStyle: 'normal',
          fontSize: '18.3px',
          lineHeight: '28.47px',
          letterSpacing: '0px',
          verticalAlign: 'middle',
         
        }}
      >
        Task Completed
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
      Total Tasks {total}
      </span>
    </div>
    <div className="flex items-center gap-2 justify-between space-evenly">
      <div className="flex flex-col gap-2 ml-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-fulltext-text-main " style={{ background: '#A855F7' }}></span>
          <span className="text-text-secondary"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: '14.23px',
              lineHeight: '20.33px',
              letterSpacing: '0px',
              verticalAlign: 'middle',
            
            }}
          >
            Completed <span style={{ fontWeight: 600 }} className="text-text-secondary">{completed}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full text-text-main" style={{ background: '#FBBF72' }}></span>
          <span className="text-text-secondary"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: '14.23px',
              lineHeight: '20.33px',
              letterSpacing: '0px',
              verticalAlign: 'middle',
           
            }}
          >
            Pending <span style={{ fontWeight: 600 }} className="text-text-secondary">{pending}</span>
          </span>
        </div>
      </div>
      <svg width="175" height="175" viewBox="0 0 36 36" className="mr-2">
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="white" strokeWidth="3.5" />
        {/* Completed */}
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#A855F7" strokeWidth="3.5" strokeDasharray={`${completedPercentage} ${100 - completedPercentage}`} strokeDashoffset="25" />
        {/* Pending */}
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#FBBF72" strokeWidth="3.5" strokeDasharray={`${pendingPercentage} ${100 - pendingPercentage}`} strokeDashoffset="75" />
      </svg>
    </div>
  </div>
);
}

export default MyTaskCard