import { Request, Response } from 'express';
import { notFoundMiddleware } from '@src/middleware/not-found/not-found.middleware';

describe('Not Found Middleware', () => {
  // Mock Express request, response, and next function
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  // Mock json method that captures the last response
  let lastResponseData: any;

  beforeEach(() => {
    // Reset the last response data
    lastResponseData = null;

    mockRequest = {
      method: 'GET',
      path: '/unknown-route',
      originalUrl: '/unknown-route',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((data: any) => {
        lastResponseData = data;
        return mockResponse;
      }),
      headersSent: false,
    };
    mockNext = jest.fn();
  });

  it('should respond with 404 status code and standardized error format', () => {
    // Call middleware
    notFoundMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    // Verify response
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 404,
        message: 'Not found',
        path: '/unknown-route',
        timestamp: expect.any(String),
      }),
    );

    // Validate timestamp is a valid ISO date
    const timestamp = new Date(lastResponseData?.timestamp);
    expect(timestamp instanceof Date).toBeTruthy();
    expect(isNaN(timestamp.getTime())).toBeFalsy();

    // Should not call next
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next() if headers have already been sent', () => {
    // Mock headers already sent
    mockResponse.headersSent = true;

    // Call middleware
    notFoundMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    // Should not attempt to send a response
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();

    // Should call next
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should include the original request URL in the response', () => {
    // Set up different request URL
    mockRequest.originalUrl = '/api/v1/non-existent';

    // Call middleware
    notFoundMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    // Verify response includes the correct path
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/api/v1/non-existent',
      }),
    );
  });
});
