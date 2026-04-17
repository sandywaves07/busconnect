import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    companyName: user?.companyName || '',
    companyType: user?.companyType || '',
    location: user?.location || '',
    phone: user?.phone || '',
    website: user?.website || '',
  });
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/me', form);
      updateUser(res.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="card p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h1>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input-field" value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input-field" value={form.location} onChange={e => update('location', e.target.value)} placeholder="City, State" />
            </div>
            <div>
              <label className="label">Company Name</label>
              <input className="input-field" value={form.companyName} onChange={e => update('companyName', e.target.value)} />
            </div>
            <div>
              <label className="label">Company Type</label>
              <input className="input-field" value={form.companyType} onChange={e => update('companyType', e.target.value)} placeholder="e.g. Bus Operator" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input-field" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91-98765-43210" />
            </div>
            <div>
              <label className="label">Website</label>
              <input className="input-field" value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://yourcompany.com" />
            </div>
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea className="input-field resize-none" rows={3} value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Tell the community about yourself..." maxLength={500} />
            <p className="text-xs text-gray-400 mt-1">{form.bio.length}/500</p>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary px-8 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
