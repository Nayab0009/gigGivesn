"use client"
import React from 'react'
import Sprint from '@/components/managerDashboard/AddSprints'
export default function page() {
  const id = window.location.pathname.split('/').pop();
  return (
    <div>
      <Sprint projectId={id as string} />
    </div>
  )
}
