import apiClient from './api-client';

export const processRefund = async (orderId) => {
  const response = await apiClient.post('/finance/refund', { orderId });
  return response.data;
};