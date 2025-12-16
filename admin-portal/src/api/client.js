import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    const message = error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred'
    
    // Don't show toast for 401 errors (redirect handles it)
    if (error.response?.status !== 401) {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

export const adminAPI = {
  // Auth
  login: (credentials) => apiClient.post('/admin/login', credentials),
  
  // Service Health
  getAllServicesHealth: () => apiClient.get('/admin/services/health'),
  getServiceHealth: (serviceName) => apiClient.get(`/admin/services/health/${serviceName}`),
  restartService: (serviceName) => apiClient.post(`/admin/services/restart/${serviceName}`),
  
  // Gemini Monitoring
  getGeminiStats: () => apiClient.get('/admin/gemini/stats'),
  getGeminiKeyHealth: () => apiClient.get('/admin/gemini/keys'),
  updateGeminiKey: (keyData) => apiClient.post('/admin/gemini/keys', keyData),
  switchGeminiKey: (keyName) => apiClient.post('/admin/gemini/switch-key', { keyName }),
  
  // Email Templates
  getEmailTemplates: () => apiClient.get('/admin/email-templates'),
  getEmailTemplate: (templateId) => apiClient.get(`/admin/email-templates/${templateId}`),
  createEmailTemplate: (template) => apiClient.post('/admin/email-templates', template),
  updateEmailTemplate: (templateId, template) => apiClient.put(`/admin/email-templates/${templateId}`, template),
  deleteEmailTemplate: (templateId) => apiClient.delete(`/admin/email-templates/${templateId}`),
  testEmailTemplate: (templateId, testEmail) => apiClient.post(`/admin/email-templates/${templateId}/test`, { email: testEmail }),
  
  // User Management
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  getUser: (userId) => apiClient.get(`/admin/users/${userId}`),
  updateUser: (userId, userData) => apiClient.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),
  toggleUserStatus: (userId) => apiClient.post(`/admin/users/${userId}/toggle-status`),
  getUserStats: async () => {
    const response = await apiClient.get('/admin/users/stats')
    return response.data || response
  },
  
  // Quiz Management
  getQuizzes: (params) => apiClient.get('/admin/quizzes', { params }),
  getQuiz: (quizId) => apiClient.get(`/admin/quizzes/${quizId}`),
  updateQuiz: (quizId, quizData) => apiClient.put(`/admin/quizzes/${quizId}`, quizData),
  deleteQuiz: (quizId) => apiClient.delete(`/admin/quizzes/${quizId}`),
  toggleQuizStatus: (quizId) => apiClient.post(`/admin/quizzes/${quizId}/toggle-status`),
  getQuizStats: async () => {
    const response = await apiClient.get('/admin/quizzes/stats')
    return response.data || response
  },
  
  // Report Management
  getReports: (params) => apiClient.get('/admin/reports', { params }),
  getReport: (reportId) => apiClient.get(`/admin/reports/${reportId}`),
  resolveReport: (reportId, resolution) => apiClient.post(`/admin/reports/${reportId}/resolve`, { resolution }),
  deleteReport: (reportId) => apiClient.delete(`/admin/reports/${reportId}`),
  getReportStats: async () => {
    const response = await apiClient.get('/admin/reports/stats')
    return response.data || response
  },
  
  // Dashboard
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/dashboard/stats')
    return response.data || response
  },
  getSystemMetrics: () => apiClient.get('/admin/dashboard/metrics'),
  
  // Service Monitoring
  getServicesHealth: () => apiClient.get('/admin/services/health'),
  getServicesStats: () => apiClient.get('/admin/services/stats'),
  getServiceLogs: (params) => apiClient.get('/admin/services/logs', { params }),
  clearServiceLogs: (days) => apiClient.delete(`/admin/services/logs/clear?days=${days}`),
  getServiceMetrics: (serviceName) => apiClient.get(`/admin/services/${serviceName}/metrics`),
}

export default apiClient
