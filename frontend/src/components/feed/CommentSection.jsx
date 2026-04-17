import React, { useState, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function CommentSection({ postId, onCommentAdded }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/posts/${postId}/comments`)
      .then(res => setComments(res.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${postId}/comments`, { content: newComment.trim() });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
      onCommentAdded && onCommentAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch {
      toast.error('Could not delete comment');
    }
  };

  return (
    <div className="pt-3 border-t border-gray-100">
      {loading ? (
        <div className="text-sm text-gray-400 text-center py-2">Loading comments...</div>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment._id} className="flex gap-2 group">
              <Link to={`/profile/${comment.author?._id}`}>
                <Avatar src={comment.author?.avatar} name={comment.author?.name} size="sm" />
              </Link>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-xl px-3 py-2">
                  <Link to={`/profile/${comment.author?._id}`} className="text-xs font-semibold text-gray-800 hover:text-bus-blue-700">
                    {comment.author?.name}
                  </Link>
                  <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                </div>
                <div className="flex items-center gap-3 mt-1 px-1">
                  <span className="text-[11px] text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                  {user && user._id === comment.author?._id && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="text-[11px] text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                    >
                      <Trash2 size={10} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
        <Avatar src={user?.avatar} name={user?.name} size="sm" />
        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5">
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            maxLength={500}
            className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="text-bus-blue-600 hover:text-bus-blue-800 disabled:opacity-40 transition-colors"
          >
            <Send size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}
