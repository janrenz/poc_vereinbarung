import { z } from "zod";

/**
 * Password validation schema
 * Requires: 12+ chars, uppercase, lowercase, number, special char
 */
export const PasswordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

/**
 * Email validation schema
 */
export const EmailSchema = z.string().email("Invalid email address").max(255);

/**
 * Login request validation
 */
export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, "Password is required"),
});

/**
 * User creation validation
 */
export const CreateUserSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  name: z.string().min(1).max(255).optional(),
  role: z.enum(["ADMIN", "SUPERADMIN"]).default("ADMIN"),
});

/**
 * Entry creation validation
 */
export const CreateEntrySchema = z.object({
  formId: z.string().cuid(),
  title: z.string().min(1).max(500),
  zielsetzungenText: z.string().max(5000).nullable().optional(),
  zielbereich1: z.array(z.string()).max(10).optional(),
  zielbereich2: z.array(z.string()).max(10).optional(),
  zielbereich3: z.array(z.string()).max(10).optional(),
  datengrundlage: z.array(z.string()).max(10).optional(),
  datengrundlageAndere: z.string().max(500).nullable().optional(),
  zielgruppe: z.array(z.string()).max(10).optional(),
  zielgruppeSusDetail: z.string().max(500).nullable().optional(),
  massnahmen: z.string().max(10000).nullable().optional(),
  indikatoren: z.string().max(10000).nullable().optional(),
  verantwortlich: z.string().max(500).nullable().optional(),
  beteiligt: z.string().max(500).nullable().optional(),
  beginnSchuljahr: z.string().max(10).nullable().optional(),
  beginnHalbjahr: z.number().int().min(1).max(2).nullable().optional(),
  endeSchuljahr: z.string().max(10).nullable().optional(),
  endeHalbjahr: z.number().int().min(1).max(2).nullable().optional(),
  fortbildungJa: z.boolean().optional(),
  fortbildungThemen: z.string().max(1000).nullable().optional(),
  fortbildungZielgruppe: z.string().max(500).nullable().optional(),
});

/**
 * Entry update validation (all fields optional)
 */
export const UpdateEntrySchema = CreateEntrySchema.partial().omit({ formId: true });

/**
 * Form creation validation
 */
export const CreateFormSchema = z.object({
  school: z.object({
    externalId: z.string().min(1),
    schoolNumber: z.string().optional(),
    name: z.string().min(1).max(500),
    address: z.string().max(500).optional(),
    city: z.string().max(255).optional(),
    state: z.string().max(255).optional(),
  }),
  title: z.string().max(500).optional(),
});

/**
 * Form return message validation
 */
export const FormReturnSchema = z.object({
  message: z.string().min(1).max(2000, "Message too long (max 2000 characters)"),
});

/**
 * Access code validation
 */
export const AccessCodeSchema = z
  .string()
  .length(8, "Access code must be 8 characters")
  .regex(/^[A-Z0-9]+$/, "Access code must contain only uppercase letters and numbers");

/**
 * Helper function to validate and parse data
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true;
  data: T;
} | {
  success: false;
  errors: z.ZodError;
} {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Password reset request validation
 */
export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
});

/**
 * Password reset validation
 */
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: PasswordSchema,
});

/**
 * Registration validation
 */
export const RegisterSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(255),
  schulamtName: z.string().min(1, "Schulamt Name ist erforderlich").max(255),
  email: EmailSchema,
  password: PasswordSchema,
});

/**
 * Format Zod errors for API responses
 */
export function formatZodErrors<T>(error: z.ZodError<T>): {
  field: string;
  message: string;
}[] {
  return error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
}
