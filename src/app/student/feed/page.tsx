"use client";

import { useState, useEffect } from "react";

interface FeedItem {
  id: string;
  type: string;
  content: string;
  user: { name: string; id: string };
  metadata: string | null;
  createdAt: string;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((data) => setPosts(data.posts || []));
  }, []);

  const handlePost = async (type: string = "checkin") => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content: newPost }),
      });
      if (res.ok) {
        const post = await res.json();
        setPosts([post, ...posts]);
        setNewPost("");
      }
    } finally {
      setPosting(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "checkin": return "🤙";
      case "milestone": return "🎯";
      case "badge": return "⭐";
      case "note": return "📝";
      case "challenge": return "🔥";
      default: return "💬";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "checkin": return "Check-in";
      case "milestone": return "Milestone";
      case "badge": return "Badge Earned";
      case "note": return "Note";
      case "challenge": return "Challenge";
      default: return "Post";
    }
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-mat-100">Team Feed</h1>
        <p className="text-mat-400 text-sm mt-1">
          What&apos;s happening on the mats. Share, motivate, connect.
        </p>
      </div>

      {/* Post composer */}
      <div className="card p-4 mb-6">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Just finished drilling? Share what's on your mind..."
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-mat-800 border border-mat-700/50 text-mat-100 text-sm placeholder:text-mat-600 focus:outline-none focus:ring-2 focus:ring-gi-500/50 resize-none mb-3"
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => handlePost("checkin")}
              disabled={!newPost.trim() || posting}
              className="px-3 py-1.5 rounded-md bg-gi-500/10 text-gi-400 text-xs font-medium hover:bg-gi-500/20 transition-colors disabled:opacity-40"
            >
              🤙 Check-in
            </button>
            <button
              onClick={() => handlePost("note")}
              disabled={!newPost.trim() || posting}
              className="px-3 py-1.5 rounded-md bg-mat-800 text-mat-400 text-xs font-medium hover:bg-mat-700 transition-colors disabled:opacity-40"
            >
              📝 Note
            </button>
          </div>
          <button
            onClick={() => handlePost()}
            disabled={!newPost.trim() || posting}
            className="btn-primary text-xs disabled:opacity-40"
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      {/* Feed */}
      {posts.length === 0 ? (
        <div className="card p-12 text-center text-mat-500">
          <p className="mb-2">The feed is quiet.</p>
          <p className="text-mat-600 text-xs">
            Be the first to share what&apos;s happening on the mats.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="card p-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-mat-800 flex items-center justify-center text-sm flex-shrink-0">
                  {getIcon(post.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-mat-200 text-sm">
                      {post.user.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-mat-800 text-mat-500">
                      {getTypeLabel(post.type)}
                    </span>
                    <span className="text-[10px] text-mat-600 ml-auto">
                      {timeAgo(post.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-mat-300">{post.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
