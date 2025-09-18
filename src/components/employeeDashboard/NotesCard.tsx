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
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className="rounded-2xl p-4 h-full" 
      style={{
        background: 'linear-gradient(120deg, rgba(24,50,59,0.95) 0%, rgba(24,50,59,0.8) 100%)',
        border: '1.5px solid rgba(255,255,255,0.13)',
        boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold tracking-tight text-white">Notes</h4>
        <a href="#" className="text-sm text-blue-400 hover:text-blue-300">See All</a>
      </div>
      
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-white/70 text-sm p-4 text-center">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-white/70 text-sm p-4 text-center">No notes found</div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="rounded-xl p-4 bg-[#18323b]/80 border border-white/10">
              <p className="text-sm text-white/90 mb-6">
                {note.content || note.title || "No content"}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {formatDate(note.lastModified || note.updatedAt || note.createdAt)}
                </span>
                <button className="p-1 text-gray-400 hover:text-white">
                  <Edit3 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotesCard