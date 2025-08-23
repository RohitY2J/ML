import { Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export const sendSuccess = <T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data
  };
  res.status(statusCode).json(response);
};

export const sendError = (res: Response, message: string, statusCode: number = 500, error?: any): void => {
  const response: ApiResponse<null> = {
    success: false,
    message,
    error: error instanceof Error ? error.message : 'Unknown error'
  };
  res.status(statusCode).json(response);
};

export const sendValidationError = (res: Response, message: string): void => {
  sendError(res, message, 400);
};

export const sendNotFound = (res: Response, message: string = 'Resource not found'): void => {
  sendError(res, message, 404);
}; 