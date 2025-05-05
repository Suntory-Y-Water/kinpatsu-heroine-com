import { err } from 'neverthrow';

export class ValidationError extends Error {
  constructor(message: string, stack?: string) {
    super(message);
    this.name = 'ValidationError';
    this.stack = stack;
  }
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    stack?: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'DatabaseError';
    this.stack = stack;
  }
}

export class DataNotFoundError extends Error {
  constructor(message: string, stack?: string) {
    super(message);
    this.name = 'DataNotFoundError';
    this.stack = stack;
  }
}

export class NotFoundError extends Error {
  constructor(message: string, stack?: string) {
    super(message);
    this.name = 'NotFoundError';
    this.stack = stack;
  }
}

function errorHandler<T extends Error>(
  error: unknown,
  ErrorClass: new (message: string, stack?: string, cause?: unknown) => T,
) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const stack = error instanceof Error ? error.stack : undefined;
  return err(new ErrorClass(message, stack, error));
}

export function databaseErrorHandler(error: unknown) {
  return errorHandler(error, DatabaseError);
}
