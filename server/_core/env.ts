// Application environment configuration
export const ENV = {
  get appId() { return process.env.APP_ID ?? process.env.PROJECT_ID ?? ""; },
  get cookieSecret() { return process.env.JWT_SECRET ?? process.env.COOKIE_SECRET ?? ""; },
  get databaseUrl() { return process.env.DATABASE_URL ?? ""; },
  get oAuthServerUrl() { return process.env.OAUTH_API_URL ?? ""; },
  get ownerOpenId() { return process.env.OWNER_OPEN_ID ?? ""; },
  get isProduction() { return process.env.NODE_ENV === "production"; },
  get forgeApiUrl() { return process.env.API_URL ?? ""; },
  get forgeApiKey() { return process.env.API_KEY ?? ""; },
};
