/**
 * Travelport TripServices OAuth (token valid ~24h).
 * @see https://developer.travelport.com/docs/getting-started/authentication
 */

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

let cache: TokenCache | null = null;

export async function getTravelportAccessToken(): Promise<string> {
  if (cache && Date.now() < cache.expiresAt - 60_000) {
    return cache.accessToken;
  }

  const authUrl =
    process.env.TRAVELPORT_AUTH_URL ??
    "https://auth.pp.travelport.net/oauth/token";
  const clientId = process.env.TRAVELPORT_CLIENT_ID;
  const clientSecret = process.env.TRAVELPORT_CLIENT_SECRET;
  const username = process.env.TRAVELPORT_USERNAME;
  const password = process.env.TRAVELPORT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    throw new Error(
      "Travelport live mode requires TRAVELPORT_CLIENT_ID, CLIENT_SECRET, USERNAME, PASSWORD"
    );
  }

  const body = new URLSearchParams({
    grant_type: "password",
    username,
    password,
  });

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(authUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Travelport OAuth failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in?: number;
  };

  const ttlMs = (data.expires_in ?? 86_400) * 1000;
  cache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + ttlMs,
  };

  return cache.accessToken;
}

export function clearTravelportTokenCache(): void {
  cache = null;
}
