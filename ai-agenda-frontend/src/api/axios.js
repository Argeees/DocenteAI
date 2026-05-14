// src/api/axios.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000', // Apunta a tu Laravel
    withCredentials: true, // Vital para enviar las cookies de Sanctum
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// Interceptor para inyectar el Token automáticamente si existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;