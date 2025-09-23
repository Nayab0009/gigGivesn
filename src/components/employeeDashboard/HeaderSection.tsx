"use client"
import { FC } from "react"
import { AlertCircle } from "lucide-react"

interface HeaderSectionProps {
  userName?: string
  error: string | null
}

const HeaderSection: FC<HeaderSectionProps> = ({ userName, error }) => {
  return (
    <>
      <header className="px-6 py-10 rounded-b-3xl mb-8 ml-6 mr-6">
        <div className="mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Employee Dashboard</h1>
            <p className="text-sm md:text-base mt-1">
              Welcome back, {userName || 'Employee'}! Ready to tackle today's challenges?
            </p>
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-auto px-10 mb-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default HeaderSection