"use server";

/**
 * Contact form server action.
 *
 * Validates input with Zod, extracts the requester's IP from headers,
 * checks the rate limit, and persists the message via the repository.
 * Returns a safe result — never leaks database errors to the client.
 */

import { headers } from "next/headers";
import { createMessage } from "@/repositories/messages.repository";

export type ContactResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function submitContact(
  data: unknown,
): Promise<ContactResult> {
  // Extract the requester's IP for rate limiting.
  // On Vercel, the IP is in `x-forwarded-for`. In other environments
  // it may be in `x-real-ip` or `x-vercel-forwarded-for`.
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown";

  return createMessage(data, ip);
}
