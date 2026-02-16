import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient } from "../client.js";
import { formatResponse, formatError } from "../utils/helpers.js";

export function registerUsageGetTools(server: McpServer): void {
  // ── 取得 ──

  server.registerTool(
    "get_api_usage",
    {
      description: "Get current API usage/rate limit status",
    },
    async () => {
      try {
        const client = getClient();
        const me = await client.v2.me();
        const rateLimit = (me as any).rateLimit as { limit: number; remaining: number; reset: number } | undefined;

        return formatResponse({
          user: me.data,
          rate_limit: rateLimit ? {
            limit: rateLimit.limit,
            remaining: rateLimit.remaining,
            reset: rateLimit.reset,
            reset_at: new Date(rateLimit.reset * 1000).toISOString(),
          } : "Rate limit info not available",
        });
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
