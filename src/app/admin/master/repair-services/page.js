'use client';

import { useEffect, useState } from 'react';
import { masterApi } from '@/lib/api';
import DataTable from '@/components/DataTable';

export default function MasterRepairServicesPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await masterApi.get('/master/repair-services');
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
    setCode('');
    setName('');
    setDescription('');
  };
  const openEdit = (item) => {
    setModal({ type: 'edit', item });
    setCode(item.code || '');
    setName(item.name || '');
    setDescription(item.description || '');
  };
  const closeModal = () => setModal(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    setSubmitting(true);
    try {
      const body = { code: code.trim(), name: name.trim(), description: description.trim() || null };
      if (modal.type === 'create') {
        await masterApi.post('/master/repair-services', body);
      } else {
        await masterApi.put(`/master/repair-services/${modal.item.id}`, body);
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
    if (!confirm('Delete this repair service?')) return;
    try {
      await masterApi.delete(`/master/repair-services/${row.id}`);
      load();
    } catch (e) {
      setError(e.body?.message || e.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description', render: (r) => r.description || '—' },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-100">Repair Services</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
        >
          Add service
        </button>
      </div>
      <p className="text-admin-muted text-sm mb-4">
        Used in mobile app repair booking (GET /api/master/repair-services).
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
          emptyMessage="No repair services."
        />
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-admin-card border border-admin-border p-6">
            <h2 className="text-lg font-medium text-slate-100 mb-4">
              {modal.type === 'create' ? 'New repair service' : 'Edit repair service'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-admin-muted mb-1">Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-lg bg-admin-dark border border-admin-border px-3 py-2 text-slate-100"
                  required
                />
              </div>
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
                <label className="block text-sm text-admin-muted mb-1">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg bg-admin-dark border border-admin-border px-3 py-2 text-slate-100"
                  rows={3}
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
