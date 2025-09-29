import { Suspense } from 'react';
import UpdateTaskStatus from '@/components/employeeDashboard/UpdateTaskStatus';

export default function UpdateTaskStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-6 animate-spin">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
          </div>
          <p className="text-slate-600 text-xl font-medium">Loading...</p>
        </div>
      </div>
    }>
      <UpdateTaskStatus />
    </Suspense>
  );
}