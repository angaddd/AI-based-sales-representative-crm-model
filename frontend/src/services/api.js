import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Leads API
export const leadsAPI = {
  getAll: (filters = {}) => apiClient.get('/crm/leads/', { params: filters }),
  getOne: (id) => apiClient.get(`/crm/leads/${id}/`),
  create: (data) => apiClient.post('/crm/leads/', data),
  update: (id, data) => apiClient.patch(`/crm/leads/${id}/`, data),
  delete: (id) => apiClient.delete(`/crm/leads/${id}/`),
  getAnalytics: (timeframe = 30) => apiClient.get('/crm/leads/analytics/', { params: { timeframe } }),
  assign: (id, companyUserId) => apiClient.post(`/crm/leads/${id}/assign/`, { assigned_to_id: companyUserId }),
  updateStatus: (id, status) => apiClient.post(`/crm/leads/${id}/update_status/`, { status }),
};

// Events API
export const eventsAPI = {
  getAll: () => apiClient.get('/crm/events/'),
  track: (data) => apiClient.post('/crm/events/track/', data),
};

// Recommendations API
export const recommendationsAPI = {
  getAll: (filters = {}) => apiClient.get('/crm/recommendations/', { params: filters }),
  action: (id, notes = '') => apiClient.post(`/crm/recommendations/${id}/action/`, { action_notes: notes }),
  dismiss: (id) => apiClient.post(`/crm/recommendations/${id}/dismiss/`),
};

// Company Users API
export const companyUsersAPI = {
  getAll: () => apiClient.get('/auth/users/'),
  invite: (email, role) => apiClient.post('/auth/users/invite_user/', { email, role }),
};

export default apiClient;
