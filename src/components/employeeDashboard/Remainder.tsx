import { Check } from "lucide-react";

export default function Remainder() {
  return (
    <div
        className="rounded-3xl p-5 flex flex-col justify-between border border-blue-200/30 bg-black/30 shadow-md w-full min-w-[280px] max-w-[340px] mx-auto"
        style={{ minHeight: '300px', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)', transition: 'box-shadow 0.2s' }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-white">Reminder</span>
          <button
            className="text-xs font-medium text-blue-300 hover:underline focus:outline-none"
          >
            Manage
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-black/20 rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">9:30<span className="text-xs">AM</span></span>
                <span className="text-xs text-blue-300">Check: Test Result</span>
              </div>
              <div className="text-green-500 text-xs">
                • Low
              </div>
            </div>
          </div>

          <div className="bg-black/20 rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">10:00<span className="text-xs">AM</span></span>
                <span className="text-xs text-blue-300">Client Presentation</span>
              </div>
              <div className="text-green-500 text-xs">
                • Low
              </div>
            </div>
          </div>

          <div className="bg-black/20 rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">4:15<span className="text-xs">AM</span></span>
                <span className="text-xs text-blue-300">Add new Subtask to Doctor + Analysis</span>
              </div>
              <div className="text-green-500 text-xs">
                • Low
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
