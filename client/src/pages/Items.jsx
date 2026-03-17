import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../components/GlassCard';
import ItemCard from '../components/ItemCard';
import { categories, featuredItems } from '../data/mock';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

export default function Items() {
  const { token } = useAuth();
  const [items, setItems] = useState(featuredItems);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Tools',
    imageUrl: '',
    valueTier: 'LOW',
  });
  const [uploadStatus, setUploadStatus] = useState({ loading: false, error: '' });

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (category && category !== 'All') params.set('category', category);
      const path = params.toString() ? `/items?${params.toString()}` : '/items';
      const { items: apiItems } = await api.get(path, token);
      setItems(apiItems);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchItems();
    }
  }, [token, query, category]);

  const handleFormChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleCreateItem = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api.post('/items', form, token);
      setForm({ title: '', description: '', category: 'Tools', imageUrl: '', valueTier: 'LOW' });
      setUploadStatus({ loading: false, error: '' });
      fetchItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpload = async (event) => {
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

  const filteredItems = useMemo(() => {
    if (!items?.length) return [];
    return items.map((item) => ({
      ...item,
      owner: item.ownerId?.name || item.owner,
      trustScore: item.ownerId?.trustScore ?? item.trustScore ?? 0,
      trustTier: item.ownerId?.trustTier ?? item.trustTier,
      available: item.available ?? true,
    }));
  }, [items]);

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">Community Marketplace</h2>
          <p className="text-sm text-slate-600">
            Browse and borrow items shared inside your community.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-full bg-white/70 px-4 py-2">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            className="bg-transparent text-sm text-slate-700 outline-none"
            placeholder="Search items"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <GlassCard className="flex flex-wrap gap-3">
        {categories.map((entry) => (
          <button
            key={entry}
            onClick={() => setCategory(entry)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              entry === category
                ? 'bg-white text-slate-900 shadow-glass'
                : 'bg-white/70 text-slate-600 hover:text-slate-900'
            }`}
          >
            {entry}
          </button>
        ))}
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <GlassCard className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Share a new item</h3>
          <form className="space-y-3" onSubmit={handleCreateItem}>
            <input
              name="title"
              value={form.title}
              onChange={handleFormChange}
              placeholder="Item title"
              className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none"
            />
            <select
              name="category"
              value={form.category}
              onChange={handleFormChange}
              className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none"
            >
              {categories.filter((entry) => entry !== 'All').map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
            <select
              name="valueTier"
              value={form.valueTier}
              onChange={handleFormChange}
              className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none"
            >
              <option value="LOW">Low value (everyday items)</option>
              <option value="MEDIUM">Medium value</option>
              <option value="HIGH">High value</option>
            </select>
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              rows="3"
              placeholder="Describe the condition, accessories, and tips."
              className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none"
            />
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Item image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="w-full rounded-2xl bg-white/70 px-4 py-3 text-xs outline-none"
              />
              {uploadStatus.error ? (
                <p className="text-xs font-semibold text-rose-500">{uploadStatus.error}</p>
              ) : null}
              {form.imageUrl ? (
                <div className="rounded-2xl bg-white/70 p-3">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="h-40 w-full rounded-2xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                    className="mt-2 text-xs font-semibold text-slate-600"
                  >
                    Remove image
                  </button>
                </div>
              ) : null}
              <input
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleFormChange}
                placeholder="Or paste an image URL"
                className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none"
              />
            </div>
            <Button className="w-full" type="submit" disabled={uploadStatus.loading}>
              {uploadStatus.loading ? 'Uploading...' : 'Add Item'}
            </Button>
          </form>
        </GlassCard>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>{loading ? 'Loading items...' : `${filteredItems.length} items`}</span>
            {error ? <span className="text-xs font-semibold text-rose-500">{error}</span> : null}
          </div>
          {filteredItems.length ? (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredItems.map((item) => (
                <ItemCard key={item._id || item.id} item={item} />
              ))}
            </div>
          ) : (
            <GlassCard className="text-sm text-slate-600">
              No items yet. Be the first to share something with your community.
            </GlassCard>
          )}
        </div>
      </div>
    </section>
  );
}
