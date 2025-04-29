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
export function mapCognitoErrorToAppError(error: Error): AppError {
  switch (error?.name) {
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
    // Add more Cognito error mappings as needed
    default:
      return new AppError({ message: error?.message || 'Unknown Cognito error', status: 422 });
  }
}
