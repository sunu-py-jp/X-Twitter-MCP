type HermesBackend = "auto" | "twitter" | "hermes";

type TweetLike = {
  id?: unknown;
  tweet_id?: unknown;
  tweetId?: unknown;
  text?: unknown;
  content?: unknown;
  full_text?: unknown;
  author_id?: unknown;
  authorId?: unknown;
  created_at?: unknown;
  createdAt?: unknown;
  author?: {
    id?: unknown;
    username?: unknown;
    name?: unknown;
  };
  public_metrics?: unknown;
  metrics?: unknown;
};

function getHermesApiKey(): string {
  return process.env.HERMES_TWEET_API_KEY || process.env.XQUIK_API_KEY || "";
}

function getHermesBaseUrl(): string {
  return (process.env.XQUIK_BASE_URL || "https://xquik.com").replace(/\/+$/, "");
}

function hasTwitterCredentials(): boolean {
  return Boolean(
    process.env.X_API_KEY &&
      process.env.X_API_SECRET &&
      process.env.X_ACCESS_TOKEN &&
      process.env.X_ACCESS_TOKEN_SECRET,
  );
}

export function shouldUseHermesTweetSearch(): boolean {
  const backend = (process.env.X_READ_BACKEND || "auto").trim().toLowerCase() as HermesBackend;
  if (backend === "hermes") return true;
  if (backend === "twitter") return false;
  return Boolean(getHermesApiKey()) && !hasTwitterCredentials();
}

function buildHermesUrl(path: string): string {
  const baseUrl = getHermesBaseUrl();
  const normalizedPath = path.replace(/^\/+/, "");
  if (baseUrl.endsWith("/api/v1") && normalizedPath.startsWith("api/v1/")) {
    return `${baseUrl}/${normalizedPath.slice("api/v1/".length)}`;
  }
  return `${baseUrl}/${normalizedPath}`;
}

function buildHermesHeaders(apiKey: string): Record<string, string> {
  if (apiKey.startsWith("xq_")) {
    return { "x-api-key": apiKey };
  }
  return { Authorization: `Bearer ${apiKey}` };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function extractTweets(payload: unknown): TweetLike[] {
  if (Array.isArray(payload)) return payload.filter((item): item is TweetLike => Boolean(asRecord(item)));

  const queue: unknown[] = [payload];
  for (const item of queue) {
    const record = asRecord(item);
    if (!record) continue;
    for (const key of ["tweets", "data", "results", "items"]) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value.filter((entry): entry is TweetLike => Boolean(asRecord(entry)));
      }
      if (asRecord(value)) {
        queue.push(value);
      }
    }
  }
  return [];
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function normalizeTweet(tweet: TweetLike): Record<string, unknown> {
  const author = asRecord(tweet.author);
  const metrics = asRecord(tweet.public_metrics) || asRecord(tweet.metrics) || {};
  return {
    id: stringOrUndefined(tweet.id) || stringOrUndefined(tweet.tweet_id) || stringOrUndefined(tweet.tweetId),
    text: stringOrUndefined(tweet.text) || stringOrUndefined(tweet.content) || stringOrUndefined(tweet.full_text),
    author_id:
      stringOrUndefined(tweet.author_id) ||
      stringOrUndefined(tweet.authorId) ||
      stringOrUndefined(author?.id),
    created_at: stringOrUndefined(tweet.created_at) || stringOrUndefined(tweet.createdAt),
    public_metrics: metrics,
    author: author
      ? {
          id: stringOrUndefined(author.id),
          username: stringOrUndefined(author.username),
          name: stringOrUndefined(author.name),
        }
      : undefined,
  };
}

export async function searchTweetsWithHermesTweet(
  query: string,
  maxResults = 10,
): Promise<Record<string, unknown>> {
  const apiKey = getHermesApiKey();
  if (!apiKey) {
    throw new Error("Missing HERMES_TWEET_API_KEY or XQUIK_API_KEY for Hermes Tweet search.");
  }

  const url = new URL(buildHermesUrl("/api/v1/x/tweets/search"));
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(Math.min(Math.max(maxResults, 10), 100)));

  const response = await fetch(url, {
    headers: buildHermesHeaders(apiKey),
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = { text: await response.text() };
  }

  if (!response.ok) {
    return {
      backend: "hermes_tweet",
      success: false,
      status: response.status,
      response: payload,
    };
  }

  const tweets = extractTweets(payload).map(normalizeTweet);
  return {
    backend: "hermes_tweet",
    data: tweets,
    meta: { result_count: tweets.length },
  };
}
