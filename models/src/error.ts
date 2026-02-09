import { z } from 'zod';

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.any().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
