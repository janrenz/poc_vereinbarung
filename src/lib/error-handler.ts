/**
 * Sanitize error messages for production
 * Prevents stack traces and sensitive information from being exposed to users
 */
export function sanitizeError(error: unknown): {
  message: string;
  details?: unknown;
} {
  const isProduction = process.env.NODE_ENV === "production";

  if (error instanceof Error) {
    if (isProduction) {
      // In production, return generic message
      // Log the full error server-side for debugging
      console.error("[ERROR]", error);
      return {
        message: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
      };
    } else {
      // In development, return detailed error
      return {
        message: error.message,
        details: {
          name: error.name,
          stack: error.stack,
        },
      };
    }
  }

  if (isProduction) {
    console.error("[ERROR]", error);
    return {
      message: "Ein unerwarteter Fehler ist aufgetreten.",
    };
  } else {
    return {
      message: "Unknown error occurred",
      details: error,
    };
  }
}

/**
 * Create a safe error response for API endpoints
 */
export function createErrorResponse(
  error: unknown,
  status: number = 500
): {
  error: string;
  details?: unknown;
} {
  const sanitized = sanitizeError(error);
  const response: { error: string; details?: unknown } = {
    error: sanitized.message,
  };

  if (sanitized.details) {
    response.details = sanitized.details;
  }

  return response;
}
