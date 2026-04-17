import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, Search, ChevronDown, LogOut, Settings, User, Bus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import api from '../../services/api';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const fetchCounts = async () => {
      try {
        const [n, m] = await Promise.all([
          api.get('/notifications/unread/count'),
          api.get('/messages/unread/count')
        ]);
        setNotifCount(n.data.count);
        setMsgCount(m.data.count);
      } catch { /* silent */ }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 h-full flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 bg-bus-blue-700 rounded-lg flex items-center justify-center">
            <Bus size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl text-bus-blue-800">BusConnect</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search operators, jobs, parts..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:border-bus-blue-300 focus:ring-2 focus:ring-bus-blue-100 transition-all"
            />
          </div>
        </form>

        {/* Right icons */}
        <div className="flex items-center gap-1 ml-auto">
          <Link
            to="/notifications"
            className="relative p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-bus-blue-700 transition-colors"
            title="Notifications"
          >
            <Bell size={20} />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </Link>

          <Link
            to="/messages"
            className="relative p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-bus-blue-700 transition-colors"
            title="Messages"
          >
            <MessageSquare size={20} />
            {msgCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {msgCount > 9 ? '9+' : msgCount}
              </span>
            )}
          </Link>

          {/* Profile dropdown */}
          <div className="relative ml-1" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(p => !p)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Avatar src={user?.avatar} name={user?.name} size="sm" />
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium text-gray-800 leading-tight max-w-[120px] truncate">{user?.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 fade-in">
                <Link
                  to={`/profile/${user?._id}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User size={15} />
                  My Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings size={15} />
                  Settings
                </Link>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { logout(); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
