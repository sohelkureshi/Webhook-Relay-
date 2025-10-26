// import { API_BASE_URL } from './config';
// import { getAdminKey } from './auth';

// async function request(path, { method = 'GET', body, admin = false } = {}) {
//   const headers = { 'Content-Type': 'application/json' };
//   if (admin) {
//     const k = getAdminKey();
//     if (k) headers['x-api-key'] = k;
//   }
//   const res = await fetch(`${API_BASE_URL}${path}`, {
//     method,
//     headers,
//     body: body ? JSON.stringify(body) : undefined
//   });
//   const text = await res.text();
//   let data;
//   try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
//   if (!res.ok) {
//     const msg = data?.error || data?.message || `HTTP_${res.status}`;
//     throw new Error(msg);
//   }
//   return data;
// }

// export const api = {
//   health: () => request('/api/health'),
//   // webhooks
//   listWebhooks: () => request('/api/webhooks', { admin: true }),
//   createWebhook: (payload) => request('/api/webhooks', { method: 'POST', body: payload, admin: true }),
//   updateWebhook: (id, payload) => request(`/api/webhooks/${id}`, { method: 'PATCH', body: payload, admin: true }),
//   deleteWebhook: (id) => request(`/api/webhooks/${id}`, { method: 'DELETE', admin: true }),
//   // deliveries and metrics
//   listDeliveries: (q = {}) => {
//     const params = new URLSearchParams(q).toString();
//     const url = `/api/admin/deliveries${params ? `?${params}` : ''}`;
//     return request(url, { admin: true });
//   },
//   retryDelivery: (id) => request(`/api/admin/deliveries/${id}/retry`, { method: 'POST', admin: true }),
//   metrics: () => request('/api/admin/metrics', { admin: true })
// };

import { API_BASE_URL } from './config';
import { getAdminKey } from './auth';

function buildQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === 'string' && v.trim() === '') return;
    sp.append(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

async function request(path, { method = 'GET', body, admin = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (admin) {
    const k = getAdminKey();
    if (k) headers['x-api-key'] = k;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP_${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  health: () => request('/api/health'),
  listWebhooks: () => request('/api/webhooks', { admin: true }),
  createWebhook: (payload) => request('/api/webhooks', { method: 'POST', body: payload, admin: true }),
  updateWebhook: (id, payload) => request(`/api/webhooks/${id}`, { method: 'PATCH', body: payload, admin: true }),
  deleteWebhook: (id) => request(`/api/webhooks/${id}`, { method: 'DELETE', admin: true }),

  listDeliveries: (q = {}) => {
    const qs = buildQuery(q);
    return request(`/api/admin/deliveries${qs}`, { admin: true });
  },
  retryDelivery: (id) => request(`/api/admin/deliveries/${id}/retry`, { method: 'POST', admin: true }),
  metrics: () => request('/api/admin/metrics', { admin: true })
};
