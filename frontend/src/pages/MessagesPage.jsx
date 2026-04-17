import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, MessageSquare, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import api from '../services/api';
import toast from 'react-hot-toast';

function ConversationList({ conversations, selectedId, onSelect, loading }) {
  const [search, setSearch] = useState('');
  const filtered = conversations.filter(c =>
    c.partner?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 mb-3">Messages</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-9 text-xs"
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400">No conversations yet</div>
        ) : (
          filtered.map(({ partner, lastMessage, unreadCount }) => (
            <button
              key={partner?._id}
              onClick={() => onSelect(partner)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${selectedId === partner?._id ? 'bg-bus-blue-50 border-l-4 border-l-bus-blue-600' : ''}`}
            >
              <div className="relative flex-shrink-0">
                <Avatar src={partner?.avatar} name={partner?.name} size="md" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                    {partner?.name}
                  </span>
                  {lastMessage && (
                    <span className="text-[11px] text-gray-400 flex-shrink-0">
                      {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: false })}
                    </span>
                  )}
                </div>
                {lastMessage && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">{lastMessage.content}</p>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function ChatWindow({ partner, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!partner) return;
    setLoading(true);
    api.get(`/messages/${partner._id}`)
      .then(res => setMessages(res.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [partner?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 5s
  useEffect(() => {
    if (!partner) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/messages/${partner._id}`);
        setMessages(res.data);
      } catch { }
    }, 5000);
    return () => clearInterval(interval);
  }, [partner?._id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || sending) return;
    setSending(true);
    try {
      const res = await api.post(`/messages/${partner._id}`, { content: newMsg.trim() });
      setMessages(prev => [...prev, res.data]);
      setNewMsg('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!partner) {
    return (
      <div className="card flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">Select a conversation</p>
          <p className="text-sm mt-1">Choose from your existing messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card flex-1 flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <Link to={`/profile/${partner._id}`}>
          <Avatar src={partner.avatar} name={partner.name} size="md" />
        </Link>
        <div>
          <Link to={`/profile/${partner._id}`} className="font-semibold text-gray-900 hover:text-bus-blue-700 text-sm">
            {partner.name}
          </Link>
          <div className="text-xs text-gray-500 capitalize">{partner.role}{partner.companyName ? ` · ${partner.companyName}` : ''}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400">
            Start a conversation with {partner.name}
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <Avatar src={partner.avatar} name={partner.name} size="sm" className="mr-2 flex-shrink-0" />
                )}
                <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-bus-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                    {msg.content}
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 px-1">
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-3 px-4 py-3 border-t border-gray-100">
        <input
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder={`Message ${partner.name}...`}
          maxLength={2000}
          className="flex-1 input-field"
        />
        <button
          type="submit"
          disabled={!newMsg.trim() || sending}
          className="btn-primary flex items-center gap-2 py-2 px-4 disabled:opacity-50"
        >
          <Send size={15} /> Send
        </button>
      </form>
    </div>
  );
}

export default function MessagesPage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/messages/conversations')
      .then(res => setConversations(res.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // Auto-select from URL param
  useEffect(() => {
    if (userId && conversations.length > 0) {
      const found = conversations.find(c => c.partner?._id === userId);
      if (found) setSelectedPartner(found.partner);
    } else if (userId && !loading) {
      // Load partner info directly
      api.get(`/users/${userId}`)
        .then(res => setSelectedPartner(res.data))
        .catch(() => { });
    }
  }, [userId, conversations, loading]);

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)]">
      <div className="w-72 flex-shrink-0">
        <ConversationList
          conversations={conversations}
          selectedId={selectedPartner?._id}
          onSelect={setSelectedPartner}
          loading={loading}
        />
      </div>
      <ChatWindow partner={selectedPartner} currentUser={user} />
    </div>
  );
}
