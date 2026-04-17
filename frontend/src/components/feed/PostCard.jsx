import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MapPin, Phone, Mail, Briefcase, ShoppingBag, IndianRupee, MoreHorizontal, Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { PostTypeBadge, RoleBadge, ConditionBadge } from '../ui/Badge';
import CommentSection from './CommentSection';
import api from '../../services/api';
import toast from 'react-hot-toast';

function formatSalary(details) {
  if (!details) return null;
  const { salaryMin, salaryMax, salaryUnit } = details;
  if (!salaryMin && !salaryMax) return null;
  const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;
  const range = salaryMin && salaryMax ? `${fmt(salaryMin)}–${fmt(salaryMax)}` : fmt(salaryMin || salaryMax);
  return `${range} / ${salaryUnit || 'monthly'}`;
}

function formatPrice(price) {
  if (!price) return null;
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
  return `₹${price}`;
}

export default function PostCard({ post, onDeleted }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount || post.likes?.length || 0);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleted, setDeleted] = useState(false);

  if (deleted) return null;

  const handleLike = async () => {
    if (!user) { toast.error('Login to like posts'); return; }
    try {
      const res = await api.post(`/posts/${post._id}/like`);
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch { toast.error('Failed to like'); }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.origin + `/post/${post._id}`);
    toast.success('Post link copied!');
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${post._id}`);
      setDeleted(true);
      toast.success('Post deleted');
      onDeleted && onDeleted(post._id);
    } catch { toast.error('Failed to delete'); }
  };

  const isOwner = user && user._id === (post.author?._id || post.author);
  const { type, author, content, jobDetails, marketplaceDetails } = post;

  const typeClass = type === 'job' ? 'post-type-job' : type === 'marketplace' ? 'post-type-marketplace' : 'post-type-update';

  return (
    <div className={`card p-5 mb-3 post-card transition-shadow ${typeClass} fade-in`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${author?._id}`}>
            <Avatar src={author?.avatar} name={author?.name} size="md" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link to={`/profile/${author?._id}`} className="font-semibold text-sm text-gray-900 hover:text-bus-blue-700">
                {author?.name}
              </Link>
              <RoleBadge role={author?.role} />
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
              {author?.companyName && <span>{author.companyName}</span>}
              {author?.companyName && author?.location && <span>·</span>}
              {author?.location && <span className="flex items-center gap-0.5"><MapPin size={10} />{author.location}</span>}
              <span>·</span>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PostTypeBadge type={type} />
          {isOwner && (
            <div className="relative">
              <button onClick={() => setShowMenu(p => !p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <MoreHorizontal size={16} />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10">
                  <Link to={`/post/${post._id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <ExternalLink size={13} /> View Post
                  </Link>
                  <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-3">
        {content}
      </div>

      {/* Job Details Card */}
      {type === 'job' && jobDetails && (
        <div className="bg-bus-blue-50 border border-bus-blue-100 rounded-xl p-4 mb-3">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-base font-bold text-bus-blue-900 flex items-center gap-2">
                <Briefcase size={16} className="text-bus-blue-600" />
                {jobDetails.position}
              </div>
              {jobDetails.jobLocation && (
                <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin size={12} /> {jobDetails.jobLocation}
                </div>
              )}
            </div>
            {jobDetails.jobType && (
              <span className="text-xs bg-white border border-bus-blue-200 text-bus-blue-700 px-2 py-1 rounded-full font-medium capitalize">
                {jobDetails.jobType}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
            {formatSalary(jobDetails) && (
              <div className="flex items-center gap-1.5">
                <IndianRupee size={12} className="text-bus-green-600" />
                <span className="font-medium text-bus-green-700">{formatSalary(jobDetails)}</span>
              </div>
            )}
            {jobDetails.experience && (
              <div className="flex items-center gap-1.5">
                <span>📋</span> {jobDetails.experience}
              </div>
            )}
            {jobDetails.contactEmail && (
              <div className="flex items-center gap-1.5">
                <Mail size={12} /> {jobDetails.contactEmail}
              </div>
            )}
            {jobDetails.contactPhone && (
              <div className="flex items-center gap-1.5">
                <Phone size={12} /> {jobDetails.contactPhone}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Marketplace Details Card */}
      {type === 'marketplace' && marketplaceDetails && (
        <div className="bg-bus-orange-50 border border-bus-orange-100 rounded-xl p-4 mb-3">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-base font-bold text-bus-orange-900 flex items-center gap-2">
                <ShoppingBag size={16} className="text-bus-orange-600" />
                {marketplaceDetails.listingTitle}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {marketplaceDetails.condition && <ConditionBadge condition={marketplaceDetails.condition} />}
                {marketplaceDetails.category && (
                  <span className="text-xs text-gray-500 capitalize">{marketplaceDetails.category.replace('-', ' ')}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              {marketplaceDetails.price && (
                <div className="text-xl font-bold text-bus-orange-700">{formatPrice(marketplaceDetails.price)}</div>
              )}
              {marketplaceDetails.priceNegotiable && <div className="text-[11px] text-gray-500">Negotiable</div>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            {marketplaceDetails.listingLocation && (
              <div className="flex items-center gap-1.5">
                <MapPin size={12} /> {marketplaceDetails.listingLocation}
              </div>
            )}
            {marketplaceDetails.contactEmail && (
              <div className="flex items-center gap-1.5">
                <Mail size={12} /> {marketplaceDetails.contactEmail}
              </div>
            )}
            {marketplaceDetails.contactPhone && (
              <div className="flex items-center gap-1.5">
                <Phone size={12} /> {marketplaceDetails.contactPhone}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {post.tags.map(tag => (
            <Link key={tag} to={`/search?q=${tag}`} className="text-xs text-bus-blue-600 hover:underline">
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${liked ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-gray-500 hover:bg-gray-100 hover:text-red-500'}`}
          >
            <Heart size={16} className={liked ? 'fill-current' : ''} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          <button
            onClick={() => setShowComments(p => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-bus-blue-600 transition-colors"
          >
            <MessageCircle size={16} />
            {commentCount > 0 && <span>{commentCount}</span>}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-bus-green-600 transition-colors"
          >
            <Share2 size={16} />
          </button>
        </div>

        <Link to={`/post/${post._id}`} className="text-xs text-gray-400 hover:text-bus-blue-600 transition-colors">
          View post →
        </Link>
      </div>

      {/* Comments section */}
      {showComments && (
        <CommentSection
          postId={post._id}
          onCommentAdded={() => setCommentCount(c => c + 1)}
        />
      )}
    </div>
  );
}
