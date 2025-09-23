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
              // createdBy: user.id, // Pass the current user's ID

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
  const textClass = isDarkMode ? "text-white" : "text-white"
  const mutedTextClass = isDarkMode ? "text-gray-400" : "text-gray-500"

  return (
    <div className={`min-h-screen transition-all duration-300 ${themeClass} bg-transparent `}>


{/* Header Searchbar */}
<div className="bg-black/30 backdrop-blur-md py-6 px-9 rounded-4xl border-[1px] my-5 border-gray-500 text-white mx-4">
  <div className="flex flex-row items-center gap-4">
    <div className="relative group flex-grow">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white  transition-colors" />
      <input
        type="text"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-12 pr-4 py-3 rounded-4xl dark:border-gray-600/50 border-none transition-all duration-200 placeholder:text-white/40 w-full bg-black/30 backdrop-blur-md outline-none focus:ring-1 focus:ring-gray-500 focus:border-none"
      />
    </div>
    <button
      onClick={handleAddNote}
      className="flex items-center gap-2 px-4 py-2 bg-[#0CA9F6] text-white text-sm rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
    >
      <Plus className="w-4 h-4" />
      New Note
    </button>
  </div>
</div>




      <div className="flex flex-col md:flex-row bg-black/30 backdrop-blur-md py-6 px-4 md:px-9 rounded-4xl border-[1px] my-5 border-gray-500 text-white mx-4">
        {/* Sidebar */}
        <aside className={`w-full md:w-80 flex flex-col transition-all duration-300 bg-none`}>

          {/* Notes List */}
          <div className="flex-1">
            <div className="space-y-3 mr-0 md:mr-4 mb-4 md:mb-0">
              {filteredNotes.map((note: any) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`group cursor-pointer p-5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 ${
                    note.id === selectedNoteId
                      ? "bg-[#00000083] text-white shadow-md border-l-4 border-[#0CA9F6]"
                      : `bg-black/30 backdrop-blur-md border-none text-white hover:bg-black/40 hover:shadow-md`
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`font-semibold text-base ${textClass} transition-colors truncate pr-2 flex-1`}
                      >
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">

                      </div>
                    </div>
                    <div className={`mt-1.5 text-xs text-white/65 ${mutedTextClass} line-clamp-2 overflow-hidden`}>
                      {/* Strip HTML tags for preview */}
                      {note.content.replace(/<[^>]*>?/gm, '').substring(0, 120)}
                      {note.content.replace(/<[^>]*>?/gm, '').length > 120 ? '...' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
        {/* Main Editor */}
        <main className="flex-1 flex flex-col border-[1px] border-grey-50/50 rounded-2xl dark:hover:bg-gray-700/20 bg-black/15 backdrop-blur-md border-gray-500">

          {/* Enhanced Toolbar */}
          <div className={`border-gray-200 dark:border-gray-700 px-3 md:px-6 py-3 overflow-x-auto`}>
            <div className="flex flex-wrap md:flex-nowrap items-center gap-1 justify-between">
              {/* Text Formatting */}
              <div className="flex flex-wrap md:flex-nowrap">
                <div className="flex items-center gap-1 dark:border-gray-700 mb-2 md:mb-0">
                  <button
                    onClick={() => handleCommand("bold")}
                    className={`p-2 hover:bg-transparent dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCommand("italic")}
                    className={`p-2 hover:bg-transparent dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCommand("underline")}
                    className={`p-2 hover:bg-transparent dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                </div>
                {/* Lists */}
                <div className="flex items-center gap-1 dark:border-gray-700 mb-2 md:mb-0 ml-0 md:ml-2">
                  <button
                    onClick={() => handleCommand("insertUnorderedList")}
                    className={`p-2 hover:bg-transparent dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCommand("insertOrderedList")}
                    className={`p-2 hover:bg-transparent dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                </div>
                {/* Alignment */}
                <div className="flex items-center gap-1 dark:border-gray-700 mb-2 md:mb-0 ml-0 md:ml-2">
                  <button
                    onClick={() => handleCommand("justifyLeft")}
                    className={`p-2 hover:bg-transparent dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                    title="Align Left"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCommand("justifyCenter")}
                    className={`p-2 hover:bg-transparent dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                    title="Align Center"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCommand("justifyRight")}
                    className={`p-2 hover:bg-transparent dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                    title="Align Right"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                </div>
                {/* Special Elements */}
                <div className="flex items-center gap-1 ml-0 md:ml-2">
                  <button
                    onClick={() => handleCommand("formatBlock", "blockquote")}
                    className={`p-2 hover:bg-transparent dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                    title="Quote"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCommand("formatBlock", "h2")}
                    className={`p-2 hover:bg-transparent dark:hover:bg-gray-700 rounded-lg transition-colors ${textClass}`}
                    title="Heading"
                  >
                    <Type className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 md:mt-0 w-full md:w-auto md:justify-end">
                <button
                  onClick={handleSave}
                  className="save-btn flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-all shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>

                <button
                  onClick={handleDeleteNote}
                  className="p-2 hover:bg-red-900 bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          {/* Editor Area */}
          <div className="flex-1">
            <div className="mx-auto">
               <header className={`px-3 md:px-6 py-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-4 flex-1">
                    {isEditingTitle ? (
                      <input
                        ref={titleInputRef}
                        type="text"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onBlur={handleTitleSave}
                        onKeyDown={handleTitleKeyDown}
                        className={`text-lg md:text-2xl font-bold bg-transparent border-none outline-none ${textClass} flex-1`}
                      />
                    ) : (
                      <h1
                        onClick={handleTitleEdit}
                        className={`text-lg md:text-2xl font-bold cursor-pointer transition-colors ${textClass} flex-1 break-words`}
                      >
                        {selectedNote?.title}
                      </h1>
                    )}
                  </div>
                </div>
              </header>
              <div
                ref={editorRef}
                className={`min-h-[300px] md:min-h-[500px] p-3 md:p-6 md:px-6 pt-0 focus:border-transparent outline-none transition-all text-white overflow-auto`}
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
        </main>
      </div>
    </div>
  )
}

export default ProfessionalNotesEditor
