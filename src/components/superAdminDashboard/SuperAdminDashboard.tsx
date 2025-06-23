'use client'
import React, { useState, } from 'react';
import { 
  Building2, 
  Users, 
  FolderOpen, 
  CheckCircle, 
  XCircle, 
  Activity,
  TrendingUp,

  AlertTriangle,
  DollarSign,
  Shield,
  Clock
} from 'lucide-react';

const SuperAdminDashboard = () => {
  // Mock data - in real app, this would come from API
  const [dashboardData, setDashboardData] = useState({
    organizations: {
      total: 48,
      active: 42,
      inactive: 6,
      newThisMonth: 8
    },
    users: {
      total: 1247,
      active: 1089,
      inactive: 158,
      admins: 52
    },
    projects: {
      total: 324,
      active: 289,
      completed: 198,
      overdue: 23
    },
    system: {
      uptime: '99.8%',
      storageUsed: '78%',
      activeConnections: 1089,
      revenue: 45280
    }
  });

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => {
    const colorClasses = {
      blue: 'border-blue-200 bg-blue-50',
      green: 'border-green-200 bg-green-50',
      red: 'border-red-200 bg-red-50',
      yellow: 'border-yellow-200 bg-yellow-50',
      purple: 'border-purple-200 bg-purple-50',
      gray: 'border-gray-200 bg-gray-50'
    };

    const iconColors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      red: 'text-red-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600',
      gray: 'text-gray-600'
    };

    return (
      <div className={`rounded-lg border-2 ${colorClasses[color]} p-6 transition-all hover:shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon className={`h-8 w-8 ${iconColors[color]}`} />
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
      </div>
    );
  };

  const ActivityItem = ({ title, description, time, type }) => {
    const typeColors = {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800'
    };

    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[type]}`}>
          {type.toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
          <p className="text-xs text-gray-400 mt-1">{time}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage your project management platform</p>
        </div>

        {/* Organization Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Organization Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Organizations" 
              value={dashboardData.organizations.total}
              subtitle="Registered organizations"
              icon={Building2}
              trend={12}
              color="blue"
            />
            <StatCard 
              title="Active Organizations" 
              value={dashboardData.organizations.active}
              subtitle="Currently active"
              icon={CheckCircle}
              trend={8}
              color="green"
            />
            <StatCard 
              title="Inactive Organizations" 
              value={dashboardData.organizations.inactive}
              subtitle="Requires attention"
              icon={XCircle}
              trend={-15}
              color="red"
            />
            <StatCard 
              title="New This Month" 
              value={dashboardData.organizations.newThisMonth}
              subtitle="Recent registrations"
              icon={TrendingUp}
              trend={25}
              color="purple"
            />
          </div>
        </div>

        {/* User Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Users" 
              value={dashboardData.users.total.toLocaleString()}
              subtitle="Platform users"
              icon={Users}
              trend={18}
              color="blue"
            />
            <StatCard 
              title="Active Users" 
              value={dashboardData.users.active.toLocaleString()}
              subtitle="Last 30 days"
              icon={Activity}
              trend={12}
              color="green"
            />
            <StatCard 
              title="Admin Users" 
              value={dashboardData.users.admins}
              subtitle="Organization admins"
              icon={Shield}
              color="purple"
            />
            <StatCard 
              title="Inactive Users" 
              value={dashboardData.users.inactive}
              subtitle="Need activation"
              icon={Clock}
              trend={-8}
              color="yellow"
            />
          </div>
        </div>

        {/* Project Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Projects" 
              value={dashboardData.projects.total}
              subtitle="All projects"
              icon={FolderOpen}
              trend={22}
              color="blue"
            />
            <StatCard 
              title="Active Projects" 
              value={dashboardData.projects.active}
              subtitle="In progress"
              icon={Activity}
              trend={15}
              color="green"
            />
            <StatCard 
              title="Completed Projects" 
              value={dashboardData.projects.completed}
              subtitle="Successfully finished"
              icon={CheckCircle}
              trend={28}
              color="green"
            />
            <StatCard 
              title="Overdue Projects" 
              value={dashboardData.projects.overdue}
              subtitle="Need attention"
              icon={AlertTriangle}
              trend={-12}
              color="red"
            />
          </div>
        </div>

        {/* System Performance & Revenue */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="System Uptime" 
              value={dashboardData.system.uptime}
              subtitle="Last 30 days"
              icon={Activity}
              color="green"
            />
            <StatCard 
              title="Storage Used" 
              value={dashboardData.system.storageUsed}
              subtitle="Of total capacity"
              icon={Building2}
              color="yellow"
            />
            <StatCard 
              title="Active Connections" 
              value={dashboardData.system.activeConnections.toLocaleString()}
              subtitle="Real-time users"
              icon={Users}
              trend={5}
              color="blue"
            />
            <StatCard 
              title="Monthly Revenue" 
              value={`$${dashboardData.system.revenue.toLocaleString()}`}
              subtitle="Current month"
              icon={DollarSign}
              trend={18}
              color="green"
            />
          </div>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-1">
                <ActivityItem 
                  title="New Organization Registered"
                  description="TechCorp Solutions joined the platform"
                  time="2 minutes ago"
                  type="success"
                />
                <ActivityItem 
                  title="System Maintenance"
                  description="Scheduled maintenance completed successfully"
                  time="1 hour ago"
                  type="info"
                />
                <ActivityItem 
                  title="Storage Warning"
                  description="Storage usage reached 75% capacity"
                  time="3 hours ago"
                  type="warning"
                />
                <ActivityItem 
                  title="High CPU Usage"
                  description="Server load exceeded threshold briefly"
                  time="5 hours ago"
                  type="error"
                />
                <ActivityItem 
                  title="Bulk User Import"
                  description="DataTech Inc imported 150 new users"
                  time="1 day ago"
                  type="info"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <button className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="font-medium text-blue-900">Manage Organizations</span>
                  </div>
                  <span className="text-blue-600">→</span>
                </button>
                
                <button className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-green-600 mr-3" />
                    <span className="font-medium text-green-900">User Management</span>
                  </div>
                  <span className="text-green-600">→</span>
                </button>
                
                <button className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="font-medium text-purple-900">System Analytics</span>
                  </div>
                  <span className="text-purple-600">→</span>
                </button>
                
                <button className="flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                    <span className="font-medium text-red-900">System Alerts</span>
                  </div>
                  <span className="text-red-600">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;