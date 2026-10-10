import type { ZodSchema } from 'zod';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const notFound = (entity: string, id: string): HttpError =>
  new HttpError(404, `${entity} ${id} not found`);

export const badRequest = (message: string, details?: unknown): HttpError =>
  new HttpError(400, message, details);

export function parseBody<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpError(400, 'validation_error', result.error.flatten());
  }
  return result.data;
}
