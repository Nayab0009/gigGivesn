import { X, Check, Clock, Users, AlertTriangle } from "lucide-react";
import type { Project, Task, User } from "../types";

interface AssignTaskModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: () => void;
  task: Task;
  setTask: (task: Task) => void;
  teamMembers: User[];
  toggleAssignment: (userId: string) => void;
  getUserStatusIcon: (status: string) => JSX.Element;
}

export function AssignTaskModal({
  open,
  onClose,
  onAdd,
  task,
  setTask,
  teamMembers,
  toggleAssignment,
  getUserStatusIcon,
}: AssignTaskModalProps) {
  if (!open) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
              <p className="text-sm text-gray-600">Add a task and assign team members</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-white/60 transition-all duration-200 group"
          >
            <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
          </button>
        </div>

        {/* Scrollable Content with Hidden Scrollbar */}
        <div className="overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div className="p-6 space-y-6">
            {/* Task Title */}
            <div className="group">
              <label htmlFor="task-title" className="block text-sm font-semibold text-gray-800 mb-2">
                Task Title*
              </label>
              <input
                id="task-title"
                type="text"
                value={task.title}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                placeholder="Enter a descriptive task title..."
              />
            </div>

            {/* Task Description */}
            <div className="group">
              <label htmlFor="task-description" className="block text-sm font-semibold text-gray-800 mb-2">
                Description
              </label>
              <textarea
                id="task-description"
                value={task.description}
                onChange={(e) => setTask({ ...task, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white resize-none"
                placeholder="Describe the task details and requirements..."
                rows={3}
              />
            </div>

            {/* Priority and Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label htmlFor="task-priority" className="block text-sm font-semibold text-gray-800 mb-2">
                  Priority Level
                </label>
                <div className="relative">
                  <select
                    id="task-priority"
                    value={task.priority}
                    onChange={(e) => setTask({ ...task, priority: e.target.value as Task["priority"] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white appearance-none cursor-pointer"
                  >
                    <option value="low">🟢 Low Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="high">🟠 High Priority</option>
                    <option value="critical">🔴 Critical Priority</option>
                  </select>
                  <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="group">
                <label htmlFor="task-due-date" className="block text-sm font-semibold text-gray-800 mb-2">
                  Due Date
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  value={task.dueDate}
                  onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                />
              </div>
            </div>

            {/* Estimated Hours */}
            <div className="group">
              <label htmlFor="task-hours" className="block text-sm font-semibold text-gray-800 mb-2">
                Estimated Hours
              </label>
              <input
                id="task-hours"
                type="number"
                min="0"
                step="0.5"
                value={task.estimatedHours}
                onChange={(e) =>
                  setTask({ ...task, estimatedHours: Number.parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                placeholder="0.0"
              />
            </div>

            {/* Team Member Assignment */}
            <div className="group">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-800">
                  Assign Team Members*
                </label>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{task.assignedTo.length} selected</span>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-xl bg-gray-50/30 overflow-hidden">
                {/* Custom scrollable area with hidden scrollbar */}
                <div 
                  className="space-y-1 p-2 overflow-y-auto scrollbar-hide" 
                  style={{ maxHeight: '240px' }}
                >
                  {teamMembers.map((member, index) => (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        task.assignedTo.includes(member.id)
                          ? "bg-blue-500 text-white shadow-md transform scale-[1.02]"
                          : "hover:bg-white hover:shadow-sm bg-white/60"
                      }`}
                      onClick={() => toggleAssignment(member.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img 
                            src={member.avatar} 
                            alt={member.name} 
                            className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm" 
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 scale-75">
                            {getUserStatusIcon(member.status)}
                          </div>
                        </div>
                        <div>
                          <div className={`font-semibold ${
                            task.assignedTo.includes(member.id) ? 'text-white' : 'text-gray-900'
                          }`}>
                            {member.name}
                          </div>
                          <div className={`text-xs ${
                            task.assignedTo.includes(member.id) ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {member.role}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                          task.assignedTo.includes(member.id)
                            ? "bg-white border-white flex items-center justify-center"
                            : "border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        {task.assignedTo.includes(member.id) && (
                          <Check className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-white hover:shadow-sm transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onAdd}
            disabled={!task.title.trim() || task.assignedTo.length === 0}
            className={`px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 flex items-center space-x-2 ${
              !task.title.trim() || task.assignedTo.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;  /* Internet Explorer 10+ */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Safari and Chrome */
        }
      `}</style>
    </div>
  );
}