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

const SubmitTaskReport = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState('');
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

  // Submit report
  const submitReport = async () => {
    if (!task || !comment.trim()) {
      setError('Please enter a comment');
      return;
    }

    if (!taskId || !user?.id) {
      setError('Invalid task ID or user not authenticated');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // PATCH API call to update task with report
      const response = await axiosInstance.patch(`/tasks/${task.id}`, {
        comment: comment,
        userId: user.id // Add user ID for authorization check
      });

      console.log('Report submitted successfully:', response.data);
      
      // Navigate back to the previous page
      router.back();
      
    } catch (error: any) {
      console.error('Error submitting report:', error);
      setError(
        error.response?.data?.message || 
        'Failed to submit report. Please try again.'
      );
    } finally {
      setSubmitting(false);
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

    <div className="min-h-screen bg-black/30  relative z-40 pt-32 backdrop-blur-lg -m-4 md:-m-6 -mt-52 py-23" style={{ marginTop: '-150px' }}>
      <div ref={containerRef} className="max-w-2xl mx-auto bg-black/30 border border-white/30 rounded-2xl ">
        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-4 mb-6">
            {/* <button
              onClick={() => router.push(`/dashboard/teammember/mytasks?projectId=${projectId}`)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105"
              style={{ background: '#fff', color: colors.primary.hex, border: `1px solid ${colors.primary.hex}` }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: colors.primary.hex }} />
              Back to Tasks
            </button> */}
          </div>
          
          <div className="text-center">
            <h1 className="text-white text-3xl sm:text-4xl font-medium mb-4">
              Submit Task Report
            </h1>
            <p className="text-white text-lg max-w-xl mx-auto">
              Add a comment about your task progress
            </p>
          </div>
        </div>

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
            <div className="p-8 pt-0">
              {/* Task Information Card */}
              <div className="mb-8 rounded-2xl border-1 p-6 border-white/30 bg-black/30 shadow-lg">
                <div className="flex justify-between items-center">
                  <div>
                <h3 className="text-[#D1D5DB] text-xl font-extralight  mb-4">Task Information</h3>
                  </div>
<div>
  <div className={`inline-flex items-center gap-2 px-2 rounded-full text-sm font-extralight ${getStatusInfo(task.status).color} shadow-lg`}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </div>
</div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-extralight mb-2 text-[#D1D5DB]">{task.title}</h4>
                    <p className="text-[#D1D5DB] mb-3 font-extralight">{task.description}</p>
                  </div>
                  
                  <div className="my-7">
                    <div className="inline text-sm text-white py-2 px-4 border border-white/30 rounded-full font-extralight">
                      Task ID: #{task.id}
                    </div>
                  </div>
                  
                  <div className="text-sm font-extralight text-[#D1D5DB]">
                    Project: {task.taskOf.name}
                  </div>
                </div>
              </div>

              {/* Comment Form */}
              <div className="space-y-6 border-1 border-white/30 rounded-2xl p-6">
                <h3 className="text-xl text-[#D1D5DB] mb-4 font-extralight">Add Comment</h3>
                
                <div>
                  <label className="block text-sm text-[#D1D5DB] mb-2 font-extralight">
                    Comment
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter your comment ..."
                    className="w-full px-4 py-3 border-none rounded-2xl text-white bg-black/30 font-extralight"
                    rows={6}
                  />
                </div>
{/* Upload File */}
 <button className="px-9 py-3 font-extralight transition-all duration-300 text-[#D1D5DB] rounded-2xl border-1 border-dashed boder-white/30"
                  >
                   <Upload className="inline w-5 h-5 mr-3"/>
                    Upload File
                  </button>
                {/* Action Buttons */}
                <div className="flex space-x-4 pt-2">
                  <button
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 font-extralight transition-all duration-300 text-white rounded-full"
                  style={{ background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`, color: '#fff' }}>
                    In Progress
                  </button>
                  <button
                    onClick={submitReport}
                    disabled={!comment.trim() || submitting}
                    className="flex-1 px-6 py-3 font-extralight transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-white border border-white/30 rounded-full"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Report
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

export default SubmitTaskReport;