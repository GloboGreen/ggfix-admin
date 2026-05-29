'use client';

import { useEffect, useState } from 'react';
import { masterApi } from '@/lib/api';
import DataTable from '@/components/DataTable';

export default function MasterColorsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [name, setName] = useState('');
  const [hexCode, setHexCode] = useState('#000000');
  const [sortOrder, setSortOrder] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await masterApi.get('/master/colors');
      setList(Array.isArray(data) ? data : data?.content ?? []);
    } catch (e) {
      setError(e.message || 'Failed to load');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setModal({ type: 'create' });
    setName('');
    setHexCode('#000000');
    setSortOrder('0');
  };
  const openEdit = (item) => {
    setModal({ type: 'edit', item });
    setName(item.name || '');
    setHexCode(item.hexCode || '#000000');
    setSortOrder(String(item.sortOrder ?? 0));
  };
  const closeModal = () => setModal(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const body = {
        name: name.trim(),
        hexCode: hexCode.trim() || null,
        sortOrder: parseInt(sortOrder, 10) || 0,
      };
      if (modal.type === 'create') {
        await masterApi.post('/master/colors', body);
      } else {
        await masterApi.put(`/master/colors/${modal.item.id}`, body);
      }
      closeModal();
      load();
    } catch (e) {
      setError(e.body?.message || e.message || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm('Delete this color?')) return;
    try {
      await masterApi.delete(`/master/colors/${row.id}`);
      load();
    } catch (e) {
      setError(e.body?.message || e.message || 'Delete failed');
    }
  };

  const columns = [
    {
      key: 'swatch',
      label: '',
      render: (r) => (
        <span
          className="inline-block h-5 w-5 rounded border border-admin-border"
          style={{ backgroundColor: r.hexCode || 'transparent' }}
        />
      ),
    },
    { key: 'name', label: 'Name' },
    { key: 'hexCode', label: 'Hex', render: (r) => r.hexCode || '—' },
    { key: 'sortOrder', label: 'Sort', render: (r) => r.sortOrder ?? 0 },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-100">Colors</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
        >
          Add color
        </button>
      </div>
      <p className="text-admin-muted text-sm mb-4">
        Device color options (GET /api/master/colors).
      </p>
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      {loading ? (
        <p className="text-admin-muted">Loading…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={list}
          onEdit={openEdit}
          onDelete={handleDelete}
          emptyMessage="No colors."
        />
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-admin-card border border-admin-border p-6">
            <h2 className="text-lg font-medium text-slate-100 mb-4">
              {modal.type === 'create' ? 'New color' : 'Edit color'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-admin-muted mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg bg-admin-dark border border-admin-border px-3 py-2 text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-admin-muted mb-1">Hex code</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={hexCode}
                    onChange={(e) => setHexCode(e.target.value)}
                    className="h-10 w-12 rounded border border-admin-border bg-admin-dark"
                  />
                  <input
                    type="text"
                    value={hexCode}
                    onChange={(e) => setHexCode(e.target.value)}
                    className="flex-1 rounded-lg bg-admin-dark border border-admin-border px-3 py-2 text-slate-100"
                    placeholder="#RRGGBB"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-admin-muted mb-1">Sort order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full rounded-lg bg-admin-dark border border-admin-border px-3 py-2 text-slate-100"
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
