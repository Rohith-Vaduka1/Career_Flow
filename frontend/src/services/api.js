/**
 * Centralized API Service for Career Flow
 * All frontend requests go through this unified service layer.
 */

const API_BASE_URL = '/api';

export const tokenStorage = {
  get: () => localStorage.getItem('career_flow_token'),
  set: (token) => localStorage.setItem('career_flow_token', token),
  remove: () => localStorage.removeItem('career_flow_token')
};

async function request(endpoint, options = {}) {
  const token = tokenStorage.get();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        tokenStorage.remove();
      }
      const errorMessage = data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (!error.status) {
      // Network or server down
      error.message = 'Unable to connect to Career Flow server. Please ensure the backend is running.';
    }
    throw error;
  }
}

export const api = {
  // Authentication
  auth: {
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    getMe: () => request('/auth/me'),
    updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: profileData })
  },

  // Jobs
  jobs: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, val);
        }
      });
      const qStr = query.toString();
      return request(`/jobs${qStr ? `?${qStr}` : ''}`);
    },
    getById: (id) => request(`/jobs/${id}`),
    getMatch: (id) => request(`/jobs/${id}/match`),
    getAiFit: (id) => request(`/jobs/${id}/ai-fit`, { method: 'POST' }),
    save: (id) => request(`/jobs/${id}/save`, { method: 'POST' }),
    unsave: (id) => request(`/jobs/${id}/save`, { method: 'DELETE' }),
    getSaved: () => request('/jobs/saved'),
    apply: (id) => request(`/jobs/${id}/apply`, { method: 'POST' }),
    checkScam: (content) => request('/jobs/check-scam', { method: 'POST', body: { content } })
  },

  // Applications
  applications: {
    getAll: () => request('/applications'),
    create: (data) => request('/applications', { method: 'POST', body: data }),
    update: (id, data) => request(`/applications/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/applications/${id}`, { method: 'DELETE' })
  },

  // Interviews
  interviews: {
    getAll: () => request('/interviews'),
    create: (data) => request('/interviews', { method: 'POST', body: data }),
    update: (id, data) => request(`/interviews/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/interviews/${id}`, { method: 'DELETE' })
  },

  // Resume & ATS
  resume: {
    get: () => request('/resume'),
    save: (data) => request('/resume', { method: 'POST', body: data }),
    analyze: (data) => request('/resume/analyze', { method: 'POST', body: data }),
    matchJob: (data) => request('/resume/match-job', { method: 'POST', body: data })
  },

  // Skills
  skills: {
    getCategories: () => request('/skills/categories'),
    getGap: (role) => request(`/skills/gap${role ? `?role=${encodeURIComponent(role)}` : ''}`),
    update: (skills) => request('/skills', { method: 'POST', body: { skills } })
  },

  // AI & Interview Prep
  ai: {
    chat: (message, conversationHistory) => 
      request('/ai/chat', { method: 'POST', body: { message, conversationHistory } }),
    generateQuestions: (data) => 
      request('/ai/interview-prep/generate', { method: 'POST', body: data }),
    evaluateMockAnswer: (data) => 
      request('/ai/mock-interview/evaluate', { method: 'POST', body: data }),
    getRoadmap: (data) => 
      request('/ai/career-roadmap', { method: 'POST', body: data })
  },

  // Email Guardian & Scam Detection
  emailGuardian: {
    analyze: (data) => request('/email-guardian/analyze', { method: 'POST', body: data })
  },

  // Analytics
  analytics: {
    get: () => request('/analytics')
  },

  // Notifications
  notifications: {
    getAll: () => request('/notifications'),
    markAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllAsRead: () => request('/notifications/mark-all-read', { method: 'POST' })
  },

  // Search
  search: {
    query: (q) => request(`/search?q=${encodeURIComponent(q)}`)
  }
};
