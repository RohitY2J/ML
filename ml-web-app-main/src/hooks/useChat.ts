import { useMutation } from '@tanstack/react-query';
import { sendChatMessage, ChatResponse } from '@/services/api/chat';

export const useChat = () => {
  return useMutation<ChatResponse, Error, string>({
    mutationFn: sendChatMessage,
  });
};
