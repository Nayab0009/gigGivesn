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
  X
} from 'lucide-react';

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
      
      const response = await axiosInstance.post('/tasks/user/all', {
        userId: user.id,
        projectId: parseInt(projectId || '0')
      });

      console.log('Tasks API Response:', response.data);
      
      const tasksData = Array.isArray(response.data) ? response.data : [];
      const foundTask = tasksData.find((t: TaskResponse) => t.id === parseInt(taskId));
      
      if (foundTask) {
        setTask(foundTask);
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

    setSubmitting(true);
    setError(null);

    try {
      // PATCH API call to update task with report
      // Based on your swagger test, only send the comment in the body
      const response = await axiosInstance.patch(`/tasks/${task.id}`, {
        comment: comment
      });

      console.log('Report submitted successfully:', response.data);
      
      // Navigate back to tasks page
      router.push('/dashboard/teammember');
      
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
          color: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200',
          icon: <CheckCircle className="w-5 h-5" />
        };
      case 'inprogress':
      case 'in-progress':
      case 'active':
        return {
          color: 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 border-teal-200',
          icon: <Clock className="w-5 h-5" />
        };
      case 'pending':
        return {
          color: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200',
          icon: <AlertCircle className="w-5 h-5" />
        };
      case 'blocked':
        return {
          color: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200',
          icon: <AlertTriangle className="w-5 h-5" />
        };
      default:
        return {
          color: 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200',
          icon: <Clock className="w-5 h-5" />
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

  // Show authentication error if user is not logged in
  if (!isAuthenticated || !user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6 lg:p-8">
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/dashboard/teammember')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-slate-700 rounded-2xl font-semibold transition-all duration-300 hover:bg-white hover:shadow-lg transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Tasks
            </button>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent mb-4">
              Submit Task Report
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full mb-6"></div>
            <p className="text-slate-600 text-lg max-w-xl mx-auto">
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
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
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
            <div className="p-8">
              {/* Task Information Card */}
              <div className="mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Task Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">{task.title}</h4>
                    <p className="text-slate-600 mb-3">{task.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusInfo(task.status).color} shadow-lg`}>
                      {getStatusInfo(task.status).icon}
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </div>
                    <div className="text-sm text-slate-600">
                      Task ID: #{task.id}
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-600">
                    Project: {task.taskOf.name}
                  </div>
                </div>
              </div>

              {/* Comment Form */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Add Comment</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Comment *
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter your comment about the task progress..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    rows={6}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <button
                    onClick={() => router.push('/dashboard/teammember')}
                    className="flex-1 px-6 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReport}
                    disabled={!comment.trim() || submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
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