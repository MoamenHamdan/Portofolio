/**
 * adminGuard.js — Client-side security utilities
 *
 * OWASP Top-10 mitigations (client layer):
 *
 * A01 Broken Access Control
 *   - Admin routes are gated behind Firebase Auth + UID check in Firestore rules
 *   - Session hard-expires at 24h (AdminPanel.jsx)
 *   - localStorage session timestamp is validated on every auth state change
 *
 * A02 Cryptographic Failures
 *   - All network traffic over HTTPS (HSTS header in firebase.json)
 *   - Firebase SDK communicates only over TLS
 *
 * A03 Injection
 *   - All user inputs are stored as plain Firestore string fields — no eval(), no innerHTML
 *   - URL inputs are validated with `new URL()` before saving
 *   - Field-length limits enforced both in UI and Firestore rules
 *
 * A04 Insecure Design
 *   - Admin UID hard-coded in Firestore rules (not stored in Firestore — can't be escalated)
 *   - Principle of least privilege: public can only read, not write protected collections
 *
 * A05 Security Misconfiguration
 *   - Security headers set in firebase.json: CSP, X-Frame-Options, HSTS, etc.
 *   - Admin login error messages are generic (no user enumeration)
 *
 * A06 Vulnerable Components
 *   - All dependencies managed via npm audit; kept up to date
 *
 * A07 Auth and Session Management
 *   - Firebase Auth handles credential storage securely
 *   - browserSessionPersistence: session clears on tab close
 *   - 24-hour hard expiry enforced via localStorage timestamp
 *
 * A08 Software Integrity
 *   - SRI not applied (Firebase Hosting serves its own assets)
 *   - base-uri 'self' in CSP prevents base tag injection
 *
 * A09 Security Logging
 *   - Firebase Auth audit logs enabled by default in Firebase Console
 *
 * A10 SSRF
 *   - No server-side requests; all communication is client → Firebase endpoints
 *   - connect-src CSP restricts outbound fetches to known Firebase domains
 */

/**
 * Validate that a URL is safe before storing/navigating.
 * Blocks javascript:, data:, vbscript: and relative-protocol URLs.
 *
 * @param {string} url
 * @returns {{ valid: boolean, sanitized: string, error?: string }}
 */
export function validateUrl(url) {
  if (!url || typeof url !== "string") return { valid: false, sanitized: "", error: "URL is required." };

  const trimmed = url.trim();
  if (trimmed.length === 0) return { valid: false, sanitized: "", error: "URL is empty." };
  if (trimmed.length > 2048) return { valid: false, sanitized: "", error: "URL is too long (max 2048 chars)." };

  // Block dangerous schemes
  const BLOCKED = /^(javascript|vbscript|data):/i;
  if (BLOCKED.test(trimmed)) return { valid: false, sanitized: "", error: "URL scheme not allowed." };

  // Ensure https:// or http://
  let normalized = trimmed;
  if (!/^https?:\/\//i.test(normalized)) normalized = "https://" + normalized;

  try {
    const parsed = new URL(normalized);
    // Only allow http/https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, sanitized: "", error: "Only http and https URLs are allowed." };
    }
    return { valid: true, sanitized: normalized };
  } catch {
    return { valid: false, sanitized: "", error: "Invalid URL format." };
  }
}

/**
 * Sanitize a plain string to prevent stored XSS.
 * Strips HTML tags and limits length.
 *
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export function sanitizeString(str, maxLen = 500) {
  if (!str || typeof str !== "string") return "";
  // Strip HTML tags
  const stripped = str.replace(/<[^>]*>/g, "");
  return stripped.slice(0, maxLen);
}

/**
 * Check if the admin session is still valid (< 24h).
 * @returns {boolean}
 */
export function isSessionValid() {
  const SESSION_KEY = "admin_session_start";
  const TTL = 24 * 60 * 60 * 1000;
  const start = localStorage.getItem(SESSION_KEY);
  if (!start) return false;
  return Date.now() - parseInt(start, 10) < TTL;
}
