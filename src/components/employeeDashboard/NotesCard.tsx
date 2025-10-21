"use client"
import React, { useState, useEffect } from "react"
import { Edit3, Check, X } from "lucide-react"
import { getNotes, updateNote } from "@/lib/notesService"
import Link from "next/link"

const NotesCard: React.FC = () => {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true)
        const fetchedNotes = await getNotes()
        setNotes(fetchedNotes.slice(0, 1)) // only show first note
      } catch (error) {
        console.error("Error fetching notes:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchNotes()
  }, [])

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleEdit = () => {
    if (notes[0]) {
      // keep HTML content so user edits properly
      setEditContent(notes[0].content || "")
      setEditing(true)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setEditContent("")
  }

   const handleSave = async () => {
    if (!notes[0]) return
    try {
      setSaving(true)
      const updated = await updateNote(notes[0].id, {
        title: notes[0].title,
        content: editContent, // send updated content
      })
      // Update with the editContent we just saved, ensuring it's available immediately
      setNotes([{
        ...notes[0],
        content: editContent,
        updatedAt: updated.updatedAt || new Date().toISOString()
      }])
      setEditing(false)
    } catch (err) {
      console.error("Error updating note:", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div 
      style={{
        width: 332,
        height: 248,
        borderRadius: "20px",
        borderWidth: "1px",
        padding: 20,

        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }} className="[background:var(--container-bg)]  [border:var(--border-style)]
     [box-shadow:var(--shadow-combined)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-text-main text-lg font-semibold">Notes</span>
        <Link href="/dashboard/teammember/notes" className="text-sm text-sky-400">
          See All
        </Link>
      </div>

      {/* Body */}
      <div className="flex-1 flex items-center justify-center">
        <div className="[background:var(--container-bg)] border border-white/20 rounded-xl p-4 w-full h-[140px] flex flex-col justify-between">
          {loading ? (
            <p className="text-text-main text-sm text-center">Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="text-text-main text-sm text-center">No notes found</p>
          ) : (
            <>
              {editing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-1 bg-transparent border border-white/30 rounded-lg text-text-secondary text-xs p-2 resize-none h-full"
                />
              ) : (
                <p
                  className="text-text-main text-xs font-light overflow-hidden line-clamp-3"
                  // render as HTML preview
                  dangerouslySetInnerHTML={{
                    __html: notes[0]?.content || "No content available",
                  }}
                />
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-text-secondary">
                  {formatDate(notes[0]?.updatedAt || notes[0]?.createdAt)}
                </span>
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="text-text-secondary "
                      >
                        <Check size={16} />
                      </button>
                      <button onClick={handleCancel} className="text-red-400">
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button onClick={handleEdit} className="text-text-main">
                      <Edit3 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotesCard
