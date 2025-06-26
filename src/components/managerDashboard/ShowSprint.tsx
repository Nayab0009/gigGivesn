'use client';
import React, { useEffect, useState } from 'react';
import { getSprintsForManagers } from '@/lib/SprintService';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Clock, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ManagerSprintsCards: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [sprints, setSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      getSprintsForManagers(String(user.id))
        .then((data) => setSprints(data))
        .catch((err) => {
          console.error('Error fetching sprints:', err);
          setError('Failed to load sprints.');
        })
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  if (loading) return <p>Loading sprints...</p>;
  if (error) return <p>{error}</p>;
  if (sprints.length === 0)
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <p>No sprints found.</p>
        <button
          onClick={() => router.push('/dashboard/manager/addsprints')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition"
        >
          <Plus className="w-4 h-4" />
          Add Sprint
        </button>
      </div>
    );

  return (
    <div>
      {/* Top right "Add Sprint" button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => router.push('/dashboard/manager/addsprints')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Sprint
        </button>
      </div>

      {/* Sprints Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sprints.map((sprint) => (
          <div
            key={sprint.id}
            className="bg-white border border-emerald-200 rounded-2xl shadow-sm p-6 hover:shadow-xl transition"
                  >
            
            <h2 className="text-xl font-bold text-emerald-700 mb-2">
              {sprint.name}
            </h2>
            <p className="text-gray-600 mb-4 line-clamp-3">
              {sprint.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-emerald-500" />
                {new Date(sprint.startDate).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-emerald-500" />
                {new Date(sprint.endDate).toLocaleDateString()}
              </span>
            </div>
            {sprint.project && (
              <div className="mt-2 text-[20px] font-bold text-emerald-600 bg-emerald-100 inline-block px-2 py-1 rounded-full">
                Project: {sprint.project.name}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerSprintsCards;
