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
      <header className="py-10 rounded-b-3xl mb-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="pl-2 md:pl-4">
            <h1 className="text-3xl md:text-[20px] font-semibold tracking-tight text-text-main"> Welcome back, {userName || 'Employee'}!</h1>
            <p className="text-sm md:text-base mt-1 text-text-secondary">
              Ready to tackle today's challenges?
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