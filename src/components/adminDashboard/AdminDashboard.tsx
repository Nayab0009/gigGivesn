
"use client"
import {getAllProjectsDashboard} from "../../lib/ProjectService"
import { getAllProjects } from "../../lib/ProjectService"
import {getAllUsers} from "../../lib/user"
import { useEffect, useState } from "react"
import ProgressBar from "../ui/progressBar/ProgressBar"
import {
  Plus
} from "lucide-react"

import BarChartComp from "../ui/barchart/barchart"
import TeamActivityBarChart from "../ui/teamActivityBarChart"

import Image from "next/image"

// --- Types aligned to project management context ---
interface DashboardData {
  adminStats: {
    totalProjects: number
    activeProjects: number
    totalTasks: number
    allTime: number
    totalUsers: number
    tasksCompleted: number
    openBugs: number
  }
  projectProgress: Array<{
    month: string
    completedTasks: number
    createdTasks: number
    year: number
  }>
  teamActivity: Array<{
    team: string
    value?: number
    tasks?: number
    completed?: number
    efficiency?: number // percent
  }>
  recentActivities: Array<{
    id: string
    project: string
    user: string
    action: string
    date: string
    status: string
    type: string
  }>
}

// Modern, accessible color palette
const COLORS = [
  "#2563eb", // blue-600
  "#f59e42", // amber-400
  "#16a34a", // green-600
  "#f43f5e", // rose-500
  "#a21caf", // purple-800
  "#0ea5e9", // sky-500
]

// Card colors for dashboard metrics (gradient backgrounds)
const cardGradients = [
  "from-[#2563eb] to-[#1e40af]", // blue
  "from-[#f59e42] to-[#ea580c]", // amber
  "from-[#16a34a] to-[#166534]", // green
  "from-[#f43f5e] to-[#be123c]", // rose
  "from-[#a21caf] to-[#581c87]", // purple
]

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([]);
  const [allUsers, setUsers] = useState<any[]>([]);
  console.log("All Users:", allUsers);
  const [allProjects, setAllProjects] = useState<any[]>([]);

// The formatting function
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};



useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Fetch dashboard projects
        const dashboardData = await getAllProjectsDashboard();
        setProjects(dashboardData);
        
        // Fetch all projects
        const allProjectsData = await getAllProjects();
        setAllProjects(allProjectsData);

        const usersData = await getAllUsers();
        setUsers(usersData);


        
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []); // Empty dependency array ensures this runs only once

  // if (isLoading) {
  //   return <div>Loading projects...</div>;
  // }



  const [dashboardData, setDashboardData] = useState<DashboardData>({
    
    adminStats: {
      totalProjects: 0,
      activeProjects: 0,
      totalTasks: 0,
      allTime: 0,
      totalUsers: 0,
      tasksCompleted: 0,
      openBugs: 0,
    },
    projectProgress: [],
    teamActivity: [],
    recentActivities: [],
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      setTimeout(async () => {
        setDashboardData({
          adminStats: {
            totalProjects: projects.length,
            activeProjects: allProjects.filter(project => project.status === "inprogress").length,
            totalTasks: allProjects.filter(project => project.status === "iscompleted").length,
            allTime: projects.length,
            totalUsers: allUsers[1] || 0,
            tasksCompleted: 1075,
            openBugs: 16,
          },
          projectProgress: [
            { month: "Jan", completedTasks: 88, createdTasks: 110, year: 2024 },
            { month: "Feb", completedTasks: 94, createdTasks: 115, year: 2024 },
            { month: "Mar", completedTasks: 101, createdTasks: 120, year: 2024 },
            { month: "Apr", completedTasks: 99, createdTasks: 122, year: 2024 },
            { month: "May", completedTasks: 112, createdTasks: 130, year: 2024 },
            { month: "Jun", completedTasks: 125, createdTasks: 138, year: 2024 },
            { month: "Jul", completedTasks: 119, createdTasks: 136, year: 2024 },
            { month: "Aug", completedTasks: 107, createdTasks: 125, year: 2024 },
            { month: "Sep", completedTasks: 114, createdTasks: 132, year: 2024 },
            { month: "Oct", completedTasks: 128, createdTasks: 142, year: 2024 },
            { month: "Nov", completedTasks: 129, createdTasks: 144, year: 2024 },
            { month: "Dec", completedTasks: 119, createdTasks: 130, year: 2024 },
          ],
          teamActivity: [
            { team: "Adil", value: 400 },
            { team: "Asfand", value: 350 },
            { team: "Huzaifa", value: 210 },
            { team: "Visal", value: 260 },
            { team: "Noman", value: 110 },
          ],
          recentActivities: [
            {
              id: "ACT-001",
              project: "Website Redesign",
              user: "Sarah Williams",
              action: "Closed Task #425",
              date: "2024-05-28",
              status: "completed",
              type: "task",
            },
            {
              id: "ACT-002",
              project: "API Development",
              user: "Mike Johnson",
              action: "Reported Bug #233",
              date: "2024-05-27",
              status: "open",
              type: "bug",
            },
            {
              id: "ACT-003",
              project: "Mobile App",
              user: "Lisa Chen",
              action: "Deployed v1.2.3",
              date: "2024-05-26",
              status: "completed",
              type: "deployment",
            },
            {
              id: "ACT-004",
              project: "QA Sprint",
              user: "David Brown",
              action: "Tested Feature #99",
              date: "2024-05-25",
              status: "in-progress",
              type: "test",
            },
            {
              id: "ACT-005",
              project: "Website Redesign",
              user: "Emma Davis",
              action: "Created Task #426",
              date: "2024-05-24",
              status: "pending",
              type: "task",
            },
          ],
        })
        setIsLoading(false)
      }, 1000)
    }
    fetchDashboardData()
  }, [projects, allProjects, allUsers]) // Add allProjects as a dependency

  const formatNumber = (num: number) => new Intl.NumberFormat("en-US").format(num)

  // Updated color functions for better vibrance and contrast
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "in-progress":
        return "bg-sky-100 text-sky-800 border-sky-300"
      case "open":
        return "bg-rose-100 text-rose-800 border-rose-300"
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-300"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "task":
        return "bg-sky-100 text-sky-800 border-sky-300"
      case "bug":
        return "bg-rose-100 text-rose-800 border-rose-300"
      case "deployment":
        return "bg-green-100 text-green-800 border-green-300"
      case "test":
        return "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300"
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-300"
    }
  }

  // const pieData = [
  //   { name: "Completed", value: dashboardData.adminStats.tasksCompleted },
  //   { name: "Open", value: dashboardData.adminStats.totalTasks - dashboardData.adminStats.tasksCompleted },
  //   { name: "Bugs", value: dashboardData.adminStats.openBugs },
  // ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gradient-to-br from-indigo-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8 pt-4 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between -mt-12 mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-md font-extralight text-gray-200">Welcome back! See your latest project insights below.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button className="px-5 py-2 text-white rounded-full  hover:text-gray-200 shadow transition-all font-semibold text-sm inline-flex gap-x-1 md:gap-x-3 bg-black-600 bg-gray-500/30">
           <Plus className="w-5 h-4 text-white font-light" /> <p className="text-white font-light">Add Manager</p>
          </button>
          <button className="px-5 py-2 text-white rounded-full transition-all shadow font-semibold text-sm inline-flex bg-blur-green bg-sky-400 gap-x-1 md:gap-x-3">
          <Plus className="w-4 h-4 text-white" /> <p className="text-white font-light">New Project</p>
          </button>
        </div>
      </div>



