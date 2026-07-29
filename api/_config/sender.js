/**
 * One place that decides which address email leaves from.
 *
 * Two things went wrong here before. The Vercel value was stored as
 * "onboarding@resend.dev\n", with a literal backslash-n on the end, which makes
 * the From header invalid, so Resend rejected every send while the API key
 * itself was perfectly valid. And the fallback was onboarding@resend.dev, which
 * is Resend's shared test sender: it only delivers to the address that owns the
 * Resend account, so even when it worked no real user ever received anything.
 *
 * So the env value is now trimmed and sanity-checked before it is trusted, and
 * the default is a sender on a domain that is actually verified on the account.
 */

// drygelworld.com is the verified domain on this Resend account. The display
// name carries the product, so an expiry notice does not arrive looking like it
// came from an unrelated business. Point this at a WarrantyPro domain once one
// is verified.
const DEFAULT_SENDER = 'WarrantyPro <warrantypro@drygelworld.com>';

// Accepts "someone@example.com" or "Display Name <someone@example.com>".
const LOOKS_LIKE_SENDER = /^(?:[^<>\r\n]*<\s*[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+\s*>|[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+)$/;

const resolveSender = () => {
    const raw = process.env.NOTIFICATION_FROM_EMAIL;
    if (!raw) return DEFAULT_SENDER;

    // Strips surrounding quotes and any stray whitespace or escape sequence that
    // survived being pasted into a dashboard field.
    const cleaned = raw
        .trim()
        .replace(/^["']|["']$/g, '')
        .replace(/\\+[rn]/g, '')
        .trim();

    if (!LOOKS_LIKE_SENDER.test(cleaned)) {
        console.warn(
            `[Email] NOTIFICATION_FROM_EMAIL is not a usable address (${JSON.stringify(raw)}). ` +
            `Falling back to ${DEFAULT_SENDER}.`
        );
        return DEFAULT_SENDER;
    }

    return cleaned;
};

module.exports = { resolveSender, DEFAULT_SENDER };
