'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import DataTable from '@/components/DataTable';

export default function ShopsListPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authApi.get('/auth/shops');
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load shops');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (shop, status) => {
    try {
      await authApi.patch(`/auth/shops/${shop.id}/status`, { status });
      load();
    } catch (e) {
      setError(e.body?.message || e.message || 'Update failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (r) => r.name ?? r.shopName ?? '—' },
    { key: 'slug', label: 'Slug', render: (r) => r.slug ?? '—' },
    { key: 'email', label: 'Email', render: (r) => r.email ?? '—' },
    { key: 'phone', label: 'Phone', render: (r) => r.phone ?? '—' },
    { key: 'slug', label: 'Slug', render: (r) => r.slug ?? '—' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => {
        const s = (r.status ?? r.shopStatus ?? '').toLowerCase();
        return (
          <span className={s === 'active' ? 'text-emerald-400' : s === 'suspended' ? 'text-amber-400' : 'text-admin-muted'}>
            {s || '—'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => {
        const status = (r.status ?? r.shopStatus ?? '').toLowerCase();
        return (
          <div className="flex gap-3">
            <Link
              href={`/admin/shops/${r.id}/settings`}
              className="text-sky-400 hover:underline text-sm"
            >
              Settings
            </Link>
            {status !== 'active' && (
              <button
                type="button"
                onClick={() => setStatus(r, 'ACTIVE')}
                className="text-emerald-400 hover:underline text-sm"
              >
                Activate
              </button>
            )}
            {status !== 'suspended' && status !== 'inactive' && (
              <button
                type="button"
                onClick={() => setStatus(r, 'SUSPENDED')}
                className="text-amber-400 hover:underline text-sm"
              >
                Suspend
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-100">Shops</h1>
        <Link
          href="/admin/shops/new"
          className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
        >
          Create shop
        </Link>
      </div>
      <p className="text-admin-muted text-sm mb-4">
        Activate or suspend shops. Status is used to control shop visibility and access.
      </p>
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      {loading ? (
        <p className="text-admin-muted">Loading…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={list}
          keyExtractor={(r) => r.id ?? r.shopId ?? JSON.stringify(r)}
          emptyMessage="No shops. Create one to get started."
        />
      )}
    </div>
  );
}
