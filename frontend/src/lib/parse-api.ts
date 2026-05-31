import { z } from "zod";

export class ApiValidationError extends Error {
  constructor(
    message: string,
    readonly context: string,
    readonly issues: z.ZodIssue[]
  ) {
    super(message);
    this.name = "ApiValidationError";
  }
}

/** Parse and validate an API payload at the network boundary. */
export function parseApi<T>(schema: z.ZodType<T>, data: unknown, context: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    if (process.env.NODE_ENV === "development") {
      console.error(`API validation failed (${context}):`, result.error.flatten());
    }
    throw new ApiValidationError(
      `Invalid API response: ${context}`,
      context,
      result.error.issues
    );
  }
  return result.data;
}
