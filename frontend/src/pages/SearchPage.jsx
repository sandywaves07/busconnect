import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Users, Briefcase, ShoppingBag, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';
import Avatar from '../components/ui/Avatar';
import { RoleBadge } from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import PostCard from '../components/feed/PostCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [input, setInput] = useState(query);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) return;
    setLoading(true);
    api.get('/search', { params: { q: query } })
      .then(res => setResults(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim()) setSearchParams({ q: input.trim() });
  };

  const total = Object.values(results).reduce((s, a) => s + (a?.length || 0), 0);

  return (
    <div>
      <div className="card p-5 mb-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-10" value={input} onChange={e => setInput(e.target.value)} placeholder="Search operators, jobs, parts..." autoFocus />
          </div>
          <button type="submit" className="btn-primary px-6">Search</button>
        </form>
        {query && !loading && <p className="text-sm text-gray-500 mt-2">{total} results for "<strong>{query}</strong>"</p>}
      </div>

      {!query ? (
        <div className="card p-16 text-center text-gray-400">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p>Search for operators, jobs, parts, and updates</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-6">
          {results.users?.length > 0 && (
            <section>
              <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Users size={16}/> People</h2>
              <div className="space-y-2">
                {results.users.map(u => (
                  <Link key={u._id} to={`/profile/${u._id}`} className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                    <Avatar src={u.avatar} name={u.name} size="md" />
                    <div>
                      <div className="flex items-center gap-2"><span className="font-semibold text-sm">{u.name}</span><RoleBadge role={u.role}/></div>
                      {u.companyName && <div className="text-xs text-gray-500">{u.companyName}</div>}
                      {u.location && <div className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10}/>{u.location}</div>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {results.jobs?.length > 0 && (
            <section>
              <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Briefcase size={16}/> Jobs</h2>
              <div className="space-y-2">
                {results.jobs.map(j => (
                  <Link key={j._id} to={`/post/${j._id}`} className="card p-4 hover:shadow-md transition-shadow block">
                    <div className="font-semibold text-sm">{j.jobDetails?.position || 'Job Opening'}</div>
                    <div className="text-xs text-gray-500">{j.author?.companyName} · {j.jobDetails?.jobLocation}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {results.marketplace?.length > 0 && (
            <section>
              <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><ShoppingBag size={16}/> Marketplace</h2>
              <div className="space-y-2">
                {results.marketplace.map(l => (
                  <Link key={l._id} to={`/post/${l._id}`} className="card p-4 hover:shadow-md transition-shadow block">
                    <div className="font-semibold text-sm">{l.marketplaceDetails?.listingTitle}</div>
                    <div className="text-xs text-bus-orange-600">{l.marketplaceDetails?.price ? `₹${l.marketplaceDetails.price.toLocaleString()}` : ''}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {results.posts?.length > 0 && (
            <section>
              <h2 className="font-bold text-gray-700 mb-3">Updates</h2>
              {results.posts.map(p => <PostCard key={p._id} post={p} />)}
            </section>
          )}
          {total === 0 && (
            <div className="card p-12 text-center text-gray-400">No results found for "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
}
