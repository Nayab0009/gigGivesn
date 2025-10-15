"use client"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns";

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
    avatar: string
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
    console.log("Creating discussion:", discussionData)

    const newDiscussion = await createDiscussion(discussionData)

    // Enrich the object with local user + timestamp
    const enrichedDiscussion = {
      ...newDiscussion,
      discussionBy: {
        id: user.id,
        name: user.name,
        avatar: user.avatar || "/images/user.svg",
      },
      createdAt: new Date().toISOString(),
    }

    // Add to state instantly
    setThreads([enrichedDiscussion, ...threads])

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
  <div  className="relative top-[40px] left-1/2 transform -translate-x-1/2 w-full   min-h-[calc(100vh-160px)] overflow-y-auto hide-scrollbar -mt-3">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between opacity-100 mx-auto">
        <div className="flex flex-col justify-leftye sp">
          <h1 className="font-inter font-semibold text-[20px] leading-[28px] text-text-main align-middle mb-1">Discussion Forum</h1>
          <p className="font-inter font-normal text-[14px] leading-[20px] text-text-secondary align-middle">Connect, collaborate & share ideas with your team</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Start New Discussion Button */}
          {isAuthenticated && (
            <button
              className="group relative inline-flex items-center gap-3 font-bold text-white text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 overflow-hidden rounded-lg opacity-100 px-4 py-2"
              style={{
                background: `linear-gradient(135deg, ${colors.primary.hex} 0%, ${colors.secondary.hex} 100%)`,
              }}
              onClick={() => setShowNewThreadForm(!showNewThreadForm)}
              disabled={isLoading}
            >
             <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
<span className="relative z-10 font-inter font-medium text-[14px] leading-[20px] text-center align-middle">
  {showNewThreadForm ? "Cancel" : "Start New"}
</span>

{/* Only show Plus icon if not in Cancel mode */}
{!showNewThreadForm && (
  <Plus size={24} className="relative z-10" />
)}
            </button>
          )}
        </div>
      </div>

      <div className="relative rounded-[20px] ml-2 [box-shadow:var(--shadow-combined)]  [border:var(--border-style)] p-[30px] gap-[20px]  [background:var(--container-bg)] opacity-100 mx-auto">
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
            {/* New Thread Form */}
            {showNewThreadForm && (
              <div
                className="rounded-[15px]  [box-shadow:var(--shadow-combined)]  [background:var(--form-bg)]  backdrop-blur-xl rounded-3xl [border:var(--border-style)] p-10 mb-10 relative overflow-hidden shadow-2xl bg-["
                style={{
                  color: '#fff',
                }}
              >
                <div
                  className="absolute top-0 left-0 w-full h-1"

                ></div>

                <h2 className="text-3xl font-bold mb-8 text-center text-text-main">Create New Discussion</h2>

                {/* Title Input */}
                <div className="mb-8">
                  <label className="block text-lg font-bold mb-3 text-text-main" >Title</label>
                  <input
                    type="text"
                    placeholder="Enter discussion title..."
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    className="w-full px-6 py-4 rounded-xl border-2 border-white/20 focus:border-transparent focus:ring-4 focus:ring-opacity-30 transition-all duration-300 text-lg font-medium [background:var(--field-bg)] text-white placeholder-gray-300 shadow-sm"
                    style={{ focusRingColor: colors.primary.hex + '30' }}
                    disabled={isLoading}
                  />
                </div>

                {/* Content Textarea */}
                <div className="mb-8">
                  <label className="block text-lg font-bold mb-3 text-text-main" >Description</label>
                  <textarea
                    placeholder="Share your thoughts, questions, or ideas..."
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    rows={6}
                    className="w-full px-6 py-4 rounded-xl border-2 border-white/20 focus:border-transparent focus:ring-4 focus:ring-opacity-30 transition-all duration-300 resize-none text-lg leading-relaxed [background:var(--field-bg)] text-white placeholder-gray-300 shadow-sm"
                    style={{ focusRingColor: colors.primary.hex + '30' }}
                    disabled={isLoading}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleAddThread}
                    disabled={isLoading || !newThreadTitle.trim() || !newThreadContent.trim()}
                    className="group relative px-10 py-4 bg-[#0CA9F6] rounded-2xl font-bold text-white text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"

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
                  <MessageCircle size={80} className="text-text-main" />
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
                  className="group cursor-pointer overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] mb-6 w-full  [background:var(--container-bg)] rounded-[15px] [box-shadow:var(--shadow-combined)]  [border:var(--border-style)]"
                  onClick={() => setSelectedThreadId(thread.id)}
                >
                  <div className="p-8 relative h-full flex flex-col justify-between min-h-[182px]">

                    {/* Author */}
                    <div className="flex items-start gap-5 mb-5">
                      <div className="h-12 w-12 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors duration-300">
                        <Image className="rounded-full object-cover w-full h-full" src={thread.discussionBy?.avatar || "/images/user.svg"} alt="User" width={30} height={30} />
                      </div>
                      <div className="flex flex-col gap-y-2">
                      <div className=" font-inter font-normal text-[13px] leading-[1] tracking-[0.05em] text-text-main group-hover:text-gray-100 transition-colors duration-300 ">
                       {thread.discussionBy?.name || "Unknown"}

                      </div>
                      <div><p className="text-[#808080] font-light text-xs">
                        {/* {new Date(thread.createdAt).toLocaleString()} */}
                        {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                        </p></div>
                      </div>
                    </div>

                    {/* Thread title */}
                    <h3
                      className="font-inter font-bold text-[14px] leading-[1] tracking-[0.05em] align-middle text-[#0CA9F6] transition-all duration-300"
                    >
                      {thread.title}
                    </h3>

                    {/* Content Preview */}
                    <p className="text-sm my-2 text-text-secondary mb-1 font-light">{thread.description}</p>

                    {/* Comments Count */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-2 px-6 py-1 rounded-full bg-gray-200/15 group-hover:bg-blue-50/30 transition-colors  ">
                          <Image src="/images/msgIcon.svg" alt="Comments" width={18} height={18}   className="text-[var(--dropdown-icon-color)]"
/>
                          <span className="font-light text-sm text-text-main">
                            {(thread as any).comments?.length || 0} {" "}
                            {(thread as any).comments?.length === 1}
                          </span>
                        </div>
                      </div>
                      {/* <div className="flex items-center gap-2 text-sm text-gray-200 px-3 py-2 rounded-full bg-gray-50/10">
                        <Clock size={16} />
                        <span className="font-medium">{new Date(thread.createdAt).toLocaleString()}</span>
                      </div> */}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Single Thread View */}
        {selectedThreadId !== null && selectedThread && (
          <div
            className="rounded-[15px] [box-shadow:var(--shadow-combined)]  [border:var(--border-style)]  overflow-hidden  [background:var(--container-bg)]"
            style={{
             
              color: '#fff',
            }}
          >
            {/* Back Button */}
            <div className="p-8 border-b border-white/20  [background:var(--container-bg)]">
              <button
                className="group text-text-main inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-bold  transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: colors.primary.hex + '10',
                }}
                onClick={() => setSelectedThreadId(null)}
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
                <span>Back to discussions</span>
              </button>
            </div>

            {/* Thread Header */}
            <div className="p-10">
              {/* Author */}
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors duration-300">
                  <User size={35} className="text-gray-500 group-hover:text-blue-600" />
                </div>
                <span className="font-inter font-normal text-[18px] leading-[1] tracking-[0.05em] align-middle text-text-secondary group-hover:text-gray-100 transition-colors duration-300">
                  Started by {selectedThread.discussionBy?.name || "Unknown"}
                </span>
              </div>
              {/* Title */}
              <h3
                className="font-inter font-bold text-[20px] leading-[1] tracking-[0.05em] align-middle mb-4 text-[#0CA9F6] transition-all duration-300"
              >
                {selectedThread.title}
              </h3>
              {/* Description */}
              <p className="font-inter font-light text-[16px] leading-[25px] tracking-[0.05em] text-text-secondary mb-6">
                {selectedThread.description}
              </p>
              <div className="flex items-center gap-2 text-[12px] text-sm mt-6 px-4 py-2 rounded-full text-text-main inline-flex">
                <Clock size={16} />
                <span className="font-medium">{new Date(selectedThread.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t border-white/20 p-10 [background:var(--container-bg)]">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-full bg-white/10">
                  <MessageCircle size={28} className="text-text-main" />
                </div>
                <h3 className="text-3xl font-bold text-text-main" >
                  Comments {comments.length > 0 ? `(${comments.length})` : ""}
                </h3>
              </div>

              {/* Comments List */}
              <div className="space-y-6 mb-10">
                {isCommentsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-white border-t-[#0CA9F6] rounded-full mx-auto mb-4"></div>
                    <p className="text-text-secondary text-lg">Loading comments...</p>
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment: any) => (
                    <div
                      key={comment.id}
                      className="bg-black/30 rounded-2xl p-8 border border-white/20 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-full bg-white/10">
                          <User size={18} className="text-[#0CA9F6]" />
                        </div>
                        <span className="font-bold text-lg" style={{ color: '#fff' }}>
                          {comment.commentedBy?.name || "Unknown"}
                        </span>
                        {comment.createdAt && (
                          <span className="text-sm ml-auto px-3 py-1 rounded-full bg-white/10 font-medium" style={{ color: '#fff' }}>
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="leading-relaxed text-lg" style={{ color: '#fff' }}>
                        {comment.comment || comment.content || ""}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <MessageCircle size={64} className="text-text-main  mx-auto mb-6" />
                    <p className="text-text-secondary text-xl font-medium">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  </div>
                )}
              </div>

              {/* Add Comment Form - Only show if authenticated */}
              {isAuthenticated ? (
                <div className="[background:var(--container-bg)] rounded-2xl p-8 border-2 border-white/20 shadow-lg">
                  <h4 className="text-2xl font-bold mb-6 text-text-main" >Add a comment</h4>
                  <textarea
                    placeholder="Share your thoughts..."
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    rows={5}
                    className="w-full px-6 py-4 rounded-xl border-2 border-white/20 [background:var(--field-bg)] focus:border-transparent focus:ring-4 focus:ring-opacity-30 transition-all duration-300 resize-none mb-6 text-lg leading-relaxed background:var(--container-bg)]  text-white placeholder-gray-300"
                    style={{ focusRingColor: colors.primary.hex + '30' }}
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
                <div className="bg-black/30 rounded-2xl p-10 border-2 border-white/20 text-center">
                  <div className="p-4 rounded-full bg-white/10 inline-block mb-4 shadow-sm">
                    <User size={40} className="text-[#0CA9F6]" />
                  </div>
                  <p className="text-white text-xl font-semibold">Please sign in to add a comment</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}