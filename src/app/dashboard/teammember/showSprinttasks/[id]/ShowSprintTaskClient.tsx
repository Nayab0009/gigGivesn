"use client";
import dynamic from 'next/dynamic';

const ShowSprintTask = dynamic(() => import('@/components/managerDashboard/ShowSprintTask'), { ssr: false });

export default function ShowSprintTaskClient() {
  return <ShowSprintTask />;
}
