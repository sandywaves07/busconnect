import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, Users, Briefcase, ShoppingBag, Shield, TrendingUp, MessageSquare, Star, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';
import api from '../services/api';
import toast from 'react-hot-toast';

function GuestModal({ isOpen, onClose }) {
  const { guestLogin } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [role, setRole] = useState('operator');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuest = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Please enter your name');
    setLoading(true);
    try {
      await guestLogin(name.trim(), role, company.trim());
      navigate('/');
    } catch {
      toast.error('Could not create guest session. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Continue as Guest" size="sm">
      <form onSubmit={handleGuest} className="space-y-4">
        <p className="text-sm text-gray-600">Browse BusConnect without creating an account. Enter your details to get started.</p>
        <div>
          <label className="label">Your Name *</label>
          <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rajesh Kumar" autoFocus />
        </div>
        <div>
          <label className="label">I am a...</label>
          <select className="input-field" value={role} onChange={e => setRole(e.target.value)}>
            <option value="operator">Bus Operator</option>
            <option value="driver">Bus Driver</option>
            <option value="vendor">Parts Vendor</option>
            <option value="mechanic">Mechanic</option>
          </select>
        </div>
        <div>
          <label className="label">Company / Organisation (optional)</label>
          <input className="input-field" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. MKT Travels" />
        </div>
        <button type="submit" disabled={loading || !name.trim()} className="w-full btn-primary py-2.5 disabled:opacity-50">
          {loading ? 'Joining...' : 'Continue as Guest →'}
        </button>
        <p className="text-xs text-gray-400 text-center">Guest sessions are temporary. <Link to="/register" className="text-bus-blue-600 underline">Register</Link> to save your data.</p>
      </form>
    </Modal>
  );
}

function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign In to BusConnect" size="sm">
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="label">Email Address</label>
          <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" autoFocus />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" />
        </div>
        <button type="submit" disabled={loading} className="w-full btn-primary py-2.5">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p className="text-xs text-center text-gray-500">
          Test: <span className="font-mono">rajesh@mkttravels.com</span> / <span className="font-mono">password123</span>
        </p>
      </form>
    </Modal>
  );
}

function RegisterModal({ isOpen, onClose }) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'operator', companyName: '', location: '' });
  const [loading, setLoading] = useState(false);
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Name, email and password required');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join BusConnect" size="sm">
      <form onSubmit={handleRegister} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">Full Name *</label>
            <input className="input-field" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Rajesh Kumar" />
          </div>
          <div className="col-span-2">
            <label className="label">Email Address *</label>
            <input type="email" className="input-field" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@company.com" />
          </div>
          <div className="col-span-2">
            <label className="label">Password *</label>
            <input type="password" className="input-field" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="label">I am a...</label>
            <select className="input-field" value={form.role} onChange={e => update('role', e.target.value)}>
              <option value="operator">Bus Operator</option>
              <option value="driver">Bus Driver</option>
              <option value="vendor">Parts Vendor</option>
              <option value="mechanic">Mechanic</option>
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input-field" value={form.location} onChange={e => update('location', e.target.value)} placeholder="City, State" />
          </div>
          <div className="col-span-2">
            <label className="label">Company / Organisation</label>
            <input className="input-field" value={form.companyName} onChange={e => update('companyName', e.target.value)} placeholder="e.g. MKT Travels" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full btn-primary py-2.5 mt-2">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </Modal>
  );
}

const features = [
  { icon: Users, color: 'text-bus-blue-600 bg-bus-blue-100', title: 'Connect with Operators', desc: 'Network with 2,400+ bus operators, vendors, drivers, and mechanics across India.' },
  { icon: Briefcase, color: 'text-bus-green-600 bg-bus-green-100', title: 'Job Board', desc: 'Post and find jobs for drivers, mechanics, conductors, and more with detailed filters.' },
  { icon: ShoppingBag, color: 'text-bus-orange-600 bg-bus-orange-100', title: 'Parts Marketplace', desc: 'Buy and sell bus spare parts, tyres, seats, electrical components, and entire buses.' },
  { icon: MessageSquare, color: 'text-purple-600 bg-purple-100', title: 'Direct Messaging', desc: 'Connect directly with other operators for business partnerships and inquiries.' },
  { icon: TrendingUp, color: 'text-pink-600 bg-pink-100', title: 'Industry Insights', desc: 'Stay updated with compliance news, regulations, and industry trends.' },
  { icon: Shield, color: 'text-teal-600 bg-teal-100', title: 'Verified Operators', desc: 'Verified profiles build trust and credibility in all your business interactions.' },
];

