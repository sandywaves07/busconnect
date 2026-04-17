import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Zap } from 'lucide-react';
import api from '../../services/api';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function SuggestionCard({ user, onFollow }) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      await api.post(`/users/${user._id}/follow`);
      setFollowing(true);
      onFollow && onFollow(user._id);
    } catch {
      toast.error('Could not follow user');
    } finally {
      setLoading(false);
    }
  };

  if (following) return null;

  return (
    <div className="flex items-center gap-2 py-2">
      <Link to={`/profile/${user._id}`}>
        <Avatar src={user.avatar} name={user.name} size="sm" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${user._id}`} className="text-sm font-medium text-gray-800 hover:text-bus-blue-700 truncate block">
          {user.name}
        </Link>
        <div className="text-xs text-gray-500 truncate capitalize">{user.role}{user.companyName ? ` · ${user.companyName}` : ''}</div>
      </div>
      <button
        onClick={handleFollow}
        disabled={loading}
        className="text-xs font-medium text-bus-blue-700 border border-bus-blue-300 px-2.5 py-1 rounded-full hover:bg-bus-blue-50 transition-colors flex-shrink-0 disabled:opacity-50"
      >
        Follow
      </button>
    </div>
  );
}

const trendingTopics = [
  { tag: 'ElectricBus', posts: 128, color: 'text-bus-green-600' },
  { tag: 'BusSafety', posts: 94, color: 'text-bus-blue-600' },
  { tag: 'CMVR2024', posts: 76, color: 'text-bus-orange-600' },
  { tag: 'FleetExpansion', posts: 65, color: 'text-bus-green-600' },
  { tag: 'BusMaintenance', posts: 58, color: 'text-bus-blue-600' },
  { tag: 'NewFleet', posts: 43, color: 'text-bus-orange-600' },
];

const industryStats = [
  { label: 'Active Operators', value: '2,400+' },
  { label: 'Jobs Posted Today', value: '34' },
  { label: 'Parts Listed', value: '890+' },
  { label: 'Drivers Available', value: '156' },
];

export default function RightSidebar() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!user) return;
    api.get('/users/suggestions')
      .then(res => setSuggestions(res.data.slice(0, 5)))
      .catch(() => { });
  }, [user]);

  return (
    <div className="flex flex-col gap-3">
      {/* Industry Stats */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={15} className="text-bus-orange-600" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Industry Today</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {industryStats.map(stat => (
            <div key={stat.label} className="bg-gray-50 rounded-lg p-2.5 text-center">
              <div className="text-base font-bold text-bus-blue-700">{stat.value}</div>
              <div className="text-[11px] text-gray-500 leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={15} className="text-bus-blue-600" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Trending</span>
        </div>
        <div className="space-y-2">
          {trendingTopics.map((topic, i) => (
            <Link
              key={topic.tag}
              to={`/search?q=${topic.tag}`}
              className="flex items-center justify-between hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors group"
            >
              <div>
                <span className={`text-sm font-medium ${topic.color} group-hover:underline`}>#{topic.tag}</span>
                <div className="text-[11px] text-gray-400">{topic.posts} posts</div>
              </div>
              <span className="text-xs text-gray-300 font-medium">{i + 1}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* People You May Know */}
      {suggestions.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={15} className="text-bus-green-600" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Suggested Connections</span>
          </div>
          <div className="divide-y divide-gray-50">
            {suggestions.map(s => (
              <SuggestionCard
                key={s._id}
                user={s}
                onFollow={id => setSuggestions(prev => prev.filter(u => u._id !== id))}
              />
            ))}
          </div>
          <Link to="/search" className="block mt-3 text-xs text-bus-blue-600 hover:underline text-center">
            View more connections →
          </Link>
        </div>
      )}

      {/* BusConnect tagline */}
      <div className="text-center text-[11px] text-gray-400 px-2">
        <div className="font-medium text-gray-500 mb-1">🚌 BusConnect</div>
        The professional hub for India's bus industry
        <div className="mt-2 flex flex-wrap gap-1 justify-center">
          {['About', 'Privacy', 'Terms', 'Help'].map(l => (
            <span key={l} className="hover:text-bus-blue-600 cursor-pointer">{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
