import React from "react";

interface CommunicationLog {
  id: string | number;
  name: string;
  avatar?: string;
  lastMessage: string;
}

interface CommunicationLogsCardProps {
  commLogs: CommunicationLog[];
  commLoading: boolean;
  onSeeAll: () => void;
}

const CommunicationLogsCard: React.FC<CommunicationLogsCardProps> = ({ commLogs, commLoading, onSeeAll }) => (
   <div
      className="flex flex-col justify-between border border-white/30 shadow-md w-full mx-auto"
      style={{
        minHeight: '240px',
        borderRadius: '20px',
        borderWidth: '1px',
        padding: '16px',
        opacity: 1,
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
        background: '#0000004D',
        backdropFilter: 'blur(107.25px)',
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
        className="text-xs font-medium text-blue-300 hover:underline focus:outline-none"
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
            className="flex items-center justify-between rounded-lg p-2 mb-2 bg-black/40 transition-shadow duration-200 hover:shadow-[0px_0px_10.7px_0px_#81818166]"
          >
            {/* Left side: avatar + text */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-900 text-white font-bold text-lg">
                {log.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{log.name}</span>
                <span
                  className="text-xs text-blue-300 truncate max-w-[120px]"
                  title={log.lastMessage}
                >
                  {log.lastMessage && log.lastMessage.length > 10
                    ? log.lastMessage.slice(0, 10) + "..."
                    : log.lastMessage}
                </span>
              </div>
            </div>

            {/* Right side: icons */}
            <div className="flex gap-2">
              <button className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white">📞</button>
              <button className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white">🎥</button>
            </div>
          </div>

        ))
      )}
    </div>
  </div>
);

export default CommunicationLogsCard;
