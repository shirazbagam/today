import axios from 'axios';
const apiClient = axios.create({ baseURL: '/api',
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-AJK-Security'] = 'True'; // Loophole protection
  return config;
});
export default apiClient;
