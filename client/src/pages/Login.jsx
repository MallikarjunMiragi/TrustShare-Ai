import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedButton from '../components/AnimatedButton';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="w-full max-w-md space-y-6 p-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-600">Sign in to your community</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@community.com"
                className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none"
              />
            </div>
            {error ? <p className="text-xs font-semibold text-rose-500">{error}</p> : null}
            <AnimatedButton className="w-full" type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </AnimatedButton>
          </form>
          <p className="text-xs text-slate-500">
            New here?{' '}
            <Link to="/register" className="font-semibold text-primary">
              Create an account
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
