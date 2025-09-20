"use client"

import React, { useState } from 'react';
import ProgressBar from '../ui/progressBar/ProgressBar';

interface Project {
  title: string;
  projects: number;
  revenue: string;
  completion: number;
}

const ProjectOverview: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([
    { title: "Project A", projects: 5, revenue: "$3,300", completion: 85 },
    { title: "Project B", projects: 3, revenue: "$1,800", completion: 45 },
    { title: "Project C", projects: 7, revenue: "$5,500", completion: 65 },
    { title: "Project D", projects: 2, revenue: "$1,200", completion: 30 },
    { title: "Project E", projects: 6, revenue: "$4,200", completion: 90 },
  ]);

  // Table headers using map
  const tableHeaders = ["Title", "Projects", "Revenue", "Completion"].map((header, index) => (
    <th key={index} className="px-6 py-3 text-left text-sm text-gray-400 font-medium">
      {header}
    </th>
  ));

  return (
    <div className="h-full w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-lg shadow-sm">
      <div className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold leading-6">Project Overview</h3>

        {/* Project Table - Only visible on larger screens */}
        <div className="mt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/10">
                <tr>
                  {tableHeaders}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {projects.map((project, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium">{project.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{project.projects}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{project.revenue}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-full max-w-[100px]">
                          <ProgressBar percentage={project.completion} />
                        </div>
                        <span className="text-sm font-medium">{project.completion}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Mobile view for smaller screens - Hidden on larger screens */}
        <div className="hidden mt-4 space-y-3">
          {projects.map((project, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{project.title}</h4>
                <span className="text-sm font-medium">{project.completion}%</span>
              </div>
              <div className="mb-2">
                <ProgressBar percentage={project.completion} />
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                <span>Projects: {project.projects}</span>
                <span>Revenue: {project.revenue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;