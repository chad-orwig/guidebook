import { Context } from 'hono';
import { ZodError } from 'zod';
import { MongoError } from 'mongodb';
import type { ErrorResponse } from '@guidebook/models';

export function errorHandler(err: Error, c: Context) {
  console.error('Error:', err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errorResponse: ErrorResponse = {
      error: 'Validation error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    };
    return c.json(errorResponse, 400);
  }

  // Handle MongoDB errors
  if (err instanceof MongoError) {
    // Duplicate key error
    if (err.code === 11000) {
      const errorResponse: ErrorResponse = {
        error: 'Duplicate entry',
        details: err.message,
      };
      return c.json(errorResponse, 409);
    }

    // Connection errors
    if (err.message.includes('connection') || err.message.includes('timeout')) {
      const errorResponse: ErrorResponse = {
        error: 'Database connection error',
      };
      return c.json(errorResponse, 500);
    }
  }

  // Default error response
  const errorResponse: ErrorResponse = {
    error: err.message || 'Internal server error',
  };
  return c.json(errorResponse, 500);
}
