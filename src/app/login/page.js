'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.post('/auth/login', { email, password });
      const token = res.accessToken || res.token;
      if (token) {
        setToken(token);
        // Return to the page they were on (if it was an /admin/* page).
        const dest = returnTo && returnTo.startsWith('/admin') ? returnTo : '/admin/dashboard';
        router.replace(dest);
      } else {
        setError('Invalid response: no token');
      }
    } catch (err) {
      setError(err.body?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-admin-dark px-4">
      <a href="/login" className="flex flex-col items-center mb-8">
        <Image
          src="/logo.png"
          alt="GloboGreen logo"
          width={120}
          height={120}
          className="object-contain"
          priority
        />
        <span className="text-sm text-slate-500 mt-2">www.globogreen.in</span>
      </a>
      <div className="w-full max-w-sm rounded-xl bg-admin-card border border-admin-border p-8 shadow-xl">
        <h1 className="text-xl font-semibold text-slate-100 mb-6">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-admin-muted mb-1">Email or username</label>
            <input
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. barani"
              className="w-full rounded-lg bg-admin-dark border border-admin-border px-3 py-2 text-slate-100 focus:border-admin-accent focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-admin-muted mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-admin-dark border border-admin-border px-3 py-2 text-slate-100 focus:border-admin-accent focus:outline-none"
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-admin-accent py-2.5 font-medium text-white hover:bg-sky-600 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
