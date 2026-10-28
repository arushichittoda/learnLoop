// Only safe public values may reach the browser. Never serialize process.env.
export function publicPlatformConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    projectId: env.APP_PROJECT_ID ?? env.PROJECT_ID ?? "",
    oauthPortalUrl: env.APP_OAUTH_PORTAL_URL ?? env.OAUTH_PORTAL_URL ?? "",
    apiUrl: env.APP_API_URL ?? env.API_URL ?? "",
    apiBrowserKey: env.APP_API_BROWSER_KEY ?? env.API_BROWSER_KEY ?? "",
  };
}

export function publicPlatformScript(env: NodeJS.ProcessEnv = process.env): string {
  const json = JSON.stringify(publicPlatformConfig(env)).replaceAll("<", "\\u003c");
  return `window.__APP_CONFIG__=${json};`;
}
