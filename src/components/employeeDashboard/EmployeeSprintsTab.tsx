"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Users, CheckCircle, Circle, Eye } from 'lucide-react';
import type { Task } from '@/types';
import { colors } from "@/colors";
import axiosInstance from '@/lib/axios';

type Sprint = {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status?: string;
};

type SprintsTabProps = {
  projectId: number;
  projectName: string;
};

const EmployeeSprintsTab: React.FC<SprintsTabProps> = ({ projectId, projectName }) => {
  const router = useRouter();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSprints = async () => {
      if (!projectId) return;
      setLoading(true);
      setError(null);
      try {
        const { data } = await axiosInstance.get(`/sprint/project/${projectId}`);
        setSprints(data);
      } catch (err) {
        setError('Failed to load sprints.');
        setSprints([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSprints();
  }, [projectId]);

  const handleSprintClick = (sprint: Sprint) => {
    const sprintName = encodeURIComponent(sprint.name);
    router.push(`/dashboard/teammember/showSprinttasks/${sprint.id}?name=${sprintName}&scope=employee`);
  };

  if (loading) {
    return (
      <div className="p-12 text-center border border-white/10 rounded-2xl max-w-xl w-full mx-auto" style={{ background: "#0000004D" }}>
        <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
          <Clock className="w-6 h-6 text-emerald-600 animate-spin" />
        </div>
        <p className="text-white/80">Loading sprints...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200/40 rounded-2xl text-white max-w-xl w-full mx-auto" style={{ background: "#0000004D" }}>
        <div className="flex items-center gap-2 mb-1">
          <Circle className="w-5 h-5 text-red-300" />
          <div className="font-semibold">Error loading sprints</div>
        </div>
        <div className="text-white/80 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{projectName} Sprints</h2>
          <p className="text-white/70 mt-1">Browse sprints in this project</p>
        </div>
      </div>

      {sprints.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 text-white py-12">
          <Calendar className="w-16 h-16 text-white/20" />
          <div className="text-center">
            <p className="text-lg font-medium mb-2">No sprints found</p>
            <p className="text-white/70">No sprints are available for this project yet.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sprints.map((sprint) => (
            <div
              key={sprint.id}
              className="rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg p-6 hover:shadow-2xl transition cursor-pointer transform hover:scale-105 group"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">{sprint.name}</h2>
                <span
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ backgroundColor: `${colors.primary.rgb.replace(", 1)", ", 0.2)")}`, color: colors.primary.hex }}
                >
                  Active
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-4 line-clamp-2">{sprint.description || "No description provided"}</p>
              <div className="space-y-2 text-sm text-gray-300 mb-4">
                <div className="flex justify-between">
                  <span className="font-medium text-white">Timeline:</span>
                  <span>
                    {sprint.startDate && new Date(sprint.startDate).toLocaleDateString()} - {sprint.endDate && new Date(sprint.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2 cursor-pointer" onClick={() => handleSprintClick(sprint)} title="View sprint tasks">
                  <img src="https://i.pravatar.cc/40?img=1" alt="user" className="w-8 h-8 rounded-full border-2 border-black" />
                  <img src="https://i.pravatar.cc/40?img=2" alt="user" className="w-8 h-8 rounded-full border-2 border-black" />
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-600 text-white text-xs border-2 border-black">+5</div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSprintClick(sprint)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-80 transition text-sm font-medium"
                    style={{ backgroundColor: `${colors.secondary.rgb?.replace(", 1)", ", 0.2)") || `${colors.primary.rgb.replace(", 1)", ", 0.15)")}`}`, color: colors.secondary.hex || colors.primary.hex }}
                    title="View all tasks in this sprint"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Show Tasks</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeSprintsTab;
