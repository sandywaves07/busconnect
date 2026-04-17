import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Filter } from 'lucide-react';
import PostCard from '../components/feed/PostCard';
import PostCreator from '../components/feed/PostCreator';
import Spinner from '../components/ui/Spinner';
import api from '../services/api';

const FILTERS = [
  { value: 'all', label: 'All Posts' },
  { value: 'update', label: '📢 Updates' },
  { value: 'job', label: '💼 Jobs' },
  { value: 'marketplace', label: '🛒 Marketplace' },
];

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async (pg = 1, ft = filter, append = false) => {
    if (pg === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const params = { page: pg, limit: 15 };
      if (ft !== 'all') params.type = ft;
      const res = await api.get('/posts', { params });
      const newPosts = res.data.posts;
      if (append) setPosts(prev => [...prev, ...newPosts]);
      else setPosts(newPosts);
      setHasMore(pg < res.data.pages);
      setPage(pg);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPosts(1, filter, false);
  }, [filter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(1, filter, false);
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [{ ...newPost, isLiked: false, likeCount: 0 }, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) fetchPosts(page + 1, filter, true);
  };

  return (
    <div>
      {/* Post creator */}
      <PostCreator onPostCreated={handlePostCreated} />

      {/* Filters */}
      <div className="card mt-3 p-1.5 flex items-center gap-1">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${filter === f.value ? 'bg-bus-blue-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {f.label}
          </button>
        ))}
        <button onClick={handleRefresh} className={`p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors ${refreshing ? 'animate-spin text-bus-blue-600' : ''}`} title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Feed */}
      <div className="mt-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">🚌</div>
            <h3 className="font-semibold text-gray-700 mb-1">No posts yet</h3>
            <p className="text-sm text-gray-500">Be the first to share an update, post a job, or list a part!</p>
          </div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard key={post._id} post={post} onDeleted={handlePostDeleted} />
            ))}
            {hasMore && (
              <div className="text-center py-4">
                <button onClick={loadMore} disabled={loadingMore} className="btn-secondary">
                  {loadingMore ? <span className="flex items-center gap-2"><Spinner size="sm" /> Loading...</span> : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
