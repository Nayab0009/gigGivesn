"use client"
import React, { useState, useEffect } from "react"
import { Edit3 } from "lucide-react"
import { getNotes } from "@/lib/notesService"
import { useAuth } from "@/context/AuthContext"

const NotesCard: React.FC = () => {
  const { user } = useAuth()
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true)
        const fetchedNotes = await getNotes()
        setNotes(fetchedNotes.slice(0, 1)) // Just take the first note for card display
      } catch (error) {
        console.error("Error fetching notes:", error)
        // Fallback to demo note
        setNotes([{
          id: 1,
          title: "UI Design",
          content: "The beginning of Screen less design: UI Job to be taken over by solution Architect",
          lastModified: "May/21/2020"
        }])
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [])

  // Format date string
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return dateString
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div
      className="rounded-3xl p-4 flex flex-col justify-between border border-white/30 bg-black/30 shadow-md w-full h-[230px] mx-auto backdrop-blur-[6px]"
      style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)', transition: 'box-shadow 0.2s' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-white">Notes</span>
        <a href="#" className="text-xs font-medium text-blue-300 hover:underline focus:outline-none">See All</a>
      </div>
      
      {/* Single note card with fixed content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-black/20 rounded-2xl p-4 w-full h-[140px] flex flex-col justify-between">
          {loading ? (
            <div className="text-white/70 text-sm text-center py-6">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="text-white/70 text-sm text-center py-6">No notes found</div>
          ) : (
            <>
              <div className="text-white text-sm leading-relaxed">
                {notes[0]?.content || notes[0]?.title || "The beginning of Screen less design: UI Job to be taken over by solution Architect"}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20">
                <span className="text-xs text-white">
                  {formatDate(notes[0]?.lastModified || notes[0]?.updatedAt || notes[0]?.createdAt || "May/21/2020")}
                </span>
                <button className="p-1 text-white hover:text-white">
                  <Edit3 size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
  )
}

export default NotesCard
