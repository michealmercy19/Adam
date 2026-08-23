const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },
};

export const studentAPI = {
  getAttendance: async () => {
    const response = await fetch(`${API_BASE_URL}/student/attendance`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },

  markAttendance: async (data) => {
    const response = await fetch(`${API_BASE_URL}/student/attendance/mark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/student/history`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/student/profile`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },
};

export const lecturerAPI = {
  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/lecturer/dashboard`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },

  startClass: async (classData) => {
    const response = await fetch(`${API_BASE_URL}/lecturer/class/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(classData),
    });
    return response.json();
  },

  scheduleClass: async (classData) => {
    const response = await fetch(`${API_BASE_URL}/lecturer/class/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(classData),
    });
    return response.json();
  },

  getClasses: async () => {
    const response = await fetch(`${API_BASE_URL}/lecturer/classes`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },

  recordAttendance: async (classId, studentId, status) => {
    const response = await fetch(`${API_BASE_URL}/lecturer/attendance/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ classId, studentId, status }),
    });
    return response.json();
  },

  getReports: async (classId) => {
    const response = await fetch(`${API_BASE_URL}/lecturer/reports?classId=${classId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },
};

export const adminAPI = {
  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },

  getUsers: async (filters = {}) => {
    const query = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/admin/users?${query}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },

  searchRecords: async (query) => {
    const response = await fetch(`${API_BASE_URL}/admin/records/search?q=${query}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },

  getAnalytics: async (params = {}) => {
    const query = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/admin/analytics?${query}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },

  getSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },

  updateSettings: async (settings) => {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(settings),
    });
    return response.json();
  },

  getComplaints: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/complaints`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },

  submitComplaint: async (complaint) => {
    const response = await fetch(`${API_BASE_URL}/admin/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(complaint),
    });
    return response.json();
  },
};

export const biometricAPI = {
  scanFace: async (imageData) => {
    const formData = new FormData();
    formData.append('image', imageData);
    
    const response = await fetch(`${API_BASE_URL}/biometric/face/scan`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData,
    });
    return response.json();
  },

  verifyBiometrics: async (biometricData) => {
    const response = await fetch(`${API_BASE_URL}/biometric/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(biometricData),
    });
    return response.json();
  },

  enrollBiometrics: async (biometricData) => {
    const response = await fetch(`${API_BASE_URL}/biometric/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(biometricData),
    });
    return response.json();
  },
};

export const handleAPIError = (error) => {
  if (error.response) {
    console.error('API Error:', error.response.status, error.response.data);
    return error.response.data.message || 'An error occurred';
  } else if (error.request) {
    console.error('No response:', error.request);
    return 'No response from server';
  } else {
    console.error('Error:', error.message);
    return error.message;
  }
};
