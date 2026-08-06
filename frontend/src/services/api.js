import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification')
};

export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  getCategories: () => api.get('/services/categories'),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  assignProfessional: (serviceId, data) => api.post(`/services/${serviceId}/professionals`, data),
  removeProfessional: (serviceId, professionalId) => api.delete(`/services/${serviceId}/professionals/${professionalId}`)
};

export const branchesAPI = {
  getAll: () => api.get('/branches'),
  getAdmin: (params) => api.get('/branches/admin', { params }),
  getById: (id) => api.get(`/branches/${id}`),
  create: (data) => api.post('/branches', data),
  update: (id, data) => api.put(`/branches/${id}`, data),
  delete: (id) => api.delete(`/branches/${id}`),
  assignProfessional: (branchId, data) => api.post(`/branches/${branchId}/professionals`, data),
  removeProfessional: (branchId, professionalId) => api.delete(`/branches/${branchId}/professionals/${professionalId}`)
};

export const professionalsAPI = {
  getAll: (params) => api.get('/professionals', { params }),
  getAdmin: (params) => api.get('/professionals/admin', { params }),
  getById: (id) => api.get(`/professionals/${id}`),
  create: (data) => api.post('/professionals', data),
  update: (id, data) => api.put(`/professionals/${id}`, data),
  delete: (id) => api.delete(`/professionals/${id}`),
  assignService: (professionalId, data) => api.post(`/professionals/${professionalId}/services`, data),
  removeService: (professionalId, serviceId) => api.delete(`/professionals/${professionalId}/services/${serviceId}`),
  assignBranch: (professionalId, data) => api.post(`/professionals/${professionalId}/branches`, data),
  removeBranch: (professionalId, branchId) => api.delete(`/professionals/${professionalId}/branches/${branchId}`)
};

export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getUpcoming: () => api.get('/appointments/upcoming'),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  reschedule: (id, data) => api.post(`/appointments/${id}/reschedule`, data),
  cancel: (id, reason) => api.post(`/appointments/${id}/cancel`, { reason }),
  confirm: (id) => api.post(`/appointments/${id}/confirm`),
  complete: (id) => api.post(`/appointments/${id}/complete`),
  noShow: (id) => api.post(`/appointments/${id}/no-show`)
};

export const availabilityAPI = {
  getSlots: (params) => api.get('/availability/slots', { params }),
  getProfessionals: (params) => api.get('/availability/professionals', { params }),
  getBranch: (branchId, date) => api.get(`/availability/branch/${branchId}`, { params: { date } }),
  getCalendar: (params) => api.get('/availability/calendar', { params })
};

export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  refund: (id, data) => api.post(`/payments/${id}/refund`, data)
};

export const promotionsAPI = {
  getAll: (params) => api.get('/promotions', { params }),
  getAdmin: (params) => api.get('/promotions/admin', { params }),
  validate: (params) => api.get('/promotions/validate', { params }),
  getById: (id) => api.get(`/promotions/${id}`),
  create: (data) => api.post('/promotions', data),
  update: (id, data) => api.put(`/promotions/${id}`, data),
  delete: (id) => api.delete(`/promotions/${id}`),
  getUsages: (id, params) => api.get(`/promotions/${id}/usages`, { params })
};

export const loyaltyAPI = {
  getProgram: () => api.get('/loyalty/program'),
  getMyPoints: () => api.get('/loyalty/my-points'),
  getTransactions: (params) => api.get('/loyalty/transactions', { params }),
  redeem: (data) => api.post('/loyalty/redeem', data),
  adminAdjust: (data) => api.post('/loyalty/admin/adjust', data),
  adminGetTransactions: (params) => api.get('/loyalty/admin/transactions', { params }),
  adminUpdateProgram: (data) => api.put('/loyalty/admin/program', data)
};

export const galleryAPI = {
  getAll: (params) => api.get('/gallery', { params }),
  getAdmin: (params) => api.get('/gallery/admin', { params }),
  getCategories: () => api.get('/gallery/categories/list'),
  getById: (id) => api.get(`/gallery/${id}`),
  create: (data) => api.post('/gallery', data),
  update: (id, data) => api.put(`/gallery/${id}`, data),
  delete: (id) => api.delete(`/gallery/${id}`)
};

export const reviewsAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  getProfessionalStats: (professionalId) => api.get(`/reviews/professional/${professionalId}/stats`),
  getById: (id) => api.get(`/reviews/${id}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  respond: (id, response) => api.post(`/reviews/${id}/respond`, { response }),
  delete: (id) => api.delete(`/reviews/${id}`)
};

export const scheduleAPI = {
  getAll: (params) => api.get('/schedule', { params }),
  getProfessional: (professionalId, params) => api.get(`/schedule/professional/${professionalId}`, { params }),
  getById: (id) => api.get(`/schedule/${id}`),
  create: (data) => api.post('/schedule', data),
  update: (id, data) => api.put(`/schedule/${id}`, data),
  delete: (id) => api.delete(`/schedule/${id}`)
};

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getAppointments: (id, params) => api.get(`/users/${id}/appointments`, { params }),
  getPayments: (id, params) => api.get(`/users/${id}/payments`, { params }),
  getLoyalty: (id, params) => api.get(`/users/${id}/loyalty`, { params })
};

export default api;