"use client"
import { FC } from "react"
import { RefreshCw } from "lucide-react"
import { colors } from "@/colors"

interface LoadingSpinnerProps {
  message?: string
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ message = "Loading your dashboard..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black/40 backdrop-blur-md rounded-2xl">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: colors.accent.hex }}>
          <RefreshCw className="w-8 h-8" style={{ color: colors.primary.hex }} />
        </div>
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner