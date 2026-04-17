import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, ShoppingBag, User, MessageSquare, Bell, Settings, TrendingUp, Bus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const navItems = [
  { path: '/', label: 'Feed', icon: Home, exact: true },
  { path: '/jobs', label: 'Job Board', icon: Briefcase },
  { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { path: '/messages', label: 'Messages', icon: MessageSquare },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function LeftSidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Profile card */}
      <div className="card p-4">
        <Link to={`/profile/${user?._id}`} className="flex items-center gap-3 group">
          <Avatar src={user?.avatar} name={user?.name} size="md" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate group-hover:text-bus-blue-700 transition-colors">
              {user?.name}
            </div>
            <div className="text-xs text-gray-500 capitalize truncate">{user?.role}</div>
            {user?.companyName && (
              <div className="text-xs text-gray-400 truncate">{user.companyName}</div>
            )}
          </div>
        </Link>
        {user?.isGuest && (
          <div className="mt-3 text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded-lg">
            Guest account — <Link to="/settings" className="underline font-medium">Register</Link> for full access
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="card p-2">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item) ? 'active' : ''}`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
        <Link
          to={`/profile/${user?._id}`}
          className={`nav-link ${location.pathname.includes('/profile/' + user?._id) ? 'active' : ''}`}
        >
          <User size={18} />
          My Profile
        </Link>
      </nav>

      {/* Quick stats */}
      {user && !user.isGuest && (
        <div className="card p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Activity</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Posts</span>
              <span className="font-semibold text-bus-blue-700">{user.stats?.posts || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Jobs Posted</span>
              <span className="font-semibold text-bus-blue-700">{user.stats?.jobsPosted || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Listings</span>
              <span className="font-semibold text-bus-orange-600">{user.stats?.listingsPosted || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Followers</span>
              <span className="font-semibold text-gray-700">{user.followers?.length || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
