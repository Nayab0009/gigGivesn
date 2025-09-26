import React from 'react';
import ShowSprintTask from '@/components/managerDashboard/ShowSprintTask';
import axiosInstance from '@/lib/axios';

// Next.js 13+ server component with async/await
export default async function SprintTasksPage({ params, searchParams }: any) {
  // Get sprintId from route params
  const sprintId = params?.id;
  // Try to get projectId and projectName from query params first
  let projectId = searchParams?.projectId;
  let projectName = searchParams?.projectName || '';

  // If not present in query, fetch from API
  if (!projectId && sprintId) {
    try {
      const res = await axiosInstance.get(`/sprint/${sprintId}`);
      const sprint = res.data;
      if (sprint?.project) {
        projectId = sprint.project.id;
        projectName = sprint.project.name;
      }
    } catch (e) {
      // fallback: leave undefined
    }
  }

  return (
    <div>
      <ShowSprintTask projectId={projectId} projectName={projectName} />
    </div>
  );
}