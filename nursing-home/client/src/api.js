const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `请求失败 (${res.status})`);
  }
  return res.json();
}

export const api = {
  // Dashboard
  getStats: () => request('/dashboard/stats'),

  // Admins
  getAdmins: () => request('/admins'),
  loginAdmin: (data) => request('/admins/login', { method: 'POST', body: JSON.stringify(data) }),
  createAdmin: (data) => request('/admins', { method: 'POST', body: JSON.stringify(data) }),
  updateAdmin: (id, data) => request(`/admins/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdmin: (id) => request(`/admins/${id}`, { method: 'DELETE' }),

  // Nurses
  getNurses: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/nurses${qs ? `?${qs}` : ''}`);
  },
  createNurse: (data) => request('/nurses', { method: 'POST', body: JSON.stringify(data) }),
  updateNurse: (id, data) => request(`/nurses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNurse: (id) => request(`/nurses/${id}`, { method: 'DELETE' }),

  // Relatives
  getRelatives: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/relatives${qs ? `?${qs}` : ''}`);
  },
  createRelative: (data) => request('/relatives', { method: 'POST', body: JSON.stringify(data) }),
  updateRelative: (id, data) => request(`/relatives/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRelative: (id) => request(`/relatives/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/orders${qs ? `?${qs}` : ''}`);
  },
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrder: (id, data) => request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateOrderStatus: (id, service_type) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ service_type }) }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),

  // Projects
  getProjects: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/projects${qs ? `?${qs}` : ''}`);
  },
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
};
