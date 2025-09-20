"use client"

import React from 'react';

interface ProgressBarProps {
  percentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  // Calculate width based on percentage
  const width = `${percentage}%`;
  
  // Define color based on percentage
  let barColor = '#3B82F6'; // Default blue
  
  // Use different colors based on percentage
  if (percentage < 30) {
    barColor = '#3B82F6'; // Blue for low progress
  } else if (percentage < 70) {
    barColor = '#22C55E'; // Green for medium progress
  } else {
    barColor = '#22C55E'; // Green for high progress
  }

  return (
    <div className="w-full h-2 bg-gray-800/30 rounded-full">
      <div 
        className="h-full" 
        style={{ width, backgroundColor: barColor }}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
};

export default ProgressBar;