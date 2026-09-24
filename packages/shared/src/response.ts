import type { ApiResponse } from '@repo/types';

export function successResponse<T>(
  data: T,
  meta?: { page?: number; limit?: number; total?: number }
): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown
): ApiResponse<null> {
  return {
    success: false,
    data: null,
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}
