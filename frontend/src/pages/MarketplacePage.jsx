import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, MapPin, Phone, Mail, Plus, Tag, SlidersHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import { ConditionBadge } from '../components/ui/Badge';
import PostCreator from '../components/feed/PostCreator';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'engine-parts', label: '⚙️ Engine Parts' },
  { value: 'body-parts', label: '🚌 Body Parts' },
  { value: 'electrical', label: '⚡ Electrical' },
  { value: 'brakes', label: '🔴 Brakes' },
  { value: 'tyres', label: '🔵 Tyres' },
  { value: 'seats', label: '💺 Seats' },
  { value: 'buses', label: '🚍 Complete Buses' },
  { value: 'tools', label: '🔧 Tools' },
  { value: 'other', label: '📦 Other' },
];

const CONDITIONS = [
  { value: '', label: 'Any Condition' },
  { value: 'new', label: 'New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'for-parts', label: 'For Parts' },
];

function formatPrice(price) {
  if (!price) return 'Price on request';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
  return `₹${price}`;
}

function ListingCard({ listing }) {
  const d = listing.marketplaceDetails || {};

  return (
    <Link to={`/post/${listing._id}`} className="card overflow-hidden hover:shadow-md transition-all group fade-in">
      {/* Category indicator */}
      <div className="h-2 bg-bus-orange-500" />

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm group-hover:text-bus-blue-700 transition-colors leading-tight line-clamp-2">
              {d.listingTitle || 'Marketplace Listing'}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {d.condition && <ConditionBadge condition={d.condition} />}
              {d.category && (
                <span className="text-[11px] text-gray-500 capitalize bg-gray-100 px-1.5 py-0.5 rounded">
                  {d.category.replace('-', ' ')}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{listing.content}</p>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-bus-orange-600">{formatPrice(d.price)}</div>
            {d.priceNegotiable && <div className="text-[11px] text-gray-400">Negotiable</div>}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 mt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Avatar src={listing.author?.avatar} name={listing.author?.name} size="xs" />
              <div>
                <div className="text-[11px] font-medium text-gray-700">{listing.author?.name}</div>
                {d.listingLocation && (
                  <div className="text-[11px] text-gray-400 flex items-center gap-0.5">
                    <MapPin size={9} /> {d.listingLocation}
                  </div>
                )}
              </div>
            </div>
            <div className="text-[11px] text-gray-400">
              {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function MarketplacePage() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreator, setShowCreator] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (condition) params.condition = condition;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (location) params.location = location;
      const res = await api.get('/posts/marketplace', { params });
      setListings(res.data.posts);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchListings(); };

  const handleListingCreated = (post) => {
    setListings(prev => [post, ...prev]);
  };

  return (
    <div>
      {/* Header */}
      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag size={22} className="text-bus-orange-600" /> Marketplace
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{listings.length} listings available</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowFilters(p => !p)} className="btn-secondary flex items-center gap-2">
              <SlidersHorizontal size={15} /> Filters
            </button>
            {user && (
              <button onClick={() => setShowCreator(p => !p)} className="btn-primary flex items-center gap-2">
                <Plus size={16} /> List Item
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parts, buses..." />
          </div>
          <button type="submit" className="btn-primary">Search</button>
        </form>

        {/* Extended filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 fade-in">
            <div>
              <label className="label">Category</label>
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Condition</label>
              <select className="input-field" value={condition} onChange={e => setCondition(e.target.value)}>
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Min Price (₹)</label>
              <input type="number" className="input-field" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Max Price (₹)</label>
              <input type="number" className="input-field" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Any" />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input-field" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, State" />
            </div>
            <div className="flex items-end gap-2">
              <button onClick={fetchListings} className="btn-primary flex-1">Apply Filters</button>
              <button onClick={() => { setCategory(''); setCondition(''); setMinPrice(''); setMaxPrice(''); setLocation(''); setSearch(''); }} className="btn-secondary">Reset</button>
            </div>
          </div>
        )}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => { setCategory(c.value); fetchListings(); }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${category === c.value ? 'bg-bus-orange-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-bus-orange-300 hover:text-bus-orange-600'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Creator */}
      {showCreator && (
        <div className="mb-4">
          <PostCreator onPostCreated={handleListingCreated} />
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : listings.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🛒</div>
          <h3 className="font-semibold text-gray-700 mb-1">No listings found</h3>
          <p className="text-sm text-gray-500">Try adjusting filters or be the first to list a part!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {listings.map(listing => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
