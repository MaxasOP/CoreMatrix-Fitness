import axios from 'axios';

const isProd = process.env.NODE_ENV === 'production';
const fallbackBaseURL = isProd
	? 'https://corematrix-fitness.onrender.com/api'
	: '/api';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || fallbackBaseURL });

// Attach Authorization header when token present in localStorage
api.interceptors.request.use((config) => {
	try {
		const user = JSON.parse(localStorage.getItem('cmUser') || 'null');
		if (user && user.token) {
			config.headers = config.headers || {};
			config.headers.Authorization = `Bearer ${user.token}`;
		}
	} catch (e) {
		// ignore
	}
	return config;
});

export default api;
