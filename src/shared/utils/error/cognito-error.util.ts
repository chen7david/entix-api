import {
  AppError,
  ConflictError,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
} from '@shared/utils/error/error.util';

/**
 * Maps AWS Cognito errors to application-specific AppError subclasses.
 * @param error - The error thrown by Cognito SDK
 * @returns An AppError or subclass with appropriate status and message
 */
export function mapCognitoErrorToAppError(error: unknown): AppError {
  if (!isErrorLike(error)) {
    return new AppError({ message: 'Unknown Cognito error', status: 422 });
  }

  switch (error.name) {
    case 'UsernameExistsException':
      return new ConflictError('User already exists');
    case 'NotAuthorizedException':
      return new UnauthorizedError('Incorrect username or password');
    case 'UserNotFoundException':
      return new NotFoundError('User not found');
    case 'CodeMismatchException':
      return new ValidationError('Invalid confirmation code');
    case 'ExpiredCodeException':
      return new ValidationError('Confirmation code expired');
    case 'InvalidPasswordException':
      return new ValidationError('Password does not meet requirements');
    case 'InvalidParameterException':
      return new ValidationError('Invalid parameter provided');
    case 'UserNotConfirmedException':
      return new ValidationError('User is not confirmed');
    case 'LimitExceededException':
      return new AppError({ message: 'Limit exceeded, please try again later', status: 429 });
    case 'TooManyRequestsException':
      return new AppError({ message: 'Too many requests, please try again later', status: 429 });
    case 'InvalidUserPoolConfigurationException':
      return new AppError({ message: 'Invalid user pool configuration', status: 500 });
    // Add more Cognito error mappings as needed
    default:
      return new AppError({ message: error?.message || 'Unknown Cognito error', status: 422 });
  }
}

/**
 * Type guard to check if a value is Error-like (has name and message).
 * @param value - The value to check
 * @returns True if value is Error-like
 */
function isErrorLike(value: unknown): value is { name: string; message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in (value as Record<string, unknown>) &&
    typeof (value as Record<string, unknown>)['name'] === 'string' &&
    'message' in (value as Record<string, unknown>) &&
    typeof (value as Record<string, unknown>)['message'] === 'string'
  );
}
