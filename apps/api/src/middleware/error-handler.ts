import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';
import { errorResponse } from '@repo/shared';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : 'INTERNAL_SERVER_ERROR';
  const message = isAppError ? err.message : 'An unexpected error occurred';
  const details = isAppError ? err.details : undefined;

  if (process.env.NODE_ENV !== 'test' && statusCode === 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json(errorResponse(code, message, details));
};
