import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedButton from '../components/AnimatedButton';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [mode, setMode] = useState('join');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    inviteCode: '',
    communityName: '',
  });
  const [error, setError] = useState('');
  const [createdInvite, setCreatedInvite] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setCreatedInvite('');
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
      };
      if (mode === 'join') {
        payload.inviteCode = form.inviteCode.trim().toUpperCase();
      } else {
        payload.createCommunity = true;
        payload.communityName = form.communityName.trim();
      }
      const response = await register(payload);
      if (mode === 'create' && response.community?.inviteCode) {
        setCreatedInvite(response.community.inviteCode);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="w-full max-w-lg space-y-6 p-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Join TrustShareAI</h2>
            <p className="text-sm text-slate-600">Create your community account</p>
          </div>
          <div className="flex gap-2 rounded-full bg-white/70 p-1 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setMode('join')}
              className={`flex-1 rounded-full px-3 py-2 transition ${
                mode === 'join' ? 'bg-white text-slate-900 shadow-glass' : ''
              }`}
            >
              Join with Code
            </button>
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`flex-1 rounded-full px-3 py-2 transition ${
                mode === 'create' ? 'bg-white text-slate-900 shadow-glass' : ''
              }`}
            >
              Create Community
            </button>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Name</label>
                <input
                  type="text"
                  placeholder="Aisha Malik"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Email</label>
                <input
                  type="email"
                  placeholder="you@community.com"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Password</label>
              <input
                type="password"
                placeholder="Create a strong password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none"
              />
            </div>
            {mode === 'join' ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Community Invite Code</label>
                <input
                  type="text"
                  name="inviteCode"
                  value={form.inviteCode}
                  onChange={handleChange}
                  placeholder="ENTER CODE"
                  className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm uppercase tracking-widest outline-none"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Community Name</label>
                <input
                  type="text"
                  name="communityName"
                  value={form.communityName}
                  onChange={handleChange}
                  placeholder="Sunrise Campus"
                  className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none"
                />
              </div>
            )}
            {error ? <p className="text-xs font-semibold text-rose-500">{error}</p> : null}
            <AnimatedButton className="w-full" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </AnimatedButton>
          </form>
          {createdInvite ? (
            <div className="rounded-2xl bg-white/70 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Community invite code</p>
              <p className="mt-1 text-xs text-slate-500">Share this code with your members</p>
              <p className="mt-3 text-lg font-semibold tracking-widest text-primary">
                {createdInvite}
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-3 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white"
              >
                Continue to Dashboard
              </button>
            </div>
          ) : null}
          <p className="text-xs text-slate-500">
            Already a member?{' '}
            <Link to="/login" className="font-semibold text-primary">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
