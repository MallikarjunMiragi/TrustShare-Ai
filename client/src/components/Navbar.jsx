import { NavLink, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, token } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const data = await api.get('/communities/me', token);
        const adminId = data.community?.adminId;
        const userId = user?.id || user?._id;
        if (!adminId || !userId) {
          setIsAdmin(false);
          return;
        }
        setIsAdmin(adminId.toString ? adminId.toString() === userId : adminId === userId);
      } catch (error) {
        setIsAdmin(false);
      }
    };
    if (user && token) {
      fetchCommunity();
    } else {
      setIsAdmin(false);
    }
  }, [user, token]);

  const links = [
    { label: 'Home', to: '/' },
    { label: 'Items', to: '/items' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Profile', to: '/profile' },
    { label: 'Requests', to: '/requests' },
  ];
  if (isAdmin) {
    links.push({ label: 'Community', to: '/community' });
    links.push({ label: 'Admin', to: '/admin' });
  }

  return (
    <header className="sticky top-6 z-20 mx-auto w-full max-w-6xl px-6">
      <div className="glass-card flex items-center justify-between rounded-full px-6 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          TrustShareAI
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'transition-colors hover:text-slate-900',
                  isActive && 'text-slate-900'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-xs font-semibold text-slate-600 md:inline">
                {user.name} · Trust {user.trustScore ?? 0}
              </span>
              <button
                onClick={logout}
                className="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Join Community
              </Link>
              <Link
                to="/login"
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-glow"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
