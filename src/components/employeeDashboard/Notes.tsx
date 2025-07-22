"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Save,
  Plus,
  Search,
  FileText,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Type,
  Sun,
  Moon,
  Download,
  Share,
  Trash2,
  Edit3,
} from "lucide-react"
import { addNote, getNotes, updateNote, deleteNote, type Notespayload } from "@/lib/notesService"
import { useAuth } from "@/context/AuthContext" // Import useAuth

const ProfessionalNotesEditor = () => {
  const { user } = useAuth() // Get user from AuthContext
  const [notes, setNotes] = useState<any[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState("")
  const editorRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Load notes from backend
  useEffect(() => {
    ;(async () => {
      try {
        // If you want to filter notes by the logged-in user,
        // you would pass user.id to getNotes here,
        // and modify getNotes in notesService.ts to accept it.
        const fetchedNotes = await getNotes()
        setNotes(fetchedNotes)
        if (fetchedNotes.length) setSelectedNoteId(fetchedNotes[0].id)
      } catch (err) {
        console.error("Failed to fetch notes:", err)
      }
    })()
  }, [])

  // For search
  const filteredNotes = notes.filter(
    (note: any) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedNote = notes.find((note: any) => note.id === selectedNoteId)

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])

  // Add a new note via API
  const handleAddNote = async () => {
    if (!user?.id) {
      console.error("User not logged in. Cannot add note.")
      // Optionally, show a user-friendly message or redirect to login
      return
    }

    try {
      const payload: Notespayload = {
        title: "Untitled Document",
        content: "<p>i am fixing the 500 internal server error</p>", // Updated default content
        createdBy: user.id, // Pass the current user's ID
      }
      const newNote = await addNote(payload)
      setNotes([newNote, ...notes])
      setSelectedNoteId(newNote.id)
    } catch (err) {
      console.error("Failed to add note:", err)
    }
  }

  // Save (update) the current note
  const handleSave = async () => {
    if (!selectedNote) return
    const updatedContent = editorRef.current?.innerHTML || ""
    const now = new Date().toISOString()

    try {
      // Send update to backend
      await updateNote(selectedNote.id, {
        title: selectedNote.title, // Add this line to include the current title
        content: updatedContent,
        // Removed: lastModified: now,
      })

      // Update local state after successful backend update
      const updatedNotes = notes.map((note: any) =>
        note.id === selectedNoteId ? { ...note, content: updatedContent, lastModified: now } : note,
      )
      setNotes(updatedNotes)

      // UI feedback
      const saveBtn = document.querySelector(".save-btn")
      saveBtn?.classList.add("bg-emerald-600")
      setTimeout(() => saveBtn?.classList.remove("bg-emerald-600"), 300)
    } catch (err) {
      console.error("Failed to save note:", err)
      // Optionally, revert UI or show error message
    }
  }

  // Edit note title (local and backend update)
  const handleTitleEdit = () => {
    if (selectedNote) {
      setTempTitle(selectedNote.title)
      setIsEditingTitle(true)
    }
  }

  const handleTitleSave = async () => {
    if (tempTitle.trim() && selectedNote) {
      const newTitle = tempTitle.trim()
      try {
        // Send update to backend
        await updateNote(selectedNote.id, { title: newTitle })

        // Update local state after successful backend update
        const updatedNotes = notes.map((note: any) =>
          note.id === selectedNoteId ? { ...note, title: newTitle } : note,
        )
        setNotes(updatedNotes)
      } catch (err) {
        console.error("Failed to update note title:", err)
        // Optionally, revert UI or show error message
      }
    }
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave()
    } else if (e.key === "Escape") {
      setIsEditingTitle(false)
    }
  }

  // Delete note (local and backend delete)
  const handleDeleteNote = async () => {
    if (!selectedNote) return

    try {
      // Send delete to backend
      await deleteNote(selectedNote.id)

      // Update local state after successful backend delete
      const updatedNotes = notes.filter((note: any) => note.id !== selectedNoteId)
      setNotes(updatedNotes)
      setSelectedNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null)
    } catch (err) {
      console.error("Failed to delete note:", err)
      // Optionally, revert UI or show error message
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  const handleCommand = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value)
    editorRef.current?.focus()
  }

  const themeClass = isDarkMode ? "dark bg-gray-900" : "bg-gray-50"
  const cardClass = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
  const textClass = isDarkMode ? "text-gray-100" : "text-gray-900"
  const mutedTextClass = isDarkMode ? "text-gray-400" : "text-gray-500"

  return (
    <div className={`min-h-screen transition-all duration-300 ${themeClass}`}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className={`w-80 ${cardClass} border-r shadow-xl flex flex-col transition-all duration-300`}>
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <h1
                  className={`text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
                >
                  ProNotes
                </h1>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2.5 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-all duration-200 ${textClass}`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200/50 dark:border-gray-600/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${cardClass} ${textClass} placeholder:text-gray-400`}
              />
            </div>
          </div>
          {/* Notes List */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <span className={`text-sm font-semibold ${mutedTextClass} tracking-wide uppercase`}>
                {filteredNotes.length} Documents
              </span>
              <button
                onClick={handleAddNote}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                New Note
              </button>
            </div>
            <div className="space-y-2">
              {filteredNotes.map((note: any) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`group cursor-pointer p-4 rounded-xl transition-all duration-200 border hover:shadow-md hover:-translate-y-0.5 ${
                    note.id === selectedNoteId
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 border-blue-200 dark:border-blue-700 shadow-sm"
                      : `hover:bg-gray-50/50 dark:hover:bg-gray-700/20 border-gray-200/20 dark:border-gray-700/20 ${cardClass}`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-semibold text-sm ${textClass} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate pr-2 flex-1`}
                    >
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs ${mutedTextClass}`}>{formatDate(note.lastModified)}</span>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          note.id === selectedNoteId
                            ? "bg-blue-100 dark:bg-blue-800/50"
                            : "bg-gray-100/50 dark:bg-gray-700/50 group-hover:bg-blue-100/50 dark:group-hover:bg-blue-800/30"
                        } transition-all duration-200`}
                      >
                        <FileText
                          className={`w-3.5 h-3.5 ${
                            note.id === selectedNoteId
                              ? "text-blue-600 dark:text-blue-400"
                              : `${mutedTextClass} group-hover:text-blue-500`
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
        {/* Main Editor */}
        <main className="flex-1 flex flex-col">
          <header className={`${cardClass} border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={handleTitleKeyDown}
                    className={`text-2xl font-bold bg-transparent border-none outline-none ${textClass} flex-1`}
                  />
                ) : (
                  <h1
                    onClick={handleTitleEdit}
                    className={`text-2xl font-bold cursor-pointer hover:text-blue-600 transition-colors ${textClass} flex-1`}
                  >
                    {selectedNote?.title}
                  </h1>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className="save-btn flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-all shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                >
                  <Share className="w-4 h-4" />
                </button>
                <button
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeleteNote}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>
          {/* Enhanced Toolbar */}
          <div className={`${cardClass} border-b border-gray-200 dark:border-gray-700 px-6 py-3`}>
            <div className="flex items-center gap-1">
              {/* Text Formatting */}
              <div className="flex items-center gap-1 pr-3 border-r border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleCommand("bold")}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCommand("italic")}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCommand("underline")}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                  title="Underline"
                >
                  <Underline className="w-4 h-4" />
                </button>
              </div>
              {/* Lists */}
              <div className="flex items-center gap-1 px-3 border-r border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleCommand("insertUnorderedList")}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCommand("insertOrderedList")}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
              </div>
              {/* Alignment */}
              <div className="flex items-center gap-1 px-3 border-r border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleCommand("justifyLeft")}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCommand("justifyCenter")}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCommand("justifyRight")}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
              {/* Special Elements */}
              <div className="flex items-center gap-1 px-3">
                <button
                  onClick={() => handleCommand("formatBlock", "blockquote")}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                  title="Quote"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCommand("formatBlock", "h2")}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                  title="Heading"
                >
                  <Type className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          {/* Editor Area */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div
                ref={editorRef}
                className={`min-h-[500px] p-8 rounded-2xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm ${cardClass} ${textClass}`}
                contentEditable
                dangerouslySetInnerHTML={{ __html: selectedNote?.content || "" }}
                style={{
                  lineHeight: "1.8",
                  fontSize: "16px",
                  fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
                }}
              />
            </div>
          </div>
          {/* Status Bar */}
          <footer className={`${cardClass} border-t border-gray-200 dark:border-gray-700 px-6 py-3`}>
            <div className="flex items-center justify-between text-sm">
              <div className={`flex items-center gap-4 ${mutedTextClass}`}>
                <span>Last saved: {selectedNote ? formatDate(selectedNote.lastModified) : "Never"}</span>
                <span>•</span>
                <span>Words: {selectedNote ? selectedNote.content.replace(/<[^>]*>/g, "").split(" ").length : 0}</span>
              </div>
              <div className={`flex items-center gap-2 ${mutedTextClass}`}>
                <span>Ready</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}

export default ProfessionalNotesEditor
