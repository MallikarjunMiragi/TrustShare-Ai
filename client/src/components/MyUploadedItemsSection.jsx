import { AnimatePresence, motion } from 'framer-motion';
import {
  Boxes,
  CalendarDays,
  Edit3,
  ImagePlus,
  Package2,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { categories } from '../data/mock';
import { api } from '../lib/api';
import AnimatedButton from './AnimatedButton';
import GlassCard from './GlassCard';
import { Button } from './ui/button';

const emptyForm = {
  title: '',
  description: '',
  category: 'Tools',
  valueTier: 'LOW',
  imageUrl: '',
  available: true,
};

const formatDate = (value) => {
  if (!value) return 'Recently added';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function MyUploadedItemsSection({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });
  const [uploadStatus, setUploadStatus] = useState({ loading: false, error: '' });
  const [deletingId, setDeletingId] = useState('');

  const fetchMyItems = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/items?owner=me', token);
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyItems();
    }
  }, [token]);

  const summary = useMemo(() => {
    const availableCount = items.filter((item) => item.available).length;
    return {
      total: items.length,
      available: availableCount,
      unavailable: items.length - availableCount,
    };
  }, [items]);

  const openEditor = (item) => {
    setSelectedItem(item);
    setForm({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'Tools',
      valueTier: item.valueTier || 'LOW',
      imageUrl: item.imageUrl || '',
      available: item.available ?? true,
    });
    setStatus({ loading: false, error: '', success: '' });
    setUploadStatus({ loading: false, error: '' });
  };

  const closeEditor = () => {
    setSelectedItem(null);
    setForm(emptyForm);
    setStatus({ loading: false, error: '', success: '' });
    setUploadStatus({ loading: false, error: '' });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadStatus({ loading: true, error: '' });
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { url } = await api.postForm('/uploads/image', formData, token);
      setForm((prev) => ({ ...prev, imageUrl: url }));
      setUploadStatus({ loading: false, error: '' });
    } catch (err) {
      setUploadStatus({ loading: false, error: err.message });
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!selectedItem?._id) return;
    setStatus({ loading: true, error: '', success: '' });
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        valueTier: form.valueTier,
        imageUrl: form.imageUrl,
      };
      const [{ item: updatedItem }] = await Promise.all([
        api.patch(`/items/${selectedItem._id}`, payload, token),
        form.available !== selectedItem.available
          ? api.patch(`/items/${selectedItem._id}/availability`, { available: form.available }, token)
          : Promise.resolve(null),
      ]);

      setItems((prev) =>
        prev.map((item) =>
          item._id === selectedItem._id
            ? { ...item, ...updatedItem, available: form.available }
            : item
        )
      );
      setSelectedItem((prev) => (prev ? { ...prev, ...updatedItem, available: form.available } : prev));
      setStatus({ loading: false, error: '', success: 'Item updated successfully.' });
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: '' });
    }
  };

  const handleRemove = async (item) => {
    if (!item?._id) return;
    const confirmed = window.confirm(
      `Remove "${item.title}" from your community marketplace? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(item._id);
    setError('');
    try {
      await api.delete(`/items/${item._id}`, token);
      setItems((prev) => prev.filter((entry) => entry._id !== item._id));
      if (selectedItem?._id === item._id) {
        closeEditor();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId('');
    }
  };

  return (
    <>
      <GlassCard hoverable={false} className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-slate-900">My Uploaded Items</h3>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Manage the items you have shared with your community from one place.
            </p>
          </div>
          <div className="grid min-w-[220px] gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/70 p-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Total
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.total}</p>
            </div>
            <div className="rounded-2xl bg-emerald-100/80 p-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Available
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-800">{summary.available}</p>
            </div>
            <div className="rounded-2xl bg-amber-100/80 p-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                Inactive
              </p>
              <p className="mt-1 text-2xl font-semibold text-amber-800">{summary.unavailable}</p>
            </div>
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((entry) => (
              <div
                key={entry}
                className="rounded-[1.75rem] bg-white/60 p-5 shadow-glass"
              >
                <div className="h-36 animate-pulse rounded-2xl bg-slate-200/70" />
                <div className="mt-4 h-5 w-2/3 animate-pulse rounded-full bg-slate-200/70" />
                <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-slate-200/60" />
              </div>
            ))}
          </div>
        ) : items.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: index * 0.04 }}
                className="rounded-[1.9rem] bg-white/70 p-5 shadow-glass"
              >
                <div className="overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-white via-white/70 to-primary/10">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-44 w-full object-cover transition duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center">
                      <Package2 className="h-10 w-10 text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">{item.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.category} · {item.valueTier} value
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.available
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="line-clamp-2">
                    {item.description || 'No description added yet. Add a few details to build trust.'}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays className="h-4 w-4" /> Added on {formatDate(item.createdAt)}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <Button type="button" variant="secondary" size="sm" onClick={() => openEditor(item)}>
                    <Edit3 className="h-4 w-4" />
                    Update
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => handleRemove(item)}
                    disabled={deletingId === item._id}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingId === item._id ? 'Removing...' : 'Remove'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] bg-white/70 p-8 text-center">
            <Package2 className="mx-auto h-10 w-10 text-slate-400" />
            <h4 className="mt-4 text-lg font-semibold text-slate-900">No uploaded items yet</h4>
            <p className="mt-2 text-sm text-slate-600">
              Add an item from the marketplace page, and it will appear here for quick management.
            </p>
          </div>
        )}
      </GlassCard>

      <AnimatePresence>
        {selectedItem ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 26, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 26, scale: 0.96 }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
              className="glass-card w-full max-w-3xl overflow-hidden rounded-[2rem] p-0"
            >
              <div className="relative bg-gradient-to-br from-white/90 via-white/70 to-sky-100/60 p-6">
                <motion.div
                  animate={{ y: [0, -10, 0], x: [0, 4, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute right-8 top-8 h-24 w-24 rounded-full bg-primary/20 blur-3xl"
                />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Item manager
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                      Update {selectedItem.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Fine-tune trust, availability, and presentation for this item.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="rounded-full bg-white/70 p-2 text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <form className="space-y-5 p-6" onSubmit={handleSave}>
                <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-xs font-semibold text-slate-600">Title</span>
                        <input
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          className="w-full rounded-2xl bg-white/75 px-4 py-3 text-sm outline-none ring-1 ring-white/50 focus:ring-primary/30"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-xs font-semibold text-slate-600">Category</span>
                        <select
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          className="w-full rounded-2xl bg-white/75 px-4 py-3 text-sm outline-none ring-1 ring-white/50 focus:ring-primary/30"
                        >
                          {categories
                            .filter((entry) => entry !== 'All')
                            .map((entry) => (
                              <option key={entry} value={entry}>
                                {entry}
                              </option>
                            ))}
                        </select>
                      </label>
                    </div>

                    <label className="space-y-2">
                      <span className="text-xs font-semibold text-slate-600">Description</span>
                      <textarea
                        rows="5"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full rounded-2xl bg-white/75 px-4 py-3 text-sm outline-none ring-1 ring-white/50 focus:ring-primary/30"
                      />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-xs font-semibold text-slate-600">Value tier</span>
                        <select
                          name="valueTier"
                          value={form.valueTier}
                          onChange={handleChange}
                          className="w-full rounded-2xl bg-white/75 px-4 py-3 text-sm outline-none ring-1 ring-white/50 focus:ring-primary/30"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                        </select>
                      </label>

                      <label className="space-y-2">
                        <span className="text-xs font-semibold text-slate-600">Availability</span>
                        <select
                          name="available"
                          value={form.available ? 'true' : 'false'}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              available: event.target.value === 'true',
                            }))
                          }
                          className="w-full rounded-2xl bg-white/75 px-4 py-3 text-sm outline-none ring-1 ring-white/50 focus:ring-primary/30"
                        >
                          <option value="true">Available</option>
                          <option value="false">Unavailable</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.6rem] bg-white/70 p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <ImagePlus className="h-4 w-4 text-primary" />
                        Item image
                      </div>
                      {form.imageUrl ? (
                        <img
                          src={form.imageUrl}
                          alt={form.title}
                          className="h-48 w-full rounded-[1.3rem] object-cover"
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center rounded-[1.3rem] bg-slate-100 text-slate-400">
                          <Package2 className="h-10 w-10" />
                        </div>
                      )}
                      <div className="mt-4 space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="w-full rounded-2xl bg-white px-4 py-3 text-xs outline-none"
                        />
                        <input
                          name="imageUrl"
                          value={form.imageUrl}
                          onChange={handleChange}
                          placeholder="Or paste an image URL"
                          className="w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                        >
                          Clear image
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-[1.6rem] bg-gradient-to-r from-primary/10 to-emerald-100/90 p-4 text-sm text-slate-700">
                      <p className="flex items-center gap-2 font-semibold text-slate-900">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Trust tip
                      </p>
                      <p className="mt-2">
                        Accurate descriptions and good images make owners look more reliable and improve
                        acceptance rates for future requests.
                      </p>
                    </div>
                  </div>
                </div>

                {uploadStatus.error ? (
                  <p className="rounded-2xl bg-rose-100 px-4 py-3 text-xs font-semibold text-rose-700">
                    {uploadStatus.error}
                  </p>
                ) : null}

                {status.error ? (
                  <p className="rounded-2xl bg-rose-100 px-4 py-3 text-xs font-semibold text-rose-700">
                    {status.error}
                  </p>
                ) : null}

                {status.success ? (
                  <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-xs font-semibold text-emerald-700">
                    {status.success}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => handleRemove(selectedItem)}
                    disabled={deletingId === selectedItem._id}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingId === selectedItem._id ? 'Removing...' : 'Remove Item'}
                  </Button>

                  <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="secondary" onClick={closeEditor}>
                      Cancel
                    </Button>
                    <AnimatedButton type="submit" disabled={status.loading || uploadStatus.loading}>
                      {status.loading ? 'Saving...' : 'Save Changes'}
                    </AnimatedButton>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
