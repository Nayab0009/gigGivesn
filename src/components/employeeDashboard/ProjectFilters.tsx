"use client"
import { useState } from "react"

interface ProjectFilterProps {
  onFilterChange?: (filter: string) => void
}

const ProjectFilters: React.FC<ProjectFilterProps> = ({ onFilterChange }) => {
  const [activeFilter, setActiveFilter] = useState<string>("Today")
  
  const filters = ["Today", "Week", "Months", "Years"]
  
  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter)
    if (onFilterChange) {
      onFilterChange(filter)
    }
  }
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-white mr-4">Projects</h2>
        <div className="bg-blue-900/30 rounded-lg p-1 flex">
          <button className="flex items-center justify-center h-7 w-7 rounded-md text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      <div className="bg-black/30 rounded-full flex">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => handleFilterClick(filter)}
            className={`px-3 py-1 text-xs rounded-full ${
              activeFilter === filter 
                ? 'bg-black/30 text-white' 
                : 'text-white-300'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProjectFilters