export const AUTH_COOKIE_NAME = "ppt_session";

export function getAuthSettings() {
  return {
    studentName: process.env.APP_STUDENT_NAME ?? "Your Brother",
    username: process.env.APP_LOGIN_USERNAME ?? "",
    password: process.env.APP_LOGIN_PASSWORD ?? "",
    secret: process.env.APP_AUTH_SECRET ?? "",
  };
}

async function importSigningKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function signValue(value: string, secret: string) {
  const key = await importSigningKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

export async function createSessionToken(username: string, secret: string) {
  const signature = await signValue(username, secret);
  return `${encodeURIComponent(username)}.${signature}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  const [encodedUsername, signature] = token.split(".");

  if (!encodedUsername || !signature) {
    return false;
  }

  const { username, secret } = getAuthSettings();

  if (!username || !secret) {
    return false;
  }

  const decodedUsername = decodeURIComponent(encodedUsername);

  if (decodedUsername !== username) {
    return false;
  }

  const expectedSignature = await signValue(decodedUsername, secret);
  return constantTimeEqual(signature, expectedSignature);
}
