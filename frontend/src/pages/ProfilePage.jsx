import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Globe, Phone, Briefcase, ShoppingBag, FileText, MessageSquare, UserCheck, UserPlus, Building2, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import { RoleBadge } from '../components/ui/Badge';
import PostCard from '../components/feed/PostCard';
import Spinner from '../components/ui/Spinner';
import api from '../services/api';
import toast from 'react-hot-toast';

const TABS = [
  { value: 'all', label: 'All Posts', icon: FileText },
  { value: 'update', label: 'Updates', icon: FileText },
  { value: 'job', label: 'Jobs', icon: Briefcase },
  { value: 'marketplace', label: 'Listings', icon: ShoppingBag },
];

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [tab, setTab] = useState('all');
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/${id}`);
        setProfile(res.data);
        setFollowing(res.data.isFollowing);
        setFollowerCount(res.data.followerCount || 0);
      } catch {
        toast.error('Profile not found');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  useEffect(() => {
    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        const params = { limit: 20 };
        if (tab !== 'all') params.type = tab;
        const res = await api.get(`/users/${id}/posts`, { params });
        setPosts(res.data.posts);
      } catch { }
      setPostsLoading(false);
    };
    if (id) fetchPosts();
  }, [id, tab]);

  const handleFollow = async () => {
    try {
      const res = await api.post(`/users/${id}/follow`);
      setFollowing(res.data.following);
      setFollowerCount(res.data.followerCount);
    } catch {
      toast.error('Failed to follow');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  if (!profile) {
    return <div className="card p-12 text-center"><p className="text-gray-500">Profile not found</p></div>;
  }

  return (
    <div>
      {/* Profile header */}
      <div className="card overflow-hidden mb-4">
        <div className="h-36 bg-gradient-to-br from-bus-blue-700 via-bus-blue-600 to-bus-blue-500" />
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <Avatar src={profile.avatar} name={profile.name} size="xl" className="ring-4 ring-white" />
              {profile.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-bus-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mb-1">
              {!isOwnProfile && currentUser && (
                <>
                  <Link to={`/messages/${id}`} className="btn-secondary flex items-center gap-2">
                    <MessageSquare size={15} /> Message
                  </Link>
                  <button onClick={handleFollow} className={`flex items-center gap-2 ${following ? 'btn-secondary' : 'btn-primary'}`}>
                    {following ? <><UserCheck size={15} /> Following</> : <><UserPlus size={15} /> Follow</>}
                  </button>
                </>
              )}
              {isOwnProfile && (
                <Link to="/settings" className="btn-secondary flex items-center gap-2">
                  <Edit size={15} /> Edit Profile
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {profile.name}
                <RoleBadge role={profile.role} />
                {profile.isGuest && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Guest</span>}
              </h1>
              {profile.companyName && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                  <Building2 size={14} /> {profile.companyName}
                  {profile.companyType && <span className="text-gray-400">· {profile.companyType}</span>}
                </div>
              )}
              {profile.bio && <p className="text-sm text-gray-600 mt-2 max-w-xl">{profile.bio}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                {profile.location && <span className="flex items-center gap-1"><MapPin size={12} /> {profile.location}</span>}
                {profile.website && <a href={profile.website} className="flex items-center gap-1 text-bus-blue-600 hover:underline"><Globe size={12} /> {profile.website}</a>}
                {profile.phone && <span className="flex items-center gap-1"><Phone size={12} /> {profile.phone}</span>}
              </div>
            </div>

            <div className="flex gap-6 text-center">
              {[
                { value: followerCount, label: 'Followers' },
                { value: profile.followingCount || 0, label: 'Following' },
                { value: profile.stats?.posts || 0, label: 'Posts', color: 'text-bus-blue-700' },
                { value: profile.stats?.jobsPosted || 0, label: 'Jobs', color: 'text-bus-green-700' },
                { value: profile.stats?.listingsPosted || 0, label: 'Listings', color: 'text-bus-orange-600' },
              ].map(s => (
                <div key={s.label}>
                  <div className={`text-xl font-bold ${s.color || 'text-gray-900'}`}>{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-1 mb-4 flex gap-1">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors ${tab === t.value ? 'bg-bus-blue-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Posts */}
      {postsLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-500">No posts yet</p>
        </div>
      ) : (
        posts.map(post => <PostCard key={post._id} post={post} />)
      )}
    </div>
  );
}
