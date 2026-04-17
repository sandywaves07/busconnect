import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import PostCard from '../components/feed/PostCard';
import Spinner from '../components/ui/Spinner';

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/posts/${id}`)
      .then(res => setPost(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div>
      <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-bus-blue-700 mb-4">
        <ArrowLeft size={16} /> Back to Feed
      </Link>
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : !post ? (
        <div className="card p-12 text-center text-gray-500">Post not found</div>
      ) : (
        <PostCard post={{ ...post, isLiked: post.isLiked || false, likeCount: post.likeCount || post.likes?.length || 0 }} />
      )}
    </div>
  );
}
