"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Plus, Circle, Pencil, Trash } from 'lucide-react';
import { AssignTaskModal } from '../../adminDashboard/AssignProjectTicket';
import type { Sprint, Task } from '@/types';
import { colors } from "@/colors";
import axiosInstance from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { EditTaskModal } from '@/components/adminDashboard/EditTaskModal';
import EditSprintModal from '@/components/managerDashboard/EditSprintModal';
import classnames from 'classnames';
import classNames from 'classnames';
import { deleteSprint } from '@/lib/SprintService';



type SprintsTabProps = {
  projectId: number;
  projectName: string;
  handleAddSprint: () => void;
};

const SprintsTab: React.FC<SprintsTabProps> = ({ projectId, projectName }) => {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);
  const [selectedSprintName, setSelectedSprintName] = useState<string>('');
  const [isEditSprintModalOpen, setIsEditSprintModalOpen] = useState(false);
  const [isDeleteSprintModalOpen, setIsDeleteSprintModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Task state for the modal


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

  // Fetch sprints for the specific project
  useEffect(() => {


    fetchSprints();
  }, [projectId]);

  // Handle sprint card click - navigate to sprint tasks page
  const handleSprintClick = (sprint: Sprint) => {
    const sprintName = encodeURIComponent(sprint.name);
    const projName = encodeURIComponent(projectName);
    router.push(
      `/dashboard/manager/showSprinttasks/${sprint.id}?name=${sprintName}&projectId=${projectId}&projectName=${projName}`
    );
  };



  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSprintId(null);
    setSelectedSprintName('');

    // const url = new URL(window.location.href);
    // url.searchParams.set('tab', 'sprints');
    // router.replace(url.pathname + url.search, { scroll: false });
  };

  const handleEditSprint = (e: React.MouseEvent<HTMLButtonElement>, sprint: Sprint) => {
    e.stopPropagation();
    e.preventDefault();
    setIsModalOpen(true);
    setSelectedSprintId(sprint.id);
    // setSelectedSprintName(sprint.name);
    setIsEditSprintModalOpen(true);
  };

  // Handle task creation success
  const handleDeleteSprint = (e: React.MouseEvent<HTMLButtonElement>, sprint: Sprint) => {
    e.stopPropagation();
    e.preventDefault();
    const shouldDelete = window.confirm("Are you sure you want to delete this sprint?")
    if (!shouldDelete) return;
    setIsDeleting(true);
    deleteSprint(sprint.id.toString()).then(() => {
      fetchSprints();
      setIsDeleting(false);
    });
    // setSelectedSprintId(sprint.id);
    // // setSelectedSprintName(sprint.name);
    // setIsDeleteSprintModalOpen(true);
  };


  if (loading) {
    return (
      <div
        className={classNames("p-12 text-center border border-white/10 rounded-2xl max-w-xl w-full mx-auto", { "overflow-hidden": isModalOpen })}
        style={{ background: "#0000004D" }
        }
      >
        <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
          <Clock className="w-6 h-6 text-emerald-600 animate-spin" />
        </div>
        <p className="text-text-secondary">Loading sprints...</p>
      </div >
    );
  }
  if (isDeleting) {
    return (
      <div
        className={classNames("p-12 text-center border border-white/10 rounded-2xl max-w-xl w-full mx-auto", { "overflow-hidden": isModalOpen })}
        style={{ background: "#0000004D" }
        }
      >
        <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
          <Clock className="w-6 h-6 text-emerald-600 animate-spin" />
        </div>
        <p className="text-white/80">Deleting sprint...</p>
      </div >
    );
  }

  if (error) {
    return (
      <div
        className="p-6 border border-red-200/40 rounded-2xl text-white max-w-xl w-full mx-auto"
        style={{ background: "#0000004D" }}
      >
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
      {/* Header */}
      <div className="flex items-center justify-end">


      </div>

      {/* Sprints Grid */}
      {sprints.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 text-white py-12">
          <Calendar className="w-16 h-16 text-white/20" />
          <div className="text-center">
            <p className="text-lg font-medium mb-2">No sprints found</p>
            <p className="text-text-main">
              Create your first sprint to get started with project management.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ">
          {sprints.map((sprint) => (
            <div
              key={sprint.id}
              className="rounded-2xl  [background:var(--container-bg)]  [border:var(--border-style)]
   [box-shadow:var(--shadow-combined)] backdrop-blur-md border flex flex-col w-full justify-between h-full  p-6 transition cursor-pointer transform  group"
            >

              <div className="flex flex-col w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-0">
                  <h2 className="text-lg font-bold text-text-main">{sprint.title || "-"}</h2>
                </div>

                {/* Description */}
                <p className="text-sm text-text-main mb-5 line-clamp-2 ">
                  {sprint.name || "No description provided"}

                </p>

                {/* Details */}
                <div className="space-y-2 text-sm text-text-main mb-5">
                  <div className="flex justify-between">
                    <span className="font-medium ">Timeline</span>
                    <span className="text-text-main">
                      {sprint.startDate &&
                        new Date(sprint.startDate).toLocaleDateString()}{" "}
                      -{" "}
                      {sprint.endDate &&
                        new Date(sprint.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium ">Progress</span>
                    <span className="text-text-main">
                      {Math.round(sprint.progress || 0)}%
                    </span>
                  </div>
                </div>
              </div>


              {/* Progress bar */}
              <div className="flex flex-col gap-5">

                <div className="w-full bg-black/30 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${sprint.progress}%`,
                      backgroundColor: colors.primary.hex,
                    }}
                  ></div>
                </div>
                <div className="flex justify-end w-full gap-2">
                  <button onClick={(e) => handleEditSprint(e, sprint)} className="flex items-center text-white bg-black/30 rounded-lg h-8 w-8  border border-white/30 justify-center">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => handleDeleteSprint(e, sprint)} className="flex items-center text-white bg-black/30 rounded-lg h-8 w-8  border border-white/30 justify-center">
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Footer (actions) */}
                <div>
                  <button
                    onClick={() => handleSprintClick(sprint)}
                    className="flex min-h-9 items-center justify-center w-full gap-2 py-3 rounded-full hover:opacity-80 transition text-xs font-medium bg-[var(--btn-bg)] text-white "
                    title="View all tasks in this sprint"
                  >
                    <span>View</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
      {isModalOpen && (
        <EditSprintModal
          open={isModalOpen}
          onClose={handleModalClose}
          onUpdate={() => {
            setIsModalOpen(false);
            fetchSprints()
          }}
          sprint={sprints.find(sprint => sprint.id === selectedSprintId) as Sprint}
          projectId={projectId}
        />
      )}

      {/* Assign Task Modal */}

    </div>
  );
};

export default SprintsTab;
