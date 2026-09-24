import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const reqId = crypto.randomUUID().slice(0, 8);
  req.headers['x-request-id'] = reqId;
  res.setHeader('x-request-id', reqId);

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] [${reqId}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });

  next();
}
