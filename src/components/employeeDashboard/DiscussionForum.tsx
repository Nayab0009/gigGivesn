'use client'
import { useState } from "react";
import { MessageCircle, Plus, ArrowLeft, User, Clock } from "lucide-react";

// Color palette
const colors = {
  primary: {
    hex: "#015f82",
    rgb: "rgba(1,95,130,1)",
  },
  secondary: {
    hex: "#1a7094",
    rgb: "rgba(26,112,148,1)",
  },
  accent: {
    hex: "#65cdec",
    rgb: "rgba(101,205,236,1)",
  },
  highlight: {
    hex: "#ffe26f",
    rgb: "rgba(255,226,111,1)",
  },
  warning: {
    hex: "#ae7200",
    rgb: "rgba(174,114,0,1)",
  },
};

export default function ForumPage() {
  // Simulated forum data
  const [threads, setThreads] = useState([
    {
      id: 1,
      title: "Project Updates & Milestone Review",
      author: "Sarah Johnson",
      content: "Here are the latest updates on our Q3 projects. We've made significant progress on the dashboard redesign and the API integration is nearly complete. I'd love to get everyone's feedback on the next steps.",
      comments: [
        { id: 1, author: "Mike Chen", content: "Thanks for the comprehensive update! The dashboard looks fantastic." },
        { id: 2, author: "Admin", content: "Great work team. Let's schedule a review meeting for next week." },
      ],
      createdAt: "2 hours ago",
      category: "Updates"
    },
    {
      id: 2,
      title: "Dashboard Bug Report - Urgent",
      author: "Alex Rodriguez",
      content: "I'm encountering a critical bug on the dashboard when trying to export reports. The system freezes and throws a 500 error. Has anyone else experienced this issue?",
      comments: [
        { id: 1, author: "Emma Thompson", content: "Yes, I've seen this too. It seems to happen with large datasets." },
      ],
      createdAt: "4 hours ago",
      category: "Bug Report"
    },
    {
      id: 3,
      title: "Feature Request: Dark Mode Support",
      author: "Jordan Kim",
      content: "Would love to see dark mode support added to the platform. Many users have been requesting this feature for better accessibility and reduced eye strain during long work sessions.",
      comments: [],
      createdAt: "1 day ago",
      category: "Feature Request"
    },
  ]);

  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [newThreadCategory, setNewThreadCategory] = useState("Discussion");
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [newCommentContent, setNewCommentContent] = useState("");

  // Handlers
  const handleAddThread = () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;
    
    const newThread = {
      id: threads.length + 1,
      title: newThreadTitle,
      author: "You",
      content: newThreadContent,
      comments: [],
      createdAt: "Just now",
      category: newThreadCategory,
    };
    setThreads([newThread, ...threads]);
    setNewThreadTitle("");
    setNewThreadContent("");
    setNewThreadCategory("Discussion");
    setShowNewThreadForm(false);
  };

  const handleAddComment = (threadId: number) => {
    if (!newCommentContent.trim()) return;
    
    setThreads((prevThreads) =>
      prevThreads.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              comments: [
                ...thread.comments,
                {
                  id: thread.comments.length + 1,
                  author: "You",
                  content: newCommentContent,
                },
              ],
            }
          : thread
      )
    );
    setNewCommentContent("");
  };

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Updates": return colors.accent.hex;
      case "Bug Report": return colors.warning.hex;
      case "Feature Request": return colors.highlight.hex;
      default: return colors.secondary.hex;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Discussion Forum</h1>
          <p className="text-lg text-gray-600">Connect, collaborate, and share ideas with your team</p>
        </div>

        {/* New Thread Button */}
        <div className="mb-6">
          <button
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            style={{ backgroundColor: colors.primary.hex }}
            onClick={() => setShowNewThreadForm(!showNewThreadForm)}
          >
            <Plus size={20} />
            {showNewThreadForm ? "Cancel" : "Start New Discussion"}
          </button>
        </div>

        {/* New Thread Form */}
        {showNewThreadForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Discussion</h2>
            
            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={newThreadCategory}
                onChange={(e) => setNewThreadCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all duration-200"
                style={{ focusRingColor: colors.accent.hex }}
              >
                <option value="Discussion">Discussion</option>
                <option value="Updates">Updates</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
              </select>
            </div>

            {/* Title Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                placeholder="Enter discussion title..."
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all duration-200"
                style={{ focusRingColor: colors.accent.hex }}
              />
            </div>

            {/* Content Textarea */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
              <textarea
                placeholder="Share your thoughts, questions, or ideas..."
                value={newThreadContent}
                onChange={(e) => setNewThreadContent(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all duration-200 resize-none"
                style={{ focusRingColor: colors.accent.hex }}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleAddThread}
              className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{ backgroundColor: colors.secondary.hex }}
            >
              Post Discussion
            </button>
          </div>
        )}

        {/* Thread List */}
        {selectedThreadId === null && (
          <div className="space-y-6">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden group"
                onClick={() => setSelectedThreadId(thread.id)}
              >
                <div className="p-6">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: getCategoryColor(thread.category) }}
                    >
                      {thread.category}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock size={16} />
                      {thread.createdAt}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                    {thread.title}
                  </h3>

                  {/* Author */}
                  <div className="flex items-center gap-2 mb-4">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      Started by {thread.author}
                    </span>
                  </div>

                  {/* Content Preview */}
                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {thread.content}
                  </p>

                  {/* Comments Count */}
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle size={16} style={{ color: colors.accent.hex }} />
                    <span style={{ color: colors.accent.hex }} className="font-semibold">
                      {thread.comments.length} {thread.comments.length === 1 ? 'comment' : 'comments'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Single Thread View */}
        {selectedThreadId !== null && selectedThread && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Back Button */}
            <div className="p-6 border-b border-gray-100">
              <button
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                onClick={() => setSelectedThreadId(null)}
              >
                <ArrowLeft size={20} />
                Back to discussions
              </button>
            </div>

            {/* Thread Header */}
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <span 
                  className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: getCategoryColor(selectedThread.category) }}
                >
                  {selectedThread.category}
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={16} />
                  {selectedThread.createdAt}
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedThread.title}</h2>
              
              <div className="flex items-center gap-2 mb-6">
                <User size={20} className="text-gray-400" />
                <span className="text-lg font-medium text-gray-600">
                  {selectedThread.author}
                </span>
              </div>

              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">{selectedThread.content}</p>
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t border-gray-100 p-8">
              <div className="flex items-center gap-2 mb-6">
                <MessageCircle size={24} style={{ color: colors.primary.hex }} />
                <h3 className="text-2xl font-bold text-gray-900">
                  Comments ({selectedThread.comments.length})
                </h3>
              </div>

              {/* Comments List */}
              <div className="space-y-4 mb-8">
                {selectedThread.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <User size={16} className="text-gray-400" />
                      <span className="font-semibold text-gray-900">{comment.author}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                  </div>
                ))}
                {selectedThread.comments.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No comments yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>

              {/* Add Comment Form */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Add a comment</h4>
                <textarea
                  placeholder="Share your thoughts..."
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all duration-200 resize-none mb-4"
                  style={{ focusRingColor: colors.accent.hex }}
                />
                <button
                  onClick={() => handleAddComment(selectedThread.id)}
                  className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  style={{ backgroundColor: colors.primary.hex }}
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}