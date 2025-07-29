import { NextFunction, Request, Response } from 'express';

export function errorHandlerMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
}
