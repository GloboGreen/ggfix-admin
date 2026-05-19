const getBase = (key) => {
  if (typeof window === 'undefined') return process.env[`NEXT_PUBLIC_${key}`] || '';
  return process.env[`NEXT_PUBLIC_${key}`] || '';
};

export const MASTER_BASE = () => getBase('API_BASE') || getBase('API_BASE_URL') || 'http://localhost:8091';
export const AUTH_BASE = () => getBase('AUTH_BASE') || 'http://localhost:8081';
export const TICKET_BASE = () => getBase('TICKET_BASE') || 'http://localhost:8082';
export const SHOP_BASE = () => getBase('SHOP_BASE') || 'http://localhost:8084';
export const SUBSCRIPTION_BASE = () => getBase('SUBSCRIPTION_BASE') || 'http://localhost:8089';

async function request(base, path, options = {}) {
  const url = `${base.replace(/\/$/, '')}${path}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = new Error(res.statusText || 'Request failed');
    err.status = res.status;
    try { err.body = await res.json(); } catch { err.body = await res.text(); }
    throw err;
  }
  if (res.status === 204) return null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) return res.json();
  return res.text();
}

export const masterApi = {
  get: (path) => request(MASTER_BASE(), path),
  post: (path, body) => request(MASTER_BASE(), path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(MASTER_BASE(), path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(MASTER_BASE(), path, { method: 'DELETE' }),
};

export const authApi = {
  get: (path) => request(AUTH_BASE(), path),
  post: (path, body) => request(AUTH_BASE(), path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(AUTH_BASE(), path, { method: 'PATCH', body: JSON.stringify(body) }),
};

export const ticketApi = {
  get: (path) => request(TICKET_BASE(), path),
  post: (path, body) => request(TICKET_BASE(), path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(TICKET_BASE(), path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(TICKET_BASE(), path, { method: 'PATCH', body: JSON.stringify(body) }),
};

export const shopApi = {
  get: (path) => request(SHOP_BASE(), path),
  post: (path, body) => request(SHOP_BASE(), path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(SHOP_BASE(), path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(SHOP_BASE(), path, { method: 'PATCH', body: JSON.stringify(body) }),
};

export const subscriptionApi = {
  get: (path) => request(SUBSCRIPTION_BASE(), path),
  post: (path, body) => request(SUBSCRIPTION_BASE(), path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(SUBSCRIPTION_BASE(), path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(SUBSCRIPTION_BASE(), path, { method: 'PATCH', body: JSON.stringify(body) }),
};
