// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5050/api', // change if your backend runs elsewhere
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token from localStorage (if present)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
