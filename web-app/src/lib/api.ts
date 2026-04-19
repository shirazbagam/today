import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
});

export const fetchSystemStats = async () => {
  const response = await apiClient.get('/stats');
  return response.data;
};