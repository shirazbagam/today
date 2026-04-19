import apiClient from './api-client';

export const fetchInventory = async () => {
  const response = await apiClient.get('/inventory');
  return response.data;
};

export const updateStock = async (productId, amount, reason) => {
  const response = await apiClient.post('/inventory/update', { productId, amount, reason });
  return response.data;
};