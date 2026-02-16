// Credential properties found in twitter-api-v2 library (v1.x)
//
// ClientRequestMaker stores credentials as public properties:
//   bearerToken, consumerToken, consumerSecret, accessToken, accessSecret,
//   basicToken, clientId, clientSecret
//
// OAuth1Helper stores:
//   consumerKeys: { key, secret }
//
// TweetStream / RequestHandlerHelper store:
//   requestData.options.headers.Authorization
//
// Object references that lead to credentials:
//   _requestMaker (on TwitterApiBase subclasses)
//   _instance (on TwitterPaginator subclasses)
//   _oauth (on ClientRequestMaker)
//   _v1, _v2, _ads (sub-clients sharing the same _requestMaker)
//
// The underscore-prefixed properties (_requestMaker, _instance, _oauth, etc.)
// are already stripped by the key.startsWith("_") rule below.
// BLOCKED_KEYS covers non-prefixed credential properties.

const BLOCKED_KEYS = new Set([
  // ClientRequestMaker direct properties
  "bearerToken",
  "consumerToken",
  "consumerSecret",
  "accessToken",
  "accessSecret",
  "basicToken",
  "clientSecret",
  // OAuth1Helper
  "consumerKeys",
  // Request data containing Authorization headers
  "requestData",
  // ClientRequestMaker settings (plugins receive credentials)
  "clientSettings",
]);

function sanitize(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(sanitize);
  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (key.startsWith("_")) continue;
      if (BLOCKED_KEYS.has(key)) continue;
      result[key] = sanitize(val);
    }
    return result;
  }
  return value;
}

export function formatResponse(data: unknown): { content: { type: "text"; text: string }[] } {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(sanitize(data), null, 2),
      },
    ],
  };
}

export function formatError(error: unknown): { content: { type: "text"; text: string }[]; isError: true } {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [
      {
        type: "text" as const,
        text: `Error: ${message}`,
      },
    ],
    isError: true,
  };
}
