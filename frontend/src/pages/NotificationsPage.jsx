import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, Bell, CheckCheck, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const typeConfig = {
  like: { icon: Heart, color: 'text-red-500 bg-red-50', label: 'liked your post' },
  comment: { icon: MessageCircle, color: 'text-bus-blue-600 bg-bus-blue-50', label: 'commented on your post' },
  follow: { icon: UserPlus, color: 'text-bus-green-600 bg-bus-green-50', label: 'started following you' },
  mention: { icon: Bell, color: 'text-purple-600 bg-purple-50', label: 'mentioned you' },
  job_match: { icon: Bell, color: 'text-bus-blue-600 bg-bus-blue-50', label: 'posted a matching job' },
  marketplace_inquiry: { icon: Bell, color: 'text-bus-orange-600 bg-bus-orange-50', label: 'inquired about your listing' },
};

function NotificationItem({ notification, onRead, onDelete }) {
  const config = typeConfig[notification.type] || typeConfig.mention;
  const Icon = config.icon;

  const handleClick = () => {
    if (!notification.read) onRead(notification._id);
  };

  const linkTarget = notification.post
    ? `/post/${notification.post._id || notification.post}`
    : notification.sender
      ? `/profile/${notification.sender._id}`
      : '#';

  return (
    <Link
      to={linkTarget}
      onClick={handleClick}
      className={`flex items-start gap-4 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group ${!notification.read ? 'bg-bus-blue-50/40' : ''}`}
    >
      <div className="relative flex-shrink-0">
        <Avatar src={notification.sender?.avatar} name={notification.sender?.name} size="md" />
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${config.color}`}>
          <Icon size={10} className="fill-current" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800">
          <span className="font-semibold">{notification.sender?.name || 'Someone'}</span>{' '}
          {config.label}
          {notification.post?.content && (
            <span className="text-gray-500"> · "{notification.post.content.slice(0, 60)}..."</span>
          )}
        </p>
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </span>
      </div>

      {!notification.read && (
        <div className="w-2.5 h-2.5 bg-bus-blue-600 rounded-full flex-shrink-0 mt-1.5" />
      )}

      <button
        onClick={e => { e.preventDefault(); onDelete(notification._id); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500 flex-shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </Link>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(res.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch { }
  };

  const handleRead = (id) => {
    api.put(`/notifications/${id}/read`).catch(() => { });
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const handleDelete = (id) => {
    api.delete(`/notifications/${id}`).catch(() => { });
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div>
      <div className="card mb-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h1 className="font-bold text-gray-900 flex items-center gap-2">
              <Bell size={18} className="text-bus-blue-600" /> Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-xs py-1.5">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-gray-500">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">When someone likes or comments on your posts, you'll see it here.</p>
          </div>
        ) : (
          notifications.map(n => (
            <NotificationItem
              key={n._id}
              notification={n}
              onRead={handleRead}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
