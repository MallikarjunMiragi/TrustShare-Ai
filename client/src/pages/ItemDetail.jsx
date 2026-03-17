import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';
import TrustMeter from '../components/TrustMeter';
import { featuredItems } from '../data/mock';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function ItemDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const fallback = featuredItems.find((entry) => entry.id === Number(id)) || featuredItems[0];
  const [item, setItem] = useState(fallback);
  const [form, setForm] = useState({ durationDays: 3, message: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });
  const [uploadStatus, setUploadStatus] = useState({ loading: false, error: '', success: '' });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { item: data } = await api.get(`/items/${id}`, token);
        setItem({
          ...data,
          owner: data.ownerId?.name || data.owner,
          trustScore: data.ownerId?.trustScore ?? data.trustScore ?? 0,
        });
      } catch (err) {
        setStatus((prev) => ({ ...prev, error: err.message }));
      }
    };
    if (token) {
      fetchItem();
    }
  }, [id, token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequest = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: '', success: '' });
    try {
      await api.post(
        '/borrows',
        { itemId: item._id || id, durationDays: Number(form.durationDays), message: form.message },
        token
      );
      setStatus({ loading: false, error: '', success: 'Request sent to owner.' });
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: '' });
    }
  };

  const ownerId = item.ownerId?._id || item.ownerId;
  const isOwner = ownerId === (user?.id || user?._id);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadStatus({ loading: true, error: '', success: '' });
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { url } = await api.postForm('/uploads/image', formData, token);
      const { item: updated } = await api.patch(
        `/items/${item._id || id}`,
        { imageUrl: url },
        token
      );
      setItem({
        ...updated,
        owner: updated.ownerId?.name || item.owner,
        trustScore: updated.ownerId?.trustScore ?? item.trustScore,
      });
      setUploadStatus({ loading: false, error: '', success: 'Image updated.' });
    } catch (err) {
      setUploadStatus({ loading: false, error: err.message, success: '' });
    }
  };

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">{item.title}</h2>
        <p className="text-sm text-slate-600">{item.category} · Shared by {item.owner}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <GlassCard className="space-y-4">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-white/70 to-indigo-100/70 p-6">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="h-56 w-full rounded-2xl object-cover" />
            ) : (
              <p className="text-sm text-slate-600">
                High-quality community item in excellent condition.
              </p>
            )}
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              {item.description ||
                'This item is frequently shared and comes with verified accessories. Ideal for weekend projects and group activities.'}
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" /> Trust score {item.trustScore}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Borrow request</h3>
          <form className="space-y-3" onSubmit={handleRequest}>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Duration</label>
              <input
                type="number"
                name="durationDays"
                min="1"
                value={form.durationDays}
                onChange={handleChange}
                placeholder="Days"
                className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Message to owner</label>
              <textarea
                rows="3"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Add a quick note"
                className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none"
              />
            </div>
            {status.error ? (
              <p className="text-xs font-semibold text-rose-500">{status.error}</p>
            ) : null}
            {status.success ? (
              <p className="text-xs font-semibold text-emerald-500">{status.success}</p>
            ) : null}
            <AnimatedButton className="w-full" type="submit" disabled={status.loading}>
              {status.loading ? 'Sending...' : 'Send Request'}
            </AnimatedButton>
          </form>
        </GlassCard>
      </div>

      {isOwner ? (
        <GlassCard className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Update item image</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full rounded-2xl bg-white/70 px-4 py-3 text-xs outline-none"
          />
          {uploadStatus.error ? (
            <p className="text-xs font-semibold text-rose-500">{uploadStatus.error}</p>
          ) : null}
          {uploadStatus.success ? (
            <p className="text-xs font-semibold text-emerald-500">{uploadStatus.success}</p>
          ) : null}
        </GlassCard>
      ) : null}

      <GlassCard className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Owner profile</h3>
          <p className="text-sm text-slate-600">{item.owner} · Trusted Neighbor</p>
        </div>
        <TrustMeter value={item.trustScore} />
      </GlassCard>
    </section>
  );
}