const testimonials = [
  { name: 'Rajesh Kumar', company: 'MKT Travels', text: 'BusConnect helped us find 3 reliable drivers within a week. The platform is exactly what the industry needed.', stars: 5 },
  { name: 'Mohammed Ali', company: 'Ali Bus Parts', text: 'My spare parts business grew 40% after joining BusConnect. Operators from across India now contact me directly.', stars: 5 },
  { name: 'Deepa Nair', company: 'Kerala RTC', text: 'The job board is excellent. We sourced experienced hill-route drivers without any middlemen.', stars: 5 },
];

export default function LandingPage() {
  const [showGuest, setShowGuest] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-bus-blue-700 rounded-lg flex items-center justify-center">
              <Bus size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl text-bus-blue-800">BusConnect</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowGuest(true)} className="text-sm text-gray-600 hover:text-bus-blue-700 font-medium px-3 py-2">
              Browse as Guest
            </button>
            <button onClick={() => setShowLogin(true)} className="btn-secondary text-sm">Sign In</button>
            <button onClick={() => setShowRegister(true)} className="btn-primary text-sm">Join Free</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-bus-blue-900 via-bus-blue-800 to-bus-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-bus-orange-500 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/80 text-sm mb-6">
            <span className="w-2 h-2 bg-bus-green-400 rounded-full animate-pulse" />
            2,400+ Bus Industry Professionals
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            India's Professional Hub for<br />
            <span className="text-bus-orange-400">Bus Operators</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Connect with operators, post jobs, buy & sell parts, and stay updated with industry news — all in one platform built for the bus industry.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setShowRegister(true)} className="bg-bus-orange-500 hover:bg-bus-orange-600 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors flex items-center gap-2">
              Join BusConnect Free <ArrowRight size={18} />
            </button>
            <button onClick={() => setShowGuest(true)} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors border border-white/30">
              Browse as Guest
            </button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-bus-blue-800 py-6">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-4 gap-6">
          {[
            { value: '2,400+', label: 'Active Members' },
            { value: '890+', label: 'Parts Listed' },
            { value: '340+', label: 'Jobs Posted' },
            { value: '15', label: 'States Covered' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-blue-300 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything You Need to Run Your Bus Business</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Built specifically for India's bus industry — operators, drivers, vendors, and mechanics all in one community.</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {features.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card p-6 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Trusted by Operators Across India</h2>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="card p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} className="text-bus-orange-500 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-bus-blue-700">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Join India's Bus Industry Community?</h2>
          <p className="text-blue-100 mb-8">Join 2,400+ operators, drivers, and vendors already on BusConnect.</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setShowRegister(true)} className="bg-white text-bus-blue-700 hover:bg-gray-100 px-8 py-3.5 rounded-xl font-semibold transition-colors">
              Create Free Account
            </button>
            <button onClick={() => setShowGuest(true)} className="border border-white/40 text-white hover:bg-white/10 px-8 py-3.5 rounded-xl font-semibold transition-colors">
              Browse as Guest
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Bus size={16} className="text-bus-blue-400" />
          <span className="font-semibold text-white">BusConnect</span>
        </div>
        <p>© 2024 BusConnect. The Professional Hub for India's Bus Industry.</p>
      </footer>

      <GuestModal isOpen={showGuest} onClose={() => setShowGuest(false)} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <RegisterModal isOpen={showRegister} onClose={() => setShowRegister(false)} />
    </div>
  );
}
