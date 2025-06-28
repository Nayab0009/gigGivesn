'use client'
import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  FolderOpen, 
  CheckCircle, 
  XCircle, 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Shield,
  Clock,
  Server,
  Database,
  Zap,
  Target,
  Award,
  Globe,
  Bell,
  Settings,
  Calendar,
  BarChart3,
  UserCheck,
  Timer
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    organizations: {
      total: 47,
      active: 42,
      inactive: 5,
      newThisMonth: 8,
      enterprise: 15,
      professional: 22,
      starter: 10
    },
    users: {
      total: 2847,
      activeToday: 1923,
      projectManagers: 156,
      teamLeads: 234,
      developers: 1890,
      designers: 287,
      qaTesters: 280
    },
    projects: {
      total: 1246,
      active: 834,
      completed: 312,
      onHold: 67,
      overdue: 33,
      delivered: 289,
      inPlanning: 145
    },
    tasks: {
      total: 28456,
      completed: 18923,
      inProgress: 5678,
      pending: 2890,
      blocked: 234,
      review: 731
    },
    performance: {
      avgProjectDuration: '3.2 months',
      onTimeDelivery: '87%',
      clientSatisfaction: '4.7/5',
      teamProductivity: '92%',
      resourceUtilization: '78%',
      budgetCompliance: '94%'
    },
    financial: {
      monthlyRevenue: 187500,
      quarterlyGrowth: 23,
      averageProjectValue: 15600,
      totalContractValue: 2340000,
      pendingInvoices: 45600,
      paidInvoices: 156780
    },
    system: {
      uptime: '99.8%',
      storageUsed: '64%',
      activeUsers: 1923,
      apiCalls: 45680,
      supportTickets: 12,
      avgResponseTime: '1.2s'
    }
  });

  const SimpleCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue', bgColor }) => {
    const trendColor = trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-500' : 'text-gray-500';
    
    return (
      <div className={`${bgColor} rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-white/20`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-white/20`}>
            <Icon className={`h-6 w-6 text-white`} />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center text-sm font-medium px-2 py-1 rounded-full bg-white/20 text-white`}>
              {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        <div>
          <h3 className="text-white/80 text-sm font-medium mb-2">{title}</h3>
          <p className="text-white text-2xl font-bold mb-1">{value}</p>
          {subtitle && <p className="text-white/70 text-sm">{subtitle}</p>}
        </div>
      </div>
    );
  };

  const ActivityItem = ({ title, description, time, type, icon: Icon }) => {
    const typeConfig = {
      success: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-600', border: 'border-emerald-100' },
      warning: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-600', border: 'border-amber-100' },
      error: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-600', border: 'border-red-100' },
      info: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600', border: 'border-blue-100' }
    };

    const config = typeConfig[type];

    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <div className={`p-2 rounded-lg ${config.bg} ${config.border} border`}>
          <Icon className={`h-4 w-4 ${config.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
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
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Project Management Platform - Super Admin
            </h1>
            <p className="text-gray-600">
              Complete oversight of your project management ecosystem
            </p>
            <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                All Systems Operational
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Last updated: 2 minutes ago
              </div>
            </div>
          </div>
        </div>

        {/* Organizations Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600" />
            Organizations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SimpleCard 
              title="Total Organizations" 
              value={dashboardData.organizations.total}
              subtitle="Registered companies"
              icon={Building2}
              trend={12}
              bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <SimpleCard 
              title="Active Organizations" 
              value={dashboardData.organizations.active}
              subtitle="Currently using platform"
              icon={CheckCircle}
              trend={8}
              bgColor="bg-gradient-to-br from-emerald-500 to-emerald-600"
            />
            <SimpleCard 
              title="Enterprise Clients" 
              value={dashboardData.organizations.enterprise}
              subtitle="Premium tier"
              icon={Award}
              trend={25}
              bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <SimpleCard 
              title="New This Month" 
              value={dashboardData.organizations.newThisMonth}
              subtitle="Recent signups"
              icon={TrendingUp}
              trend={33}
              bgColor="bg-gradient-to-br from-indigo-500 to-indigo-600"
            />
          </div>
        </div>

        {/* Users & Teams */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-600" />
            Users & Teams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SimpleCard 
              title="Total Users" 
              value={dashboardData.users.total.toLocaleString()}
              subtitle="Platform users"
              icon={Users}
              trend={18}
              bgColor="bg-gradient-to-br from-teal-500 to-teal-600"
            />
            <SimpleCard 
              title="Active Today" 
              value={dashboardData.users.activeToday.toLocaleString()}
              subtitle="Currently online"
              icon={UserCheck}
              trend={15}
              bgColor="bg-gradient-to-br from-green-500 to-green-600"
            />
            <SimpleCard 
              title="Project Managers" 
              value={dashboardData.users.projectManagers}
              subtitle="Leading projects"
              icon={Target}
              trend={5}
              bgColor="bg-gradient-to-br from-orange-500 to-orange-600"
            />
            <SimpleCard 
              title="Developers" 
              value={dashboardData.users.developers.toLocaleString()}
              subtitle="Building solutions"
              icon={Activity}
              trend={22}
              bgColor="bg-gradient-to-br from-cyan-500 to-cyan-600"
            />
          </div>
        </div>

        {/* Projects & Tasks */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FolderOpen className="h-5 w-5 mr-2 text-purple-600" />
            Projects & Tasks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SimpleCard 
              title="Total Projects" 
              value={dashboardData.projects.total.toLocaleString()}
              subtitle="All time"
              icon={FolderOpen}
              trend={14}
              bgColor="bg-gradient-to-br from-violet-500 to-violet-600"
            />
            <SimpleCard 
              title="Active Projects" 
              value={dashboardData.projects.active}
              subtitle="In progress"
              icon={Timer}
              trend={11}
              bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <SimpleCard 
              title="Completed Tasks" 
              value={`${(dashboardData.tasks.completed / 1000).toFixed(1)}k`}
              subtitle="Total achievements"
              icon={CheckCircle}
              trend={28}
              bgColor="bg-gradient-to-br from-emerald-500 to-emerald-600"
            />
            <SimpleCard 
              title="Overdue Projects" 
              value={dashboardData.projects.overdue}
              subtitle="Need attention"
              icon={AlertTriangle}
              trend={-12}
              bgColor="bg-gradient-to-br from-red-500 to-red-600"
            />
          </div>
        </div>

        {/* Financial & Performance */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
            Financial & Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SimpleCard 
              title="Monthly Revenue" 
              value={`$${(dashboardData.financial.monthlyRevenue / 1000).toFixed(0)}k`}
              subtitle="Current month"
              icon={DollarSign}
              trend={23}
              bgColor="bg-gradient-to-br from-green-600 to-emerald-600"
            />
            <SimpleCard 
              title="On-Time Delivery" 
              value={dashboardData.performance.onTimeDelivery}
              subtitle="Project success rate"
              icon={Target}
              trend={5}
              bgColor="bg-gradient-to-br from-blue-600 to-indigo-600"
            />
            <SimpleCard 
              title="Client Satisfaction" 
              value={dashboardData.performance.clientSatisfaction}
              subtitle="Average rating"
              icon={Award}
              trend={8}
              bgColor="bg-gradient-to-br from-purple-600 to-pink-600"
            />
            <SimpleCard 
              title="Team Productivity" 
              value={dashboardData.performance.teamProductivity}
              subtitle="Efficiency metric"
              icon={TrendingUp}
              trend={12}
              bgColor="bg-gradient-to-br from-orange-600 to-red-600"
            />
          </div>
        </div>

        {/* Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-blue-600" />
                Recent Activity
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-1">
                <ActivityItem 
                  title="New Enterprise Client"
                  description="TechFlow Inc. upgraded to Enterprise plan (500 users)"
                  time="5 minutes ago"
                  type="success"
                  icon={Building2}
                />
                <ActivityItem 
                  title="Project Milestone Achieved"
                  description="Mobile App Development project reached 75% completion"
                  time="32 minutes ago"
                  type="success"
                  icon={Target}
                />
                <ActivityItem 
                  title="Resource Allocation Alert"
                  description="Development team at 95% capacity this sprint"
                  time="1 hour ago"
                  type="warning"
                  icon={Users}
                />
                <ActivityItem 
                  title="System Maintenance"
                  description="Scheduled database optimization completed successfully"
                  time="3 hours ago"
                  type="info"
                  icon={Server}
                />
                <ActivityItem 
                  title="Payment Received"
                  description="$25,000 payment processed for DataCorp project"
                  time="5 hours ago"
                  type="success"
                  icon={DollarSign}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-purple-600" />
                Quick Actions
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-blue-600 mr-3" />
                    <div className="text-left">
                      <span className="font-medium text-blue-900">Manage Organizations</span>
                      <p className="text-xs text-blue-700">View and edit client accounts</p>
                    </div>
                  </div>
                  <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
                </button>
                
                <button className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors group">
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-green-600 mr-3" />
                    <div className="text-left">
                      <span className="font-medium text-green-900">Analytics Dashboard</span>
                      <p className="text-xs text-green-700">Detailed reports and insights</p>
                    </div>
                  </div>
                  <span className="text-green-600 group-hover:translate-x-1 transition-transform">→</span>
                </button>
                
                <button className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors group">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-purple-600 mr-3" />
                    <div className="text-left">
                      <span className="font-medium text-purple-900">User Management</span>
                      <p className="text-xs text-purple-700">Roles, permissions, and access</p>
                    </div>
                  </div>
                  <span className="text-purple-600 group-hover:translate-x-1 transition-transform">→</span>
                </button>
                
                <button className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors group">
                  <div className="flex items-center">
                    <Server className="h-5 w-5 text-orange-600 mr-3" />
                    <div className="text-left">
                      <span className="font-medium text-orange-900">System Health</span>
                      <p className="text-xs text-orange-700">Monitor performance and uptime</p>
                    </div>
                  </div>
                  <span className="text-orange-600 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
              
              {/* System Status */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">System Status</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uptime:</span>
                    <span className="font-medium text-green-600">{dashboardData.system.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response:</span>
                    <span className="font-medium text-green-600">{dashboardData.system.avgResponseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Storage:</span>
                    <span className="font-medium text-blue-600">{dashboardData.system.storageUsed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Support:</span>
                    <span className="font-medium text-orange-600">{dashboardData.system.supportTickets} tickets</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;