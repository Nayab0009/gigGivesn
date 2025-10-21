import React from "react";
import { useRouter } from "next/navigation";

interface CommunicationLog {
  id: string | number;
  name: string;
  avatar?: string;
  lastMessage: string;
  isActive?: boolean;
}

interface CommunicationLogsCardProps {
  commLogs: CommunicationLog[];
  commLoading: boolean;
  onSeeAll: () => void;
}

const CommunicationLogsCard: React.FC<CommunicationLogsCardProps> = ({ commLogs, commLoading, onSeeAll }) => {
  const router = useRouter();
  
  return (
   <div
      className="flex flex-col justify-between [border:var(--border-style)] [box-shadow:var(--shadow-combined)] [background:var(--container-bg)]  shadow-md w-full mx-auto"
      style={{
        minHeight: '240px',
        borderRadius: '20px',
        borderWidth: '1px',
        padding: '16px',
        opacity: 1,
        backdropFilter: 'blur(107.25px)',
        backgroundBlendMode: 'luminosity',

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
        Communication Logs
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
          color: '#93c5fd', // text-blue-300
        }}
      >
       <button
        className="text-xs font-medium text-[#0CA9F6] hover:underline focus:outline-none"
        onClick={onSeeAll}
      >
        See All
      </button>
      </span>

    </div>
    <div className="flex flex-col gap-4">
      {commLoading ? (
        <div className="flex flex-col items-center justify-center text-center py-8">
          <span className="text-blue-200">Loading communications...</span>
        </div>
      ) : commLogs.length === 0 ? (
        <div className="text-center text-blue-200 py-8">No communication logs found.</div>
      ) : (
        commLogs.map((log,index) => (
          <div
            key={log.id ?? index}
            className="flex items-center justify-between rounded-lg p-2 mb-2 [background:var(--container-bg)]  transition-shadow duration-200 hover:shadow-[0px_0px_10.7px_0px_#81818166] cursor-pointer"
            onClick={() => router.push(`/dashboard/manager/chat/${log.id}`)}
          >
            {/* Left side: avatar + text */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full flex items-center justify-center bg-blue-900 text-white font-bold text-lg">
                {log.avatar ? (
                  <img
                    src={log.avatar}
                    alt={log.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  log.name?.[0]?.toUpperCase() || "?"
                )}
                <span
                  className="absolute bottom-0 right-0 w-[13px] h-[13px] rounded-full border-1 border-[#FFFFFF] "
                  style={{
                    background: log.isActive ? '#32D583' : '#57B5E7',
                  }}
                  title={log.isActive ? 'Active' : 'Inactive'}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-text-main">{log.name}</span>
                <span
                  className="text-xs text-text-main truncate max-w-[120px]"
                  title={log.lastMessage}
                >
                  {log.lastMessage && log.lastMessage.length > 30
                    ? log.lastMessage.slice(0, 30) + "..."
                    : log.lastMessage}
                </span>
              </div>
            </div>

            {/* Right side: icons */}
            {/* <div className="flex justify-between">
              <button
                className="p-2 rounded-full text-white"
                onClick={onSeeAll}
              ><img src="/images/DIV-27.svg" alt="Call" className="w-[40px] h-[40px]" /></button>
              <button
                className="p-2 rounded-full  text-white"
                onClick={onSeeAll}
              ><img src="/images/DIV-28.svg" alt="Video" className="w-[40px] h-[40px]" /></button>
            </div> */}
          </div>

        ))
      )}
    </div>
  </div>
  );
};

export default CommunicationLogsCard;
