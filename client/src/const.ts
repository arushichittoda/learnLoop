import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Start OAuth login flow. Call this from an event handler or effect at the
// moment navigation is triggered, e.g. `onClick={() => startLogin()}`.
export const startLogin = () => {
  const oauthPortalUrl = window.__APP_CONFIG__?.oauthPortalUrl;
  const appId = window.__APP_CONFIG__?.projectId;
  if (!oauthPortalUrl || !appId) throw new Error("Authentication is not configured");
  const redirectUri = `${window.location.origin}/api/oauth/callback`;

  const nonce = crypto.randomUUID();
  document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
  const state = encodeOAuthState({ redirectUri, nonce });

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("responseType", "code");

  window.location.href = url.toString();
};
