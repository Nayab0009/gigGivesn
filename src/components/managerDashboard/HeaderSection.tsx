import React from "react";

interface HeaderSectionProps {
  userName?: string;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ userName }) => (
  <header className="py-4 rounded-b-3xl mb-8">
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="pl-2 md:pl-4">
        <h1 className="text-[20px] font-[600]  font-semibold tracking-tight">Manager Dashboard</h1>
        <p className="text-sm md:text-base mt-1">
          Welcome back, {userName || 'Manager'}! Oversee your assigned projects and manage your team effectively
        </p>
      </div>
    </div>
  </header>
);

export default HeaderSection;
