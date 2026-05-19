'use client';

import { useEffect, useState } from 'react';
import { masterApi } from '@/lib/api';
import DataTable from '@/components/DataTable';

export default function MasterModelsPage() {
  const [list, setList] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [brandId, setBrandId] = useState('');
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('DEVICE');
  const [submitting, setSubmitting] = useState(false);
  const [filterBrand, setFilterBrand] = useState('');

  const loadBrands = async () => {
    try {
      const data = await masterApi.get('/master/brands');
      setBrands(Array.isArray(data) ? data : data?.content ?? []);
    } catch {
      setBrands([]);
    }
  };

  const loadModels = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await masterApi.get('/master/brands');
      const brandList = Array.isArray(data) ? data : data?.content ?? [];
      const all = [];
      for (const b of brandList) {
        const id = b.id ?? b.brandId;
        if (!id) continue;
        const models = await masterApi.get(`/master/brands/${id}/models`).catch(() => []);
        const arr = Array.isArray(models) ? models : [];
        all.push(...arr.map((m) => ({ ...m, brandId: id, brandName: b.name })));
      }
      setList(all);
    } catch (e) {
      setError(e.message || 'Failed to load');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);
  useEffect(() => {
    loadModels();
  }, []);

  const openCreate = () => {
    setModal({ type: 'create' });
    setBrandId(brands[0]?.id ?? '');
    setName('');
    setImageUrl('');
    setCategory('DEVICE');
  };
  const openEdit = (item) => {
    setModal({ type: 'edit', item });
    setBrandId(item.brandId || item.brand?.id || '');
    setName(item.name || '');
    setImageUrl(item.imageUrl || '');
    setCategory(item.category || 'DEVICE');
  };
  const closeModal = () => setModal(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !brandId) return;
    setSubmitting(true);
    try {
      if (modal.type === 'create') {
        await masterApi.post('/master/models', {
          brandId,
          name: name.trim(),
          imageUrl: imageUrl.trim() || null,
          category: category || null,
        });
      } else {
        await masterApi.put(`/master/models/${modal.item.id}`, {
          brandId,
          name: name.trim(),
          imageUrl: imageUrl.trim() || null,
          category: category || null,
        });
      }
      closeModal();
      loadModels();
    } catch (e) {
      setError(e.body?.message || e.message || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm('Delete this model?')) return;
    try {
      await masterApi.delete(`/master/models/${row.id}`);
      loadModels();
    } catch (e) {
      setError(e.body?.message || e.message || 'Delete failed');
    }
  };

  const filtered = filterBrand
    ? list.filter((r) => (r.brandId || r.brand?.id) === filterBrand)
    : list;

  const columns = [
    {
      key: 'brandName',
      label: 'Brand',
      render: (r) =>
        r.brandName ??
        brands.find((b) => (b.id ?? b.brandId) === (r.brandId ?? r.brand?.id))?.name ??
        r.brandId,
    },
    { key: 'name', label: 'Model name' },
    {
      key: 'category',
      label: 'Category',
      render: (r) => r.category || '—',
    },
    {
      key: 'imageUrl',
      label: 'Image URL',
      render: (r) => r.imageUrl || '—',
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-slate-100">Mobile Models</h1>
        <div className="flex items-center gap-3">
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="rounded-lg bg-admin-card border border-admin-border px-3 py-2 text-slate-200 text-sm"
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
          >
            Add model
          </button>
        </div>
      </div>
      <p className="text-admin-muted text-sm mb-4">
        Models are shown in the mobile app when a brand is selected (GET /api/master/brands/:id/models).
      </p>
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      {loading ? (
        <p className="text-admin-muted">Loading…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          onEdit={openEdit}
          onDelete={handleDelete}
          emptyMessage="No models."
        />
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-admin-card border border-admin-border p-6">
            <h2 className="text-lg font-medium text-slate-100 mb-4">
              {modal.type === 'create' ? 'New model' : 'Edit model'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-admin-muted mb-1">Brand</label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full rounded-lg bg-admin-dark border border-admin-border px-3 py-2 text-slate-100"
                  required
                >
                  <option value="">Select brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-admin-muted mb-1">Model name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg bg-admin-dark border border-admin-border px-3 py-2 text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-admin-muted mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg bg-admin-dark border border-admin-border px-3 py-2 text-slate-100"
                >
                  <option value="DEVICE">DEVICE</option>
                  <option value="SPARE_PART">SPARE_PART</option>
                </select>
                <p className="mt-1 text-xs text-admin-muted">
                  Used to distinguish full devices vs spare parts in the mobile app.
                </p>
              </div>
              <div>
                <label className="block text-sm text-admin-muted mb-1">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-lg bg-admin-dark border border-admin-border px-3 py-2 text-slate-100"
                  placeholder="https://…/device.png"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={closeModal} className="rounded-lg px-4 py-2 text-slate-300 hover:bg-admin-dark">Cancel</button>
                <button type="submit" disabled={submitting} className="rounded-lg bg-admin-accent px-4 py-2 text-white disabled:opacity-50">
                  {submitting ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
