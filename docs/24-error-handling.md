# 24 - Error Handling

## 1. Centralized Error Handling Hierarchy
The application defines a typed hierarchy of custom error classes extending `AppError`:

```typescript
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = 'INTERNAL_SERVER_ERROR',
    public readonly details?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with id '${id}'` : ''} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class BusinessRuleViolationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 422, 'BUSINESS_RULE_VIOLATION', details);
  }
}
```

## 2. Global Error Handling Middleware
Express catches all thrown errors in a centralized error middleware:
```typescript
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : 'INTERNAL_SERVER_ERROR';
  const message = isAppError ? err.message : 'An unexpected error occurred';
  const details = isAppError ? err.details : undefined;

  logger.error({
    err,
    reqId: req.id,
    url: req.originalUrl,
    method: req.method,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV !== 'production' && { details, stack: err.stack }),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};
```
