import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../services/apiConfig';

// Relative time helper
const timeAgo = (iso) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
};

const MatchComments = ({ matchId }) => {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const load = useCallback(async (p = 1, append = false) => {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${encodeURIComponent(matchId)}/comments?page=${p}&limit=10`);
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to load comments');
      setTotal(payload.total);
      setPages(payload.pages);
      setComments((prev) => (append ? [...prev, ...payload.data] : payload.data));
      setError(null);
    } catch (err) {
      if (!append) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    load(1);
    // Poll for new comments so the discussion stays live
    pollRef.current = setInterval(() => load(1), 20000);
    return () => clearInterval(pollRef.current);
  }, [load]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim() || text.trim().length > 500) return;
    setPosting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${encodeURIComponent(matchId)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authService.authHeaders() },
        body: JSON.stringify({ text: text.trim() }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.message || 'Failed to post comment');
      setText('');
      load(1); // refresh to top
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${encodeURIComponent(matchId)}/comments/${commentId}`, {
        method: 'DELETE',
        headers: authService.authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete comment');
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card p-6 mt-8">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          💬 Match Discussion
          {total > 0 && <span className="badge bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">{total}</span>}
        </h3>
        <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> live feed
        </span>
      </div>

      {/* Composer */}
      {isAuthenticated ? (
        <form onSubmit={handlePost} className="mb-6">
          <div className="flex gap-2 items-start">
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">
              {(user?.name || 'U')[0].toUpperCase()}
            </span>
            <div className="flex-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Share your thoughts on this match..."
                className="input resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <span className={`text-xs tnum ${text.length > 450 ? 'text-rose-500' : 'text-gray-400'}`}>{text.length}/500</span>
                <button type="submit" disabled={posting || !text.trim()} className="btn-primary !py-2 !px-4 text-sm">
                  {posting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-sm text-gray-600 dark:text-gray-300 flex items-center justify-between gap-3 flex-wrap">
          <span>Join the conversation — sign in to post a comment.</span>
          <Link to="/login" className="btn-primary !py-1.5 !px-4 text-xs shrink-0">Log In</Link>
        </div>
      )}

      {error && <p className="mb-4 text-sm text-rose-500">{error}</p>}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3.5 w-32" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">🎙️</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">No comments yet — be the first to speak up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c._id} className="flex gap-3 group">
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                {(c.userName || 'U')[0].toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{c.userName}</span>
                  <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                  {user && String(c.user) === String(user.id) && (
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="ml-auto p-1 text-gray-300 hover:text-rose-500 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete comment"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed break-words">{c.text}</p>
              </div>
            </div>
          ))}

          {page < pages && (
            <div className="text-center pt-2">
              <button
                onClick={() => { const p = page + 1; setPage(p); load(p, true); }}
                className="btn-ghost !py-2 !px-5 text-sm"
              >
                Load more ({total - comments.length} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchComments;
