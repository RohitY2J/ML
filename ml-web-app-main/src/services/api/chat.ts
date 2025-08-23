import axiosInstance from '@/lib/axios';

export interface ChatResponse {
  success: boolean;
  response: string;
  message?: string;
}

export const sendChatMessage = async (question: string): Promise<ChatResponse> => {
  const response = await axiosInstance.post('/api/chat', { question });
  return response.data;
}; 