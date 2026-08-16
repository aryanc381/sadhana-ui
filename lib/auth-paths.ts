export const DEFAULT_APP_PATH = "/dashboard";
export const SIGN_IN_PATH = "/sign-in";

export function isAuthPath(pathname: string) {
  return pathname === SIGN_IN_PATH || pathname.startsWith(`${SIGN_IN_PATH}/`);
}

export function safeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/sign-in")) {
    return DEFAULT_APP_PATH;
  }
  return value;
}

export function hasSessionCookie(cookieStore: {
  get: (name: string) => { value: string } | undefined;
}) {
  return Boolean(
    cookieStore.get("better-auth.session_token")?.value ||
      cookieStore.get("__Secure-better-auth.session_token")?.value,
  );
}
