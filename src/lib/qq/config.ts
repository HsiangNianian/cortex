// QQ OAuth configuration
// APP_ID is public; APP_KEY must be kept secret (set as Cloudflare env var)

export const QQ_APP_ID = process.env.QQ_APP_ID ?? "";
export const QQ_APP_KEY = process.env.QQ_APP_KEY ?? "";
export const QQ_REDIRECT_URI = "https://cortex.hydroroll.team/api/auth/qq/callback";

export const QQ_AUTHORIZE_URL = "https://graph.qq.com/oauth2.0/authorize";
export const QQ_TOKEN_URL = "https://graph.qq.com/oauth2.0/token";
export const QQ_ME_URL = "https://graph.qq.com/oauth2.0/me";
export const QQ_USER_INFO_URL = "https://graph.qq.com/user/get_user_info";

/**
 * Build the QQ OAuth authorize URL to redirect users to.
 */
export function getQQAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: QQ_APP_ID,
    redirect_uri: QQ_REDIRECT_URI,
    state,
    scope: "get_user_info",
  });
  return `${QQ_AUTHORIZE_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for an access token.
 */
export async function getQQAccessToken(code: string): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token: string;
}> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: QQ_APP_ID,
    client_secret: QQ_APP_KEY,
    code,
    redirect_uri: QQ_REDIRECT_URI,
    fmt: "json",
  });

  const res = await fetch(`${QQ_TOKEN_URL}?${params.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`QQ token request failed: ${res.status}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(`QQ token error: ${data.error} — ${data.error_description ?? ""}`);
  }

  return data;
}

/**
 * Get the OpenID for the authenticated user.
 */
export async function getQQOpenId(accessToken: string): Promise<{
  openid: string;
  unionid?: string;
}> {
  const params = new URLSearchParams({
    access_token: accessToken,
    fmt: "json",
  });

  const res = await fetch(`${QQ_ME_URL}?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`QQ me request failed: ${res.status}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(`QQ me error: ${data.error} — ${data.error_description ?? ""}`);
  }

  return { openid: data.openid, unionid: data.unionid };
}

/**
 * Get the QQ user's profile information (nickname, avatar, gender).
 */
export async function getQQUserInfo(
  accessToken: string,
  openid: string,
): Promise<{
  nickname: string;
  figureurl_qq_2: string;
  figureurl_qq_1: string;
  gender: string;
}> {
  const params = new URLSearchParams({
    access_token: accessToken,
    oauth_consumer_key: QQ_APP_ID,
    openid,
  });

  const res = await fetch(`${QQ_USER_INFO_URL}?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`QQ user info request failed: ${res.status}`);
  }

  const data = await res.json();
  if (data.ret !== 0) {
    throw new Error(`QQ user info error: ${data.ret} — ${data.msg}`);
  }

  return {
    nickname: data.nickname,
    figureurl_qq_2: data.figureurl_qq_2 || "",
    figureurl_qq_1: data.figureurl_qq_1 || "",
    gender: data.gender,
  };
}