<div className="block md:flex space-x-7 mb-0">
  <div className="flex-1">
      {/* Stats Cards */}
      <div className="grid space-y-2 py-0">
        {/* Total Projects */}
        <div className="flex flex-cols-2 bg-[rgba(0,0,0,0.3)] items-center py-0 rounded-2xl  shadow-md group border border-white/30 justify-between">
          <div>
             <div className="px-4 py-2">
            <p className="text-gray-200 font-light text-xs tracking-wider">Total Projects</p>
         
          <div>
            <p className="text-lg font-bold text-white">
              {formatNumber(dashboardData.adminStats.totalProjects)}
            </p>
            <div className="flex items-center">
              <div>
                <p className="text-gray-200 font-light text-xs tracking-wider">Active projects</p>
              </div>
              <div>
                  <div className="flex space-x-1">
              <span className="text-white text-xs ml-3 bg-[rgba(194,65,12,0.3)]  px-4 py-1 rounded-full font-light border-2 border-[#615041]">{dashboardData.adminStats.activeProjects}</span>
            </div>
              </div>
            </div>
            
          
          </div>
        </div>


        
          </div>
          <div>
             <div className="w-16 h-16 bg-[rgba(0,0,0,0.3)] items-center justify-center justify-items-center rounded-2xl flex mr-7">
              <Image src="/images/bag.svg" alt="bag" width={30} height={30} className="text-white p-1" />
            </div>
            </div>
        </div>
        
        {/* Total Tasks */}
        <div className="flex flex-cols-2 bg-[rgba(0,0,0,0.3)] items-center py-0 rounded-2xl shadow-md group border border-white/30 justify-between">
          <div>
            <div className="px-4 py-2">
              <p className="text-gray-200 font-light text-xs tracking-wider">Completed projects</p>
              <div>
                <p className="text-lg font-bold text-white">
                  {formatNumber(dashboardData.adminStats.totalTasks)}
                </p>
                <div className="flex items-center">
                  <div>
                    <p className="text-gray-200 font-light text-xs tracking-wider">All time</p>
                  </div>
                  <div>
                    <div className="flex space-x-1">
                      <span className="text-white text-xs ml-3 bg-[#696032] px-4 py-1 rounded-full border-[#716c4e] font-light border-2">{dashboardData.adminStats.allTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="w-16 h-16 bg-[rgba(0,0,0,0.3)] items-center justify-center justify-items-center rounded-2xl flex mr-7">
              <Image src="/images/tick.svg" alt="bag" width={30} height={30} className="text-white p-1" />
            </div>
          </div>
        </div>
        {/* Users */}
        <div className="flex flex-cols-2 bg-[rgba(0,0,0,0.3)] items-center py-0 rounded-2xl shadow-md group border border-white/30 justify-between">
          <div>
            <div className="px-4 py-2">
              <p className="text-gray-200 font-light text-xs tracking-wider">Users</p>
              <div>
                <p className="text-lg font-bold text-white">
                  {formatNumber(dashboardData.adminStats.totalUsers)}
                </p>
                <div className="flex items-center">
                  <div>
                    <p className="text-gray-200 font-light text-xs tracking-wider">Active members</p>
                  </div>
                  <div>
                    <div className="flex space-x-1">
                      <span className="text-white text-xs font-light ml-3 bg-[#26652D] px-4 py-1 rounded-full border-2 border-[#3D7543]">+4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="w-16 h-16 bg-[rgba(0,0,0,0.3)] items-center justify-center justify-items-center rounded-2xl flex mr-7">
              <Image src="/images/user.svg" alt="users" width={30} height={30} className="text-white p-1" />
            </div>
          </div>
        </div>
        
      </div>
  </div>



  <div className="flex-1">
{/* Team Activity Section - Updated to match screenshot */}
      <div className="bg-[rgba(0,0,0,0.3)] rounded-2xl py-3 px-4 shadow border border-white/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-4 w-full justify-between">
           
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Team Activity</h3>
              <p className="text-gray-300 text-sm">Task distribution and efficiency by team</p>
            </div>
             <div className="w-10 h-10 bg-[rgba(0,0,0,0.3)] rounded-full flex items-center justify-center">
              <Image src="/images/users.svg" alt="Users" width={20} height={20} className="text-white" />
            </div>
          </div>
        </div>
        <div>
          {/* Team Activity BarChart Component */}
          <TeamActivityBarChart data={dashboardData.teamActivity} />
        </div>
      </div>
        
      {/* </div> */} 
    </div>

  <div className="flex-1">
    {/* Task Status Breakdown */}
        <div className="bg-[rgba(0,0,0,0.3)] rounded-2xl py-3 px-4 shadow border border-white/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            {/* <Clock className="w-5 h-5 text-white" /> */}
            <div>
              <div className="flex gap-x-3 items-start">
                 <div className="w-10 h-10 bg-[rgba(0,0,0,0.3)] rounded-full flex items-center justify-center">
              <Image src="/images/clock.svg" alt="clock" width={20} height={20} className=" text-white" />
            </div>
            <div>
<h3 className="text-xl font-extrabold text-white mb-1 flex items-center">Project Breakdown</h3>
              <p className="text-gray-300 text-sm ">Open vs completed vs bugs</p>
            </div>
              </div>
              
            </div>
         
          </div>
              {/* Donut chart labels */}
              <BarChartComp />
            <div className="absolute inset-0 pointer-events-none">     
            </div>
        </div>
  </div>


</div>


      {/* Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-4">
      </div>
   
   

      {/* Projects Table */}
      <div className="space-y-4">
      
        {/* Desktop Table Layout */}
        <div className="lg:block border-y border-white/30 rounded-lg overflow-hidden p-4 text-center bg-black/30">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[rgba(47,79,79,0.5) text-center">
                  {[
                    { title: "Projects" },
                    { title: "Project Manager" },
                    { title: "Start" },
                    { title: "Finish" },
                    { title: "Progress"},
                    { title: "Total Task"},
                    { title: "Remaining Task"},
                    { title: "Completed Task"}
                  ].map((header, index) => (
                    <th 
                      key={index} 
                      className="px-4 py-3 text-center text-xs font-semibold text-white border-r border-white/30"
                    >
                      <span className="bg-black/30 p-2 rounded-md">{header.title}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="">
                {projects.map((project, idx) => {
                  // Calculate random progress for demo purposes (replace with actual data)
                  const totalTasks = project.totalTasks;
                  const completedTask = project.completedTask;
                  const pendingTask = totalTasks - completedTask;
                  const progress = Math.floor(completedTask / totalTasks * 100) || 0;
                  
                  return (
                    <tr key={project.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap border-r border-white/30 w-2/12">
                        <span className="text-sm text-white"><span></span>
                        {project.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-white/30 w-2/12">
                        <span className="text-sm text-white">
                          {project.managername}
                          </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-white/30 w-1/12">
                        <span className="text-sm text-white">
                          {formatDate(project.startDate)}
                          </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-white/30 w-1/12">
                        <span className="text-sm text-white">
                          {formatDate(project.endDate)}
                          </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-white/30 w-1/12">
                        <div className="flex items-center">
                          <div className="w-24 mr-2">
                            <ProgressBar percentage={progress} />
                          </div>
                          <span className="text-xs text-white">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center border-r border-white/30 w-1/12">
                        <span className="text-sm text-white">
                          {totalTasks}
                          </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center border-r border-white/30 w-2/12">
                        <span className="text-sm text-white">{pendingTask}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center w-4/12">
                        <span className="text-sm text-white">{completedTask}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}