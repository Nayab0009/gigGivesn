"use client"
import React, { useState, useEffect } from "react"
import { Edit3 } from "lucide-react"
import { getNotes } from "@/lib/notesService"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"

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
      style={{
        width: 332,
        height: 248,
        borderRadius: '20.33px',
        borderWidth: '1px',
        opacity: 1,
        top: 226,
        left: 696,
        padding: 20,
        gap: 20,
        background: '#0000004D',
        backgroundBlendMode: 'luminosity',
        border: '1px solid #FFFFFF4D',
        backdropFilter: 'blur(101.66923522949219px)',
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
        // position: 'relative',
        minHeight: '248px',
        maxHeight: '248px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: 'Inter',
          fontWeight: 600,
          fontSize: '18.3px',
          lineHeight: '28.47px',
          color: '#FFFFFF',
          verticalAlign: 'middle',
        }}>Notes</span>
        <Link
          href="/dashboard/teammember/notes"
          style={{
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: '14.23px',
            lineHeight: '20.33px',
            color: '#0CA9F6',
            textAlign: 'center',
            verticalAlign: 'middle',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >See All</Link>
      </div>
      
      {/* Single note card with fixed content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          background: 'rgba(0,0,0,0.12)',
          borderRadius: '16px',
          padding: '16px',
          width: '100%',
          height: '140px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: '1px solid rgba(255,255,255,0.12)',
        }}>
          {loading ? (
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>Loading notes...</div>
          ) : notes.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>No notes found</div>
          ) : (
            <>
              <div
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 300,
                  fontSize: '12px',
                  lineHeight: '100%',
                  color: '#FFFFFF',
                  verticalAlign: 'middle',
                  letterSpacing: 0,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-word',
                  maxHeight: 'calc(3 * 1em)',
                }}
                dangerouslySetInnerHTML={{ __html: notes[0]?.content || notes[0]?.title || "The beginning of Screen less design: UI Job to be taken over by solution Architect" }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px' }}>
                <span style={{
                  fontFamily: 'Inter',
                  fontWeight: 300,
                  fontSize: '12px',
                  lineHeight: '100%',
                  color: '#FFFFFF',
                  verticalAlign: 'middle',
                  letterSpacing: 0,
                }}>
                  {formatDate(notes[0]?.lastModified || notes[0]?.updatedAt || notes[0]?.createdAt || "May/21/2020")}
                </span>
                <button style={{ padding: '4px', color: '#FFFFFF', background: 'none', border: 'none', cursor: 'pointer' }}>
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

