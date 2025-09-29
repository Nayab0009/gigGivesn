'use client'
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { 
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  FileText,
  Building2,
  User,
  X,
  Upload
} from 'lucide-react';
import { colors } from '@/colors';
import Image from 'next/image';

// Interface for task response from backend
interface TaskResponse {
  id: number;
  title: string;
  description: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  taskFor: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  taskOf: {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

const UpdateTaskStatus = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [comment, setComment] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  const taskId = searchParams.get('taskId');
  const projectId = searchParams.get('projectId');

  // Fetch task details
  const fetchTaskDetails = async () => {
    if (!taskId || !isAuthenticated || !user?.id) {
      setError('Invalid task ID or user not authenticated');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching task details for task ID:', taskId);
      
      // Direct API call to get task by ID
      const response = await axiosInstance.get(`/tasks/${taskId}`);

      console.log('Task API Response:', response.data);
      
      if (response.data) {
        setTask(response.data);
        setSelectedTask(response.data);
        setComment(response.data.status.toLowerCase()); // Initialize comment with current task status
        setNewStatus(response.data.status.toLowerCase()); // Initialize newStatus with current task status
      } else {
        setError('Task not found or you do not have access to it');
      }

    } catch (error: any) {
      console.error('Error fetching task details:', error);
      setError(
        error.response?.data?.message || 
        'Failed to load task details. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to close the modal and go back
  const closeUpdateStatusModal = () => {
    router.back();
  };
  
  // Helper function to fetch project tasks (mock implementation as it's not in the current file)
  const fetchProjectTasks = async (projectId: number) => {
    // This is a placeholder for the actual implementation
    // In a real implementation, this would fetch the updated tasks for the project
    console.log('Fetching tasks for project:', projectId);
    // You would typically make an API call here to refresh the task list
  };
  
  // Update task status
  const updateTaskStatus = async () => {
    if (!selectedTask || !newStatus.trim()) return;

    setUpdatingStatus(true);
    try {
      // PATCH API call to update task status
      const response = await axiosInstance.patch(`/tasks/${selectedTask.id}`, {
        status: newStatus,
      });
      console.log("Task status updated successfully:", response.data);

      closeUpdateStatusModal();
      // Refresh data to show updated status
      if (projectId) {
        await fetchProjectTasks(parseInt(projectId));
      }
    } catch (error: any) {
      console.error("Error updating task status:", error);
      setError(error.response?.data?.message || "Failed to update task status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return {
          color: `bg-red-900 text-white border-[${colors.accent.hex}]`,
          icon: <CheckCircle className="w-5 h-5" style={{ color: colors.accent.hex }} />
        };
      case 'inprogress':
      case 'in-progress':
      case 'active':
        return {
          color: `bg-[#15803D] text-white border-green-500`,
          icon: <Clock className="w-5 h-5" style={{ color: colors.primary.hex }} />
        };
      case 'pending':
        return {
          color: `bg-[${colors.warning.hex}22] text-white border-[${colors.warning.hex}]`,
          icon: <AlertCircle className="w-5 h-5" style={{ color: colors.warning.hex }} />
        };
      case 'blocked':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />
        };
      default:
        return {
          color: `bg-[${colors.secondary.hex}22] text-white border-[${colors.secondary.hex}]`,
          icon: <Clock className="w-5 h-5" style={{ color: colors.secondary.hex }} />
        };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated && user?.id && taskId) {
      fetchTaskDetails();
    }
  }, [isAuthenticated, user?.id, taskId]);

  // Handle clicks outside the main container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Clicked outside the main container, go back to previous page
        router.back();
      }
    };
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [router]);

  // Show authentication error if user is not logged in
  if (!isAuthenticated || !user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Authentication Required</h2>
            <p className="text-slate-600 text-lg">Please log in to submit task reports.</p>
          </div>
        </div>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-black/60  relative z-40 pt-32 backdrop-blur-lg -m-4 md:-m-6 -mt-52 py-23" style={{ marginTop: '-110px' }}>
      <div ref={containerRef} className="max-w-2xl mx-auto">
    

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-red-700 font-semibold text-lg">Error</p>
            </div>
            <p className="text-red-600 mb-4 ml-13">{error}</p>
            <button
              onClick={fetchTaskDetails}
              className="ml-13 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content Container */}
        <div className="">
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-6">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className="text-slate-600 text-xl font-medium">Loading task details...</p>
            </div>
          ) : !task ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Task Not Found</h3>
              <p className="text-slate-500 text-lg">The requested task could not be found or you don't have access to it.</p>
            </div>
          ) : (
            <div className=" pt-0 border rounded-3xl border-white/30 bg-black/80">
              {/* Task Information Card */}
              <div className="p-8">
                <div className="flex justify-between items-center">
                  <div>
                {/* <h3 className="text-[#D1D5DB] text-xl font-extralight  mb-4">Task Information</h3> */}
                  </div>
<div>
  {/* <div className={`inline-flex items-center gap-2 px-2 rounded-full text-sm font-extralight ${getStatusInfo(task.status).color} shadow-lg`}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </div> */}
</div>
                </div>
                
                <div className="space-y-4">
                  <div>
                      <h1 className="text-white text-3xl sm:text-4xl font-medium mb-4">
              Update Task Status
            </h1>
                    <h4 className="text-lg font-extralight mb-2 text-white">{task.title}</h4>
                    {/* <p className="text-[#D1D5DB] mb-3 font-extralight">{task.description}</p> */}
                    <p className="text-white mb-3 font-extralight">Update the status of this task.</p>
                  </div>
                  
                  {/* <div className="my-7">
                    <div className="inline text-sm text-white py-2 px-4 border border-white/30 rounded-full font-extralight">
                      Task ID: #{task.id}
                    </div>
                  </div> */}
                  
                  {/* <div className="text-sm font-extralight text-[#D1D5DB]">
                    Project: {task.taskOf.name}
                  </div> */}
                  <p className='text-[#D1D5DB] mb-3 font-extralight'>New Status</p>

                  {/* Status Dropdown */}
                  <select 
                    className="w-full px-4 py-3 font-extralight mb-6 text-[#D1D5DB] rounded-lg bg-black/80 border border-none focus:outline-none focus:ring-none focus:ring-white/40 cursor-pointer"
                    onChange={(e) => setNewStatus(e.target.value)}
                    value={newStatus || (task ? task.status.toLowerCase() : '')}
                  >
                    {/* Available statuses for tasks */}
                    {['inprogress', 'pending', 'completed'].map((status) => (
                      <option 
                        key={status} 
                        value={status} 
                        className="bg-black/90"
                      >
                        {status === 'inprogress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  
                </div>
                 <div className="flex space-x-4 pt-2">
                  <button
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 font-extralight transition-all duration-300 text-white border border-white/30 rounded-full"
                 >
                    Cancel
                  </button>
                  <button
                    onClick={updateTaskStatus}
                    disabled={!newStatus.trim() || updatingStatus}
                    className="flex-1 px-6 py-3 font-extralight transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-white border border-white/30 rounded-full"
                     style={{ background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`, color: '#fff' }}
                  >
                    {updatingStatus ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        Update Status
                      </>
                    )}
                  </button>
                </div>
              </div>

          
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateTaskStatus;