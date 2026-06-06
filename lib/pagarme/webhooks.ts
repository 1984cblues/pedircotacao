import crypto from "crypto";

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const webhookKey = process.env.PAGARME_WEBHOOK_KEY;
  if (!webhookKey) {
    console.warn("PAGARME_WEBHOOK_KEY is not defined, skipping signature verification.");
    // In production, this should throw an error. For local dev without webhook key, we might return true.
    // However, it's safer to always require it if going to prod.
    return false;
  }

  // Pagar.me signature is of format: 'sha256=XXXX'
  const expectedSignature = crypto
    .createHmac("sha256", webhookKey)
    .update(payload)
    .digest("hex");

  // The signature from Pagar.me typically looks like "sha256=abcdef..."
  // Some versions might just pass the hex directly. We check both.
  const providedHash = signature.replace("sha256=", "");
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(providedHash)
    );
  } catch (e) {
    return false;
  }
}
