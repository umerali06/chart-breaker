import axios from 'axios';

// Resolve API base URL with production-safe defaults
const resolveApiBaseUrl = (): string => {
  const fromEnv = (process.env.REACT_APP_API_URL || '').trim();
  if (fromEnv) return fromEnv; // Explicit override

  // In production, prefer same-origin '/api' if backend is proxied behind the app
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    const origin = window.location.origin.replace(/\/$/, '');
    return `${origin}/api`;
  }

  // Development fallback
  return 'http://localhost:5000/api';
};

const API_BASE_URL = resolveApiBaseUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
};

export const patientsApi = {
  getPatients: (params: any = {}) => api.get('/patients', { params }),
  getPatient: (id: string) => api.get(`/patients/${id}`),
  createPatient: (data: any) => api.post('/patients', data),
  updatePatient: (id: string, data: any) => api.put(`/patients/${id}`, data),
  deletePatient: (id: string) => api.delete(`/patients/${id}`),
};

export const episodesApi = {
  getEpisodes: (params: any = {}) => api.get('/episodes', { params }),
  getEpisode: (id: string) => api.get(`/episodes/${id}`),
  createEpisode: (data: any) => api.post('/episodes', data),
  updateEpisode: (id: string, data: any) => api.put(`/episodes/${id}`, data),
  deleteEpisode: (id: string) => api.delete(`/episodes/${id}`),
};

export const schedulesApi = {
  getSchedules: (params: any = {}) => api.get('/schedules', { params }),
  getSchedule: (id: string) => api.get(`/schedules/${id}`),
  createSchedule: (data: any) => api.post('/schedules', data),
  updateSchedule: (id: string, data: any) => api.put(`/schedules/${id}`, data),
  deleteSchedule: (id: string) => api.delete(`/schedules/${id}`),
};

export const assessmentsApi = {
  getAssessments: (params: any = {}) => api.get('/assessments/oasis', { params }),
  getAssessment: (id: string) => api.get(`/assessments/oasis/${id}`),
  createAssessment: (data: any) => api.post('/assessments/oasis', data),
  updateAssessment: (id: string, data: any) => api.put(`/assessments/oasis/${id}`, data),
  deleteAssessment: (id: string) => api.delete(`/assessments/oasis/${id}`),
  signAssessment: (id: string) => api.patch(`/assessments/oasis/${id}/sign`),
};

export const usersApi = {
  getUsers: () => api.get('/users'),
  getAdminUsers: () => api.get('/users/admin'),
  updateUserStatus: (userId: string, isActive: boolean) => api.patch(`/users/${userId}/status`, { isActive }),
  updateUserRole: (userId: string, role: string) => api.patch(`/users/${userId}/role`, { role }),
};

export const billingApi = {
  getClaims: (params: any = {}) => api.get('/billing/claims', { params }),
  getClaim: (id: string) => api.get(`/billing/claims/${id}`),
  createClaim: (data: any) => api.post('/billing/claims', data),
  updateClaim: (id: string, data: any) => api.put(`/billing/claims/${id}`, data),
  updateClaimStatus: (id: string, status: string) => api.patch(`/billing/claims/${id}/status`, { status }),
  deleteClaim: (id: string) => api.delete(`/billing/claims/${id}`),
  getPayers: () => api.get('/billing/payers'),
};

export const qaApi = {
  getReviews: (params: any = {}) => api.get('/qa/reviews', { params }),
  getReview: (id: string) => api.get(`/qa/reviews/${id}`),
  createReview: (data: any) => api.post('/qa/reviews', data),
  updateReview: (id: string, data: any) => api.put(`/qa/reviews/${id}`, data),
  deleteReview: (id: string) => api.delete(`/qa/reviews/${id}`),
};

export const reportsApi = {
  getDashboardStats: () => api.get('/reports/dashboard'),
  getProductivityReport: () => api.get('/reports/productivity'),
  getRecentActivity: () => api.get('/reports/recent-activity'),
  getPatientCensus: () => api.get('/reports/patient-census'),
  getEpisodeSummary: () => api.get('/reports/episode-summary'),
  getBillingSummary: () => api.get('/reports/billing-summary'),
  getQACompliance: () => api.get('/reports/qa-compliance'),
  getOASISExport: () => api.get('/reports/oasis-export'),
};

// Referrals API
export const referralsApi = {
  getReferralsByPatient: (patientId: string) => api.get(`/referrals/patient/${patientId}`),
  getReferral: (referralId: string) => api.get(`/referrals/${referralId}`),
  createReferral: (data: any) => api.post('/referrals', data),
  updateReferral: (referralId: string, data: any) => api.put(`/referrals/${referralId}`, data),
  deleteReferral: (referralId: string) => api.delete(`/referrals/${referralId}`),
};

// Physicians API
export const physiciansApi = {
  getPhysicians: (params: any = {}) => api.get('/physicians', { params }),
  getPhysician: (physicianId: string) => api.get(`/physicians/${physicianId}`),
  createPhysician: (data: any) => api.post('/physicians', data),
  updatePhysician: (physicianId: string, data: any) => api.put(`/physicians/${physicianId}`, data),
  deletePhysician: (physicianId: string) => api.delete(`/physicians/${physicianId}`),
  getSpecialties: () => api.get('/physicians/specialties/list'),
};

// Auth Verification API
export const authVerificationApi = {
  requestRegistration: (data: any) => api.post('/auth-verification/request-registration', data),
  verifyEmail: (data: any) => api.post('/auth-verification/verify-email', data),
  completeRegistration: (data: any) => api.post('/auth-verification/complete-registration', data),
  getRegistrationStatus: (email: string) => api.get(`/auth-verification/registration-status/${email}`),
  getRegistrationRequests: (params: any) => api.get('/auth-verification/admin/registration-requests', { params }),
  approveRegistration: (requestId: string, data: any) => api.post(`/auth-verification/admin/approve-registration/${requestId}`, data),
  rejectRegistration: (requestId: string, data: any) => api.post(`/auth-verification/admin/reject-registration/${requestId}`, data),
};

// Documents API
export const documentsApi = {
  getDocuments: (patientId: string, params: any = {}) => {
    if (patientId) {
      return api.get(`/documents/patient/${patientId}`, { params });
    } else {
      return api.get('/documents', { params });
    }
  },
  getDocument: (documentId: string) => api.get(`/documents/${documentId}`),
  uploadDocument: (formData: FormData) => api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  updateDocument: (documentId: string, data: any) => api.put(`/documents/${documentId}`, data),
  deleteDocument: (documentId: string) => api.delete(`/documents/${documentId}`),
  downloadDocument: (documentId: string) => api.get(`/documents/${documentId}/download`, {
    responseType: 'blob',
  }),
  getDocumentTypes: () => api.get('/documents/types/list'),
  getPatientsForSelector: (search?: string) => api.get('/patients/selector', { params: { search } }),
};

export default api;
