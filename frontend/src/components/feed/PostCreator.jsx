import React, { useState } from 'react';
import { Image, Briefcase, ShoppingBag, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Modal from '../ui/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'temporary'];
const CATEGORIES = ['engine-parts', 'body-parts', 'electrical', 'brakes', 'tyres', 'seats', 'buses', 'tools', 'other'];
const CONDITIONS = ['new', 'excellent', 'good', 'fair', 'for-parts'];
const SALARY_UNITS = ['hourly', 'monthly', 'annual'];

function JobFields({ data, onChange }) {
  return (
    <div className="space-y-3 mt-3 p-4 bg-bus-blue-50 rounded-xl border border-bus-blue-100">
      <h4 className="text-sm font-semibold text-bus-blue-800">Job Details</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Position / Role *</label>
          <input className="input-field" value={data.position || ''} onChange={e => onChange('position', e.target.value)} placeholder="e.g. Senior Bus Driver" />
        </div>
        <div>
          <label className="label">Job Location *</label>
          <input className="input-field" value={data.jobLocation || ''} onChange={e => onChange('jobLocation', e.target.value)} placeholder="e.g. Mumbai, Maharashtra" />
        </div>
        <div>
          <label className="label">Experience Required</label>
          <input className="input-field" value={data.experience || ''} onChange={e => onChange('experience', e.target.value)} placeholder="e.g. 3+ years" />
        </div>
        <div>
          <label className="label">Job Type</label>
          <select className="input-field" value={data.jobType || ''} onChange={e => onChange('jobType', e.target.value)}>
            <option value="">Select type</option>
            {JOB_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Salary Min (₹)</label>
          <input type="number" className="input-field" value={data.salaryMin || ''} onChange={e => onChange('salaryMin', e.target.value)} placeholder="25000" />
        </div>
        <div>
          <label className="label">Salary Max (₹)</label>
          <input type="number" className="input-field" value={data.salaryMax || ''} onChange={e => onChange('salaryMax', e.target.value)} placeholder="40000" />
        </div>
        <div>
          <label className="label">Salary Period</label>
          <select className="input-field" value={data.salaryUnit || 'monthly'} onChange={e => onChange('salaryUnit', e.target.value)}>
            {SALARY_UNITS.map(u => <option key={u} value={u} className="capitalize">{u}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Contact Email</label>
          <input type="email" className="input-field" value={data.contactEmail || ''} onChange={e => onChange('contactEmail', e.target.value)} placeholder="hr@company.com" />
        </div>
        <div>
          <label className="label">Contact Phone</label>
          <input className="input-field" value={data.contactPhone || ''} onChange={e => onChange('contactPhone', e.target.value)} placeholder="+91-98765-43210" />
        </div>
      </div>
    </div>
  );
}

function MarketplaceFields({ data, onChange }) {
  return (
    <div className="space-y-3 mt-3 p-4 bg-bus-orange-50 rounded-xl border border-bus-orange-100">
      <h4 className="text-sm font-semibold text-bus-orange-800">Listing Details</h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Listing Title *</label>
          <input className="input-field" value={data.listingTitle || ''} onChange={e => onChange('listingTitle', e.target.value)} placeholder="e.g. Ashok Leyland Engine Parts - Set of 6" />
        </div>
        <div>
          <label className="label">Price (₹) *</label>
          <input type="number" className="input-field" value={data.price || ''} onChange={e => onChange('price', e.target.value)} placeholder="45000" />
        </div>
        <div>
          <label className="label">Category *</label>
          <select className="input-field" value={data.category || ''} onChange={e => onChange('category', e.target.value)}>
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.replace('-', ' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Condition *</label>
          <select className="input-field" value={data.condition || ''} onChange={e => onChange('condition', e.target.value)}>
            <option value="">Select condition</option>
            {CONDITIONS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Location</label>
          <input className="input-field" value={data.listingLocation || ''} onChange={e => onChange('listingLocation', e.target.value)} placeholder="e.g. Chennai, Tamil Nadu" />
        </div>
        <div>
          <label className="label">Contact Email</label>
          <input type="email" className="input-field" value={data.contactEmail || ''} onChange={e => onChange('contactEmail', e.target.value)} placeholder="seller@company.com" />
        </div>
        <div>
          <label className="label">Contact Phone</label>
          <input className="input-field" value={data.contactPhone || ''} onChange={e => onChange('contactPhone', e.target.value)} placeholder="+91-98765-43210" />
        </div>
        <div className="flex items-center gap-2 col-span-2">
          <input type="checkbox" id="negotiable" checked={!!data.priceNegotiable} onChange={e => onChange('priceNegotiable', e.target.checked)} className="rounded" />
          <label htmlFor="negotiable" className="text-sm text-gray-700">Price is negotiable</label>
        </div>
      </div>
    </div>
  );
}

export default function PostCreator({ onPostCreated }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('update');
  const [content, setContent] = useState('');
  const [jobDetails, setJobDetails] = useState({});
  const [marketplaceDetails, setMarketplaceDetails] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setContent('');
    setType('update');
    setJobDetails({});
    setMarketplaceDetails({});
  };

  const handleSubmit = async () => {
    if (!content.trim()) return toast.error('Please add some content');
    if (type === 'job' && !jobDetails.position) return toast.error('Position is required for job postings');
    if (type === 'marketplace' && (!marketplaceDetails.listingTitle || !marketplaceDetails.price || !marketplaceDetails.category || !marketplaceDetails.condition)) {
      return toast.error('Please fill all required marketplace fields');
    }

    setSubmitting(true);
    try {
      const payload = { type, content };
      if (type === 'job') payload.jobDetails = jobDetails;
      if (type === 'marketplace') payload.marketplaceDetails = marketplaceDetails;

      const res = await api.post('/posts', payload);
      toast.success('Post published!');
      onPostCreated && onPostCreated(res.data);
      setIsOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish post');
    } finally {
      setSubmitting(false);
    }
  };

  const typeOptions = [
    { value: 'update', label: 'Industry Update', icon: '📢', color: 'border-bus-green-500 text-bus-green-700 bg-bus-green-50' },
    { value: 'job', label: 'Job Posting', icon: '💼', color: 'border-bus-blue-500 text-bus-blue-700 bg-bus-blue-50' },
    { value: 'marketplace', label: 'Marketplace', icon: '🛒', color: 'border-bus-orange-500 text-bus-orange-700 bg-bus-orange-50' },
  ];

  const placeholders = {
    update: "Share an industry update, tip, or experience with the BusConnect community...",
    job: "Describe the role, requirements, and why candidates should apply...",
    marketplace: "Describe the item you're selling or looking for..."
  };

  return (
    <>
      {/* Trigger card */}
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <Avatar src={user?.avatar} name={user?.name} size="md" />
          <button
            onClick={() => setIsOpen(true)}
            className="flex-1 text-left px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 text-sm transition-colors"
          >
            What's on your mind, {user?.name?.split(' ')[0]}?
          </button>
        </div>
        <div className="flex gap-1 mt-3 pt-3 border-t border-gray-100">
          <button onClick={() => { setType('update'); setIsOpen(true); }} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-bus-green-700 hover:bg-bus-green-50 rounded-lg transition-colors font-medium">
            📢 Update
          </button>
          <button onClick={() => { setType('job'); setIsOpen(true); }} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-bus-blue-700 hover:bg-bus-blue-50 rounded-lg transition-colors font-medium">
            <Briefcase size={15} /> Job
          </button>
          <button onClick={() => { setType('marketplace'); setIsOpen(true); }} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-bus-orange-700 hover:bg-bus-orange-50 rounded-lg transition-colors font-medium">
            <ShoppingBag size={15} /> Sell Part
          </button>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); resetForm(); }}
        title="Create Post"
        size="md"
        footer={
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{content.length}/2000 characters</span>
            <div className="flex gap-2">
              <button onClick={() => { setIsOpen(false); resetForm(); }} className="btn-secondary">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting || !content.trim()} className="btn-primary disabled:opacity-50">
                {submitting ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </div>
        }
      >
        {/* Post type selector */}
        <div className="flex gap-2 mb-4">
          {typeOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg border-2 transition-all ${type === opt.value ? opt.color : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'}`}
            >
              <span>{opt.icon}</span> {opt.label}
            </button>
          ))}
        </div>

        {/* Author row */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar src={user?.avatar} name={user?.name} size="md" />
          <div>
            <div className="font-semibold text-sm">{user?.name}</div>
            <div className="text-xs text-gray-500">{user?.companyName || user?.role}</div>
          </div>
        </div>

        {/* Content */}
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={placeholders[type]}
          maxLength={2000}
          rows={5}
          className="w-full resize-none border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-bus-blue-200 focus:border-bus-blue-300 transition-all"
        />

        {/* Type-specific fields */}
        {type === 'job' && (
          <JobFields
            data={jobDetails}
            onChange={(key, val) => setJobDetails(prev => ({ ...prev, [key]: val }))}
          />
        )}
        {type === 'marketplace' && (
          <MarketplaceFields
            data={marketplaceDetails}
            onChange={(key, val) => setMarketplaceDetails(prev => ({ ...prev, [key]: val }))}
          />
        )}
      </Modal>
    </>
  );
}
