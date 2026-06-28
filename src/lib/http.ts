/**
 * Corporate networks often use SSL inspection with self-signed certs.
 * This allows external API calls (OMDb, Gemini) to work in local dev.
 */
if (
  process.env.NODE_ENV === "development" &&
  process.env.ALLOW_INSECURE_SSL !== "false"
) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function apiFetch(
  input: string | URL,
  init?: RequestInit
): Promise<Response> {
  return fetch(input, init);
}
