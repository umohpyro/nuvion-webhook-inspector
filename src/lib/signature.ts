/**
 * Nuvion signs every delivery with HMAC-SHA256 over `{x-nuvion-event-timestamp}.{raw body}`, keyed with the
 * webhook's full secret (including the `nv_wsk_` prefix). The header carries the lowercase hex digest, no prefix.
 * Uses Web Crypto so the same code runs in the browser and in Node.
 */
export async function sign(secret: string, timestamp: string, rawBody: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(`${timestamp}.${rawBody}`));
  return Array.from(new Uint8Array(mac), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verify(secret: string, timestamp: string, rawBody: string, signature: string): Promise<boolean> {
  const expected = await sign(secret, timestamp.trim(), rawBody);
  const received = signature.trim().toLowerCase();
  if (expected.length !== received.length) return false;
  let diff = 0; // compare every character so timing does not reveal where they differ
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ received.charCodeAt(i);
  return diff === 0;
}
