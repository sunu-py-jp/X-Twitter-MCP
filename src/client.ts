import { TwitterApi } from "twitter-api-v2";

let client: InstanceType<typeof TwitterApi> | null = null;
let cachedUserId: string | null = null;

export function getClient(): InstanceType<typeof TwitterApi> {
  if (client) return client;

  const appKey = process.env.X_API_KEY;
  const appSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_TOKEN_SECRET;

  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    throw new Error(
      "Missing Twitter API credentials. Set X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET environment variables."
    );
  }

  client = new TwitterApi({
    appKey,
    appSecret,
    accessToken,
    accessSecret,
  });

  return client;
}

export async function getMyUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId;
  const me = await getClient().v2.me();
  cachedUserId = me.data.id;
  return cachedUserId;
}
