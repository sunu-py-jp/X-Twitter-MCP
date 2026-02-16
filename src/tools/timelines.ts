import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient } from "../client.js";
import { formatResponse, formatError } from "../utils/helpers.js";

export function registerTimelineGetTools(server: McpServer): void {
  server.registerTool(
    "get_home_timeline",
    {
      description: "Get home timeline",
      inputSchema: {
        max_results: z.number().min(1).max(100).optional().describe("Maximum number of tweets to return (1-100, default 20)"),
        next_token: z.string().optional().describe("Pagination token for next page of results"),
      },
    },
    async ({ max_results = 20, next_token }) => {
      try {
        const client = getClient();
        const options: any = {
          max_results,
          "tweet.fields": "created_at,public_metrics,author_id,conversation_id,referenced_tweets",
          expansions: "author_id,referenced_tweets.id",
          "user.fields": "name,username,verified",
        };
        if (next_token) options.pagination_token = next_token;
        const result = await client.v2.homeTimeline(options);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_user_tweets",
    {
      description: "Get a user's tweets",
      inputSchema: {
        user_id: z.string().describe("The user ID to get tweets from"),
        max_results: z.number().min(5).max(100).optional().describe("Maximum number of tweets to return (5-100, default 10)"),
        next_token: z.string().optional().describe("Pagination token for next page of results"),
      },
    },
    async ({ user_id, max_results = 10, next_token }) => {
      try {
        const client = getClient();
        const options: any = {
          max_results,
          "tweet.fields": "created_at,public_metrics,author_id,conversation_id,referenced_tweets",
          expansions: "author_id,referenced_tweets.id",
          "user.fields": "name,username",
        };
        if (next_token) options.pagination_token = next_token;
        const result = await client.v2.userTimeline(user_id, options);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_user_mentions",
    {
      description: "Get a user's mentions",
      inputSchema: {
        user_id: z.string().describe("The user ID to get mentions for"),
        max_results: z.number().min(5).max(100).optional().describe("Maximum number of mentions to return (5-100, default 10)"),
        next_token: z.string().optional().describe("Pagination token for next page of results"),
      },
    },
    async ({ user_id, max_results = 10, next_token }) => {
      try {
        const client = getClient();
        const options: any = {
          max_results,
          "tweet.fields": "created_at,public_metrics,author_id,conversation_id",
          expansions: "author_id",
          "user.fields": "name,username",
        };
        if (next_token) options.pagination_token = next_token;
        const result = await client.v2.userMentionTimeline(user_id, options);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
