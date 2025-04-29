import {
  AppError,
  ConflictError,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
} from '@shared/utils/error/error.util';
import { mapCognitoErrorToAppError } from '@shared/utils/error/cognito-error.util';

/**
 * Unit tests for mapCognitoErrorToAppError utility function.
 */
describe('mapCognitoErrorToAppError', () => {
  const baseError = (name: string, message = 'msg'): Error => {
    const err = new Error(message);
    // force name for test
    (err as unknown as { name: string }).name = name;
    return err;
  };

  it('maps UsernameExistsException to ConflictError', () => {
    const err = baseError('UsernameExistsException');
    const result = mapCognitoErrorToAppError(err);
    expect(result).toBeInstanceOf(ConflictError);
    expect(result.message).toBe('User already exists');
  });

  it('maps NotAuthorizedException to UnauthorizedError', () => {
    const err = baseError('NotAuthorizedException');
    const result = mapCognitoErrorToAppError(err);
    expect(result).toBeInstanceOf(UnauthorizedError);
    expect(result.message).toBe('Incorrect username or password');
  });

  it('maps UserNotFoundException to NotFoundError', () => {
    const err = baseError('UserNotFoundException');
    const result = mapCognitoErrorToAppError(err);
    expect(result).toBeInstanceOf(NotFoundError);
    expect(result.message).toBe('User not found');
  });

  it('maps CodeMismatchException to ValidationError', () => {
    const err = baseError('CodeMismatchException');
    const result = mapCognitoErrorToAppError(err);
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toBe('Invalid confirmation code');
  });

  it('maps ExpiredCodeException to ValidationError', () => {
    const err = baseError('ExpiredCodeException');
    const result = mapCognitoErrorToAppError(err);
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toBe('Confirmation code expired');
  });

  it('maps InvalidPasswordException to ValidationError', () => {
    const err = baseError('InvalidPasswordException');
    const result = mapCognitoErrorToAppError(err);
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toBe('Password does not meet requirements');
  });

  it('maps InvalidParameterException to ValidationError', () => {
    const err = baseError('InvalidParameterException');
    const result = mapCognitoErrorToAppError(err);
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toBe('Invalid parameter provided');
  });

  it('maps UserNotConfirmedException to ValidationError', () => {
    const err = baseError('UserNotConfirmedException');
    const result = mapCognitoErrorToAppError(err);
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toBe('User is not confirmed');
  });

  it('maps LimitExceededException to AppError', () => {
    const err = baseError('LimitExceededException');
    const result = mapCognitoErrorToAppError(err);
    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe('Limit exceeded, please try again later');
    expect(result.status).toBe(429);
  });

  it('maps TooManyRequestsException to AppError', () => {
    const err = baseError('TooManyRequestsException');
    const result = mapCognitoErrorToAppError(err);
    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe('Too many requests, please try again later');
    expect(result.status).toBe(429);
  });

  it('maps InvalidUserPoolConfigurationException to AppError', () => {
    const err = baseError('InvalidUserPoolConfigurationException');
    const result = mapCognitoErrorToAppError(err);
    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe('Invalid user pool configuration');
    expect(result.status).toBe(500);
  });

  it('returns AppError for unknown error name', () => {
    const err = baseError('SomeOtherException', 'custom message');
    const result = mapCognitoErrorToAppError(err);
    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe('custom message');
    expect(result.status).toBe(422);
  });

  it('returns AppError with default message if error message is missing', () => {
    const err = { name: 'UnknownException' } as Error;
    const result = mapCognitoErrorToAppError(err);
    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe('Unknown Cognito error');
    expect(result.status).toBe(422);
  });
});
