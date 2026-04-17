import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, IndianRupee, Calendar, Briefcase, Search, Filter, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import PostCreator from '../components/feed/PostCreator';
import { useAuth } from '../context/AuthContext';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'temporary'];

function formatSalary(d) {
  if (!d) return '—';
  const fmt = n => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;
  if (d.salaryMin && d.salaryMax) return `${fmt(d.salaryMin)}–${fmt(d.salaryMax)}/${d.salaryUnit || 'mo'}`;
  if (d.salaryMin) return `From ${fmt(d.salaryMin)}/${d.salaryUnit || 'mo'}`;
  return '—';
}

const jobTypeBg = {
  'full-time': 'bg-green-100 text-green-700',
  'part-time': 'bg-blue-100 text-blue-700',
  'contract': 'bg-orange-100 text-orange-700',
  'temporary': 'bg-purple-100 text-purple-700',
};

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCreator, setShowCreator] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (location) params.location = location;
      if (jobType) params.jobType = jobType;
      const res = await api.get('/posts/jobs', { params });
      setJobs(res.data.posts);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchJobs(); };

  const sortedJobs = [...jobs].sort((a, b) => {
    let av, bv;
    if (sortField === 'salary') {
      av = a.jobDetails?.salaryMin || 0;
      bv = b.jobDetails?.salaryMin || 0;
    } else {
      av = new Date(a.createdAt);
      bv = new Date(b.createdAt);
    }
    return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const handleJobCreated = (post) => {
    setJobs(prev => [post, ...prev]);
  };

  return (
    <div>
      {/* Header */}
      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase size={22} className="text-bus-blue-600" /> Job Board
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{jobs.length} open positions across India</p>
          </div>
          {user && (
            <button onClick={() => setShowCreator(p => !p)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Post a Job
            </button>
          )}
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search positions..." />
          </div>
          <div className="relative w-44">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-9" value={location} onChange={e => setLocation(e.target.value)} placeholder="Location..." />
          </div>
          <select className="input-field w-40" value={jobType} onChange={e => setJobType(e.target.value)}>
            <option value="">All Types</option>
            {JOB_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Filter size={15} /> Filter
          </button>
        </form>
      </div>

      {/* Post job creator */}
      {showCreator && (
        <div className="mb-4">
          <PostCreator onPostCreated={handleJobCreated} />
        </div>
      )}

      <div className="flex gap-4">
        {/* Jobs table */}
        <div className="flex-1">
          <div className="card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1.2fr_1fr_0.8fr_0.8fr] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="flex items-center gap-1 cursor-pointer hover:text-gray-800" onClick={() => toggleSort('createdAt')}>
                Position / Company <SortIcon field="createdAt" />
              </div>
              <div>Location</div>
              <div className="flex items-center gap-1 cursor-pointer hover:text-gray-800" onClick={() => toggleSort('salary')}>
                Salary <SortIcon field="salary" />
              </div>
              <div>Type</div>
              <div>Posted</div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : sortedJobs.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">💼</div>
                <p className="text-gray-500 font-medium">No jobs found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or be the first to post a job!</p>
              </div>
            ) : (
              <div>
                {sortedJobs.map(job => {
                  const d = job.jobDetails || {};
                  const isSelected = selectedJob?._id === job._id;
                  return (
                    <div key={job._id}>
                      <div
                        className={`grid grid-cols-[2fr_1.2fr_1fr_0.8fr_0.8fr] gap-4 px-5 py-4 border-b border-gray-100 cursor-pointer transition-colors ${isSelected ? 'bg-bus-blue-50 border-l-4 border-l-bus-blue-600' : 'hover:bg-gray-50'}`}
                        onClick={() => setSelectedJob(isSelected ? null : job)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar src={job.author?.avatar} name={job.author?.name} size="sm" />
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-gray-900 truncate">{d.position || 'Job Opening'}</div>
                            <div className="text-xs text-gray-500 truncate">{job.author?.companyName || job.author?.name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 min-w-0">
                          <MapPin size={12} className="flex-shrink-0 text-gray-400" />
                          <span className="truncate">{d.jobLocation || '—'}</span>
                        </div>
                        <div className="flex items-center text-sm font-medium text-bus-green-700">
                          {formatSalary(d)}
                        </div>
                        <div>
                          {d.jobType ? (
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${jobTypeBg[d.jobType] || 'bg-gray-100 text-gray-600'}`}>
                              {d.jobType}
                            </span>
                          ) : '—'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                        </div>
                      </div>

                      {/* Expanded row */}
                      {isSelected && (
                        <div className="bg-bus-blue-50 border-b border-bus-blue-100 px-5 py-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                              <h3 className="font-semibold text-gray-900 mb-2">{d.position}</h3>
                              <p className="text-sm text-gray-700 leading-relaxed">{job.content}</p>
                              {d.experience && (
                                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                                  <span className="font-medium">Experience:</span> {d.experience}
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="font-semibold text-sm text-gray-700 mb-2">Contact to Apply</div>
                              {d.contactEmail && (
                                <a href={`mailto:${d.contactEmail}`} className="flex items-center gap-2 text-sm text-bus-blue-600 hover:underline">
                                  <Mail size={14} /> {d.contactEmail}
                                </a>
                              )}
                              {d.contactPhone && (
                                <a href={`tel:${d.contactPhone}`} className="flex items-center gap-2 text-sm text-bus-blue-600 hover:underline">
                                  <Phone size={14} /> {d.contactPhone}
                                </a>
                              )}
                              <Link to={`/profile/${job.author?._id}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-bus-blue-600 mt-2">
                                <Avatar src={job.author?.avatar} name={job.author?.name} size="xs" />
                                View {job.author?.name}'s profile
                              </Link>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            {d.contactEmail && (
                              <a href={`mailto:${d.contactEmail}?subject=Application for ${d.position}`} className="btn-primary text-xs py-1.5 px-4">
                                Apply via Email
                              </a>
                            )}
                            <Link to={`/post/${job._id}`} className="btn-secondary text-xs py-1.5 px-4">View Full Post</Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
