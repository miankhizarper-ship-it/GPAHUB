/**
 * Zod validation schema for contact form submissions.
 *
 * Guards the contact server action. Every field has sensible length
 * limits to prevent abuse. The honeypot field (`website`) is validated
 * server-side — if it's non-empty, the submission is silently rejected.
 */

import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z
    .string()
    .min(3, "Email is required")
    .max(254, "Email is too long")
    .email("Please enter a valid email address"),
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(200, "Subject must be at most 200 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be at most 5,000 characters"),
  // Honeypot — must be empty. Bots tend to fill all fields.
  website: z
    .string()
    .max(0, "Honeypot field must be empty")
    .optional()
    .or(z.literal("")),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export function validateContactForm(record: unknown):
  | { success: true; data: ContactFormData }
  | { success: false; error: z.ZodError } {
  return contactFormSchema.safeParse(record);
}
