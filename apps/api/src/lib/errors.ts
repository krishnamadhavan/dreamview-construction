export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function notFound(entity = "Resource"): AppError {
  return new AppError(404, "NOT_FOUND", `${entity} not found`);
}

export function unauthorized(message = "Sign in required"): AppError {
  return new AppError(401, "UNAUTHORIZED", message);
}

export function conflict(message: string): AppError {
  return new AppError(409, "CONFLICT", message);
}
