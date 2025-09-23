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
    className="rounded-3xl p-5 flex flex-col justify-between border border-white/20 bg-black/30 shadow-md w-full min-w-[280px] max-w-[362px] mx-auto"
    style={{ minHeight: '300px', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)', transition: 'box-shadow 0.2s' }}
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-lg font-semibold text-white">Communication Logs</span>
      <button
        className="text-xs font-medium text-blue-300 hover:underline focus:outline-none"
        onClick={onSeeAll}
      >
        See All
      </button>
    </div>
    <div className="flex flex-col gap-4">
      {commLoading ? (
        <div className="flex flex-col items-center justify-center text-center py-8">
          <span className="text-blue-200">Loading communications...</span>
        </div>
      ) : commLogs.length === 0 ? (
        <div className="text-center text-blue-200 py-8">No communication logs found.</div>
      ) : (
        commLogs.map((log, idx) => (
          <div key={log.id || idx} className="flex items-center justify-between bg-black/20 rounded-2xl px-3 py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-900 text-white font-bold text-lg">
                {log.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{log.name}</span>
                <span className="text-xs text-blue-300 truncate max-w-[120px]" title={log.lastMessage}>
                  {log.lastMessage && log.lastMessage.length > 10
                    ? log.lastMessage.slice(0, 10) + '...'
                    : log.lastMessage}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
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
