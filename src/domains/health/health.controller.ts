import { Request, Response } from 'express';

export const healthController = (
  request: Request,
  response: Response
): void => {
  response.status(200).json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
};
