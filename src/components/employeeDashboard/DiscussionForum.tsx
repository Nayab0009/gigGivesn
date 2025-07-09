"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Plus, ArrowLeft, User, Clock } from "lucide-react"
import { colors } from "@/colors"
import { useAuth } from "@/context/AuthContext"
import {
  createDiscussion,
  getDiscussions,
  createDiscussionComment,
  getDiscussionComments,
} from "@/lib/DiscussionService"

// Type definitions for backend discussions
type Discussion = {
  id: number
  title: string
  description: string
  discussionBy: {
    id: number
    name:string
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ForumPage() {
  const { user, isAuthenticated } = useAuth()
  const [threads, setThreads] = useState<Discussion[]>([])
  const [showNewThreadForm, setShowNewThreadForm] = useState(false)
  const [newThreadTitle, setNewThreadTitle] = useState("")
  const [newThreadContent, setNewThreadContent] = useState("")
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null)
  const [newCommentContent, setNewCommentContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCommentLoading, setIsCommentLoading] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)

  // Fetch discussions from backend using service
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        console.log("Fetching discussions...") // Debug log
        const response = await getDiscussions()
        console.log("Response:", response) // Debug log
        // Handle different response structures
        const discussionsData = response?.data || response || []
        setThreads(Array.isArray(discussionsData) ? discussionsData.reverse() : [])
      } catch (err) {
        console.error("Failed to fetch discussions", err)
        // Set empty array on error to prevent crashes
        setThreads([])
      }
    }
    fetchDiscussions()
  }, [])

  // Fetch comments when a thread is selected
  useEffect(() => {
    if (selectedThreadId !== null) {
      setIsCommentsLoading(true)
      getDiscussionComments(selectedThreadId)
        .then((data) => setComments(Array.isArray(data) ? data : []))
        .catch(() => setComments([]))
        .finally(() => setIsCommentsLoading(false))
    } else {
      setComments([])
    }
  }, [selectedThreadId])

  // Handler for adding new thread
  const handleAddThread = async () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return
    if (!isAuthenticated || !user?.id) {
      alert("You must be logged in to post a discussion.")
      return
    }
    setIsLoading(true)
    try {
      const discussionData = {
        title: newThreadTitle,
        description: newThreadContent,
      }
      console.log("Creating discussion:", discussionData) // Debug log
      const newDiscussion = await createDiscussion(discussionData)
      console.log("New discussion created:", newDiscussion) // Debug log
      // Add the new discussion to the top of the list
      setThreads([newDiscussion, ...threads])
      // Reset form
      setNewThreadTitle("")
      setNewThreadContent("")
      setShowNewThreadForm(false)
    } catch (error) {
      console.error("Failed to create discussion:", error)
      alert("Failed to create discussion. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Post comment to backend
  const handleAddComment = async (threadId: number) => {
    if (!newCommentContent.trim()) return
    if (!isAuthenticated || !user) {
      alert("You must be logged in to comment.")
      return
    }
    setIsCommentLoading(true)
    try {
      await createDiscussionComment({ comment: newCommentContent, discussion: threadId })
      setNewCommentContent("")
      // Refresh comments for this thread
      const data = await getDiscussionComments(threadId)
      setComments(Array.isArray(data) ? data : [])
    } catch (error) {
      alert("Failed to post comment. Please try again.")
    } finally {
      setIsCommentLoading(false)
    }
  }

  const selectedThread = threads.find((t) => t.id === selectedThreadId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="relative inline-block">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4 tracking-tight">
              Discussion Forum
            </h1>
            <div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 rounded-full"
              style={{ backgroundColor: colors.primary.hex }}
            ></div>
          </div>
          <p className="text-xl text-gray-600 mt-6 font-medium max-w-2xl mx-auto leading-relaxed">
            Connect, collaborate, and share ideas with your team
          </p>
          {user && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent.hex }}></div>
              <span className="text-sm font-semibold text-gray-700">Welcome, {user.name}</span>
              <span
                className="text-xs px-2 py-1 rounded-full text-white font-medium"
                style={{ backgroundColor: colors.secondary.hex }}
              >
                {user.role}
              </span>
            </div>
          )}
        </div>

        {/* Authentication Check */}
        {!isAuthenticated ? (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-8 mb-10 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-amber-100">
                <User size={24} className="text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-amber-800">Authentication Required</h3>
            </div>
            <p className="text-amber-700 text-lg leading-relaxed">
              You need to be logged in to participate in discussions. Please sign in to continue.
            </p>
          </div>
        ) : (
          <>
            {/* New Thread Button */}
            <div className="mb-8 flex justify-center">
              <button
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary.hex} 0%, ${colors.secondary.hex} 100%)`,
                }}
                onClick={() => setShowNewThreadForm(!showNewThreadForm)}
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Plus size={24} className="relative z-10" />
                <span className="relative z-10">{showNewThreadForm ? "Cancel" : "Start New Discussion"}</span>
              </button>
            </div>

            {/* New Thread Form */}
            {showNewThreadForm && (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 mb-10 border border-gray-200 relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r"
                  style={{
                    background: `linear-gradient(90deg, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
                  }}
                ></div>

                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Create New Discussion</h2>

                {/* Title Input */}
                <div className="mb-8">
                  <label className="block text-lg font-bold text-gray-800 mb-3">Title</label>
                  <input
                    type="text"
                    placeholder="Enter discussion title..."
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-transparent focus:ring-4 focus:ring-opacity-30 transition-all duration-300 text-lg font-medium bg-white/80 backdrop-blur-sm shadow-sm"
                    style={{ focusRingColor: colors.primary.hex + "30" }}
                    disabled={isLoading}
                  />
                </div>

                {/* Content Textarea */}
                <div className="mb-8">
                  <label className="block text-lg font-bold text-gray-800 mb-3">Description</label>
                  <textarea
                    placeholder="Share your thoughts, questions, or ideas..."
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    rows={6}
                    className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-transparent focus:ring-4 focus:ring-opacity-30 transition-all duration-300 resize-none text-lg leading-relaxed bg-white/80 backdrop-blur-sm shadow-sm"
                    style={{ focusRingColor: colors.primary.hex + "30" }}
                    disabled={isLoading}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleAddThread}
                    disabled={isLoading || !newThreadTitle.trim() || !newThreadContent.trim()}
                    className="group relative px-10 py-4 rounded-2xl font-bold text-white text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${colors.secondary.hex} 0%, ${colors.accent.hex} 100%)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative z-10">{isLoading ? "Posting..." : "Post Discussion"}</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Thread List */}
        {selectedThreadId === null && (
          <div className="space-y-8">
            {threads.length === 0 ? (
              <div className="text-center py-20">
                <div className="relative inline-block mb-6">
                  <MessageCircle size={80} className="text-gray-300" />
                  <div
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full animate-pulse"
                    style={{ backgroundColor: colors.accent.hex }}
                  ></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-500 mb-3">No discussions yet</h3>
                <p className="text-gray-400 text-lg">
                  {isAuthenticated
                    ? "Be the first to start a discussion!"
                    : "Sign in to view and participate in discussions."}
                </p>
              </div>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-200 overflow-hidden transform hover:-translate-y-2 hover:scale-[1.02]"
                  onClick={() => setSelectedThreadId(thread.id)}
                >
                  <div className="p-8 relative">
                    <div
                      className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: `linear-gradient(90deg, ${colors.primary.hex}, ${colors.secondary.hex})` }}
                    ></div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {thread.title}
                    </h3>

                    {/* Author */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors duration-300">
                        <User size={16} className="text-gray-500 group-hover:text-blue-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                        Started by {thread.discussionBy?.name || "Unknown"}
                      </span>
                    </div>

                    {/* Content Preview */}
                    <p className="text-gray-700 mb-6 line-clamp-2 text-lg leading-relaxed">{thread.description}</p>

                    {/* Comments Count */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300">
                          <MessageCircle size={18} style={{ color: colors.accent.hex }} />
                          <span style={{ color: colors.accent.hex }} className="font-bold text-sm">
                            {(thread as any).comments?.length || 0}{" "}
                            {(thread as any).comments?.length === 1 ? "comment" : "comments"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 px-3 py-2 rounded-full bg-gray-50">
                        <Clock size={16} />
                        <span className="font-medium">{new Date(thread.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Single Thread View */}
        {selectedThreadId !== null && selectedThread && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Back Button */}
            <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
              <button
                className="group inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                style={{
                  color: colors.primary.hex,
                  backgroundColor: colors.primary.hex + "10",
                }}
                onClick={() => setSelectedThreadId(null)}
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
                <span>Back to discussions</span>
              </button>
            </div>

            {/* Thread Header */}
            <div className="p-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">{selectedThread.title}</h2>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-full bg-gray-100">
                  <User size={24} className="text-gray-600" />
                </div>
                <span className="text-xl font-semibold text-gray-700">
                  {selectedThread.discussionBy?.name || "Unknown"}
                </span>
              </div>
              <div className="prose prose-xl max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">{selectedThread.description}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-6 px-4 py-2 rounded-full bg-gray-50 inline-flex">
                <Clock size={16} />
                <span className="font-medium">{new Date(selectedThread.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t border-gray-200 p-10 bg-gradient-to-b from-white to-gray-50">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-full" style={{ backgroundColor: colors.primary.hex + "20" }}>
                  <MessageCircle size={28} style={{ color: colors.primary.hex }} />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">
                  Comments {comments.length > 0 ? `(${comments.length})` : ""}
                </h3>
              </div>

              {/* Comments List */}
              <div className="space-y-6 mb-10">
                {isCommentsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500 text-lg">Loading comments...</p>
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment: any) => (
                    <div
                      key={comment.id}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-full bg-gray-100">
                          <User size={18} className="text-gray-600" />
                        </div>
                        <span className="font-bold text-gray-900 text-lg">
                          {comment.commentedBy?.name ||
                            "Unknown"}
                        </span>
                        {comment.createdAt && (
                          <span className="text-sm text-gray-500 ml-auto px-3 py-1 rounded-full bg-gray-100 font-medium">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {comment.comment || comment.content || ""}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <MessageCircle size={64} className="text-gray-300 mx-auto mb-6" />
                    <p className="text-gray-500 text-xl font-medium">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  </div>
                )}
              </div>

              {/* Add Comment Form - Only show if authenticated */}
              {isAuthenticated ? (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border-2 border-gray-200 shadow-lg">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6">Add a comment</h4>
                  <textarea
                    placeholder="Share your thoughts..."
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    rows={5}
                    className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-transparent focus:ring-4 focus:ring-opacity-30 transition-all duration-300 resize-none mb-6 text-lg leading-relaxed bg-white/80 backdrop-blur-sm"
                    style={{ focusRingColor: colors.primary.hex + "30" }}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleAddComment(selectedThread.id)}
                      disabled={!newCommentContent.trim() || isCommentLoading}
                      className="group relative px-8 py-4 rounded-2xl font-bold text-white text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary.hex} 0%, ${colors.secondary.hex} 100%)`,
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <span className="relative z-10">{isCommentLoading ? "Posting..." : "Post Comment"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-10 border-2 border-gray-200 text-center">
                  <div className="p-4 rounded-full bg-white inline-block mb-4 shadow-sm">
                    <User size={40} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-xl font-semibold">Please sign in to add a comment</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
