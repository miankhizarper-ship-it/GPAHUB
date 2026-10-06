/**
 * MongoDB collection name constants.
 *
 * Centralized so a rename touches one place. Server-only because the
 * repository layer is server-only.
 */

import "server-only";

export const UNIVERSITY_COLLECTION = "universities";
export const POST_COLLECTION = "posts";
export const MESSAGE_COLLECTION = "messages";
export const RATE_LIMIT_COLLECTION = "rate_limits";
export const LOGIN_ATTEMPTS_COLLECTION = "login_attempts";
export const AUDIT_LOG_COLLECTION = "audit_logs";
export const POST_REDIRECT_COLLECTION = "post_redirects";
