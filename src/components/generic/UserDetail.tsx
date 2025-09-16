"use client"

import { X } from "lucide-react"
import React from "react"

interface UserDetailProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id?: string
    name: string
    email: string
    phone: string
    address: string
    team?: { name: string; role?: string; avatar?: string }[]
  } | null
}

export default function UserDetail({ isOpen, onClose, user }: UserDetailProps) {
  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-screen rounded-2xl border border-white/10 shadow-2xl bg-white/10 backdrop-blur-lg overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-9 h-9 inline-flex items-center justify-center rounded-full hover:bg-white/20 transition"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Content */}
        <div className="p-6 lg:p-8 space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-2xl font-semibold text-white">{user.name}</h2>
            <p className="text-gray-200">{user.email}</p>
            <p className="text-gray-300">{user.phone}</p>
            <p className="text-gray-300">{user.address}</p>
          </div>

          {/* Team Section (if available) */}
          {user.team && user.team.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Team</h3>
              <ul className="space-y-3">
                {user.team.map((member, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/10"
                  >
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium">{member.name}</p>
                      {member.role && (
                        <p className="text-gray-300 text-sm">{member.role}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
